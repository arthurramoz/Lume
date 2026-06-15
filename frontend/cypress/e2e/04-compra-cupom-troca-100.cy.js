/// <reference types="cypress" />

const API_URL = "http://localhost:3333/api";
const CLIENT_EMAIL = "arthur@lume.com";
const CLIENT_PASSWORD = "12345678";
const ADMIN_EMAIL = "admin@lume.com";
const ADMIN_PASSWORD = "12345678";
const TOKEN_KEY = "@lume:accessToken";

const STEP_PAUSE = 2000;

describe("Compra com cupom de troca cobrindo 100% do valor", () => {
    let authToken;
    let exchangeCoupon;

    before(() => {
        // Step 1: Login as Admin
        cy.request("POST", `${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        }).then((adminRes) => {
            const adminToken = adminRes.body.token;

            // Step 2: Login as Client
            cy.request("POST", `${API_URL}/auth/login`, {
                email: CLIENT_EMAIL,
                password: CLIENT_PASSWORD,
            }).then((clientRes) => {
                authToken = clientRes.body.token;

                // Step 3: Clear cart, add book, place order, deliver, exchange, conclude
                cy.clearCart(authToken);

                cy.request("GET", `${API_URL}/books`).then((booksRes) => {
                    const book = booksRes.body
                        .filter((b) => b.stock_quantity > 0)
                        .sort((a, b) => Number(b.price) - Number(a.price))[0];
                    cy.request({
                        method: "POST",
                        url: `${API_URL}/cart`,
                        headers: { Authorization: `Bearer ${authToken}` },
                        body: { book_id: book.id, quantity: 1 },
                    });

                    cy.request({
                        method: "GET",
                        url: `${API_URL}/addresses`,
                        headers: { Authorization: `Bearer ${authToken}` },
                    }).then((addrRes) => {
                        const address = addrRes.body.filter((a) => a.is_delivery)[0];

                        cy.request({
                            method: "GET",
                            url: `${API_URL}/cards`,
                            headers: { Authorization: `Bearer ${authToken}` },
                        }).then((cardsRes) => {
                            const card = cardsRes.body[0];

                            cy.request({
                                method: "GET",
                                url: `${API_URL}/shipping/${address.id}`,
                                headers: { Authorization: `Bearer ${authToken}` },
                            }).then((freightRes) => {
                                const freight = Number(freightRes.body.rate) || 0;
                                const total = Number(book.price) + freight;

                                // Create order
                                cy.request({
                                    method: "POST",
                                    url: `${API_URL}/orders`,
                                    headers: { Authorization: `Bearer ${authToken}` },
                                    body: {
                                        address_id: address.id,
                                        freight,
                                        cards: [{ card_id: card.id, amount: total }],
                                    },
                                }).then((orderRes) => {
                                    const exchangeOrderId = orderRes.body.order_id;

                                    // Mark as delivered
                                    cy.request({
                                        method: "PATCH",
                                        url: `${API_URL}/admin/orders/${exchangeOrderId}/status`,
                                        headers: { Authorization: `Bearer ${adminToken}` },
                                        body: { status: "entregue" },
                                    }).then(() => {
                                        // Request exchange
                                        cy.request({
                                            method: "GET",
                                            url: `${API_URL}/orders/${exchangeOrderId}`,
                                            headers: { Authorization: `Bearer ${authToken}` },
                                        }).then((orderDetailRes) => {
                                            const orderItems = orderDetailRes.body.items || [];
                                            const itemsToExchange = orderItems.map((item) => ({
                                                order_item_id: item.id,
                                            }));

                                            cy.request({
                                                method: "PUT",
                                                url: `${API_URL}/orders/${exchangeOrderId}/exchange`,
                                                headers: { Authorization: `Bearer ${authToken}` },
                                                body: {
                                                    reason: "Produto com avaria.",
                                                    items: itemsToExchange,
                                                },
                                            }).then(() => {
                                                // Conclude exchange (generates coupon)
                                                cy.request({
                                                    method: "PATCH",
                                                    url: `${API_URL}/admin/orders/${exchangeOrderId}/status`,
                                                    headers: { Authorization: `Bearer ${adminToken}` },
                                                    body: { status: "troca_concluida" },
                                                }).then(() => {
                                                    // Get the generated exchange coupon
                                                    cy.request({
                                                        method: "GET",
                                                        url: `${API_URL}/coupons/my`,
                                                        headers: { Authorization: `Bearer ${authToken}` },
                                                    }).then((couponsRes) => {
                                                        const available = couponsRes.body.filter(
                                                            (c) => !c.is_used && c.type === "troca",
                                                        );
                                                        expect(
                                                            available.length,
                                                            "Deve haver ao menos 1 cupom de troca disponível",
                                                        ).to.be.greaterThan(0);
                                                        exchangeCoupon = available[0];

                                                        // Add a book that can be paid fully with this coupon (price + freight <= coupon value)
                                                        cy.request({
                                                            method: "GET",
                                                            url: `${API_URL}/addresses`,
                                                            headers: { Authorization: `Bearer ${authToken}` },
                                                        }).then((addrRes2) => {
                                                            const deliveryAddr = addrRes2.body.filter((a) => a.is_delivery)[0];
                                                            cy.request({
                                                                method: "GET",
                                                                url: `${API_URL}/shipping/${deliveryAddr.id}`,
                                                                headers: { Authorization: `Bearer ${authToken}` },
                                                            }).then((freightRes2) => {
                                                                const cartFreight = Number(freightRes2.body.rate) || 0;

                                                                cy.request("GET", `${API_URL}/books`).then((booksRes2) => {
                                                                    const affordable = booksRes2.body
                                                                        .filter(
                                                                            (b) =>
                                                                                b.stock_quantity > 0 &&
                                                                                Number(b.price) + cartFreight <= Number(exchangeCoupon.value),
                                                                        )
                                                                        .sort((a, b) => Number(a.price) - Number(b.price));
                                                                    expect(
                                                                        affordable.length,
                                                                        "Deve haver livro com preço + frete menor ou igual ao cupom",
                                                                    ).to.be.greaterThan(0);

                                                                    cy.clearCart(authToken);
                                                                    cy.request({
                                                                        method: "POST",
                                                                        url: `${API_URL}/cart`,
                                                                        headers: { Authorization: `Bearer ${authToken}` },
                                                                        body: { book_id: affordable[0].id, quantity: 1 },
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it("deve desabilitar cartão e finalizar compra 100% com cupom de troca", () => {
        cy.visit("/");
        cy.window().then((win) =>
            win.localStorage.setItem(TOKEN_KEY, authToken),
        );

        cy.visit("/pages/client/cart.html");
        cy.wait(STEP_PAUSE);

        cy.get("#cart-items-container .cart-item", { timeout: 15000 }).should(
            "have.length.at.least",
            1,
        );
        cy.wait(STEP_PAUSE);

        cy.get("#select-address option")
            .should("have.length.at.least", 2)
            .then(($opts) => {
                cy.get("#select-address").select($opts.eq(1).val());
            });
        cy.wait(STEP_PAUSE);

        cy.get("#exchange-coupons-section", { timeout: 8000 }).should(
            "be.visible",
        );

        cy.get(`.exchange-coupon-check[data-id="${exchangeCoupon.id}"]`).check();
        cy.wait(STEP_PAUSE);

        cy.get("#summary-total").should("contain", "0,00");

        cy.get("#cards-list").should("have.css", "pointer-events", "none");

        cy.get("#btn-finalize", { timeout: 8000 }).should("not.be.disabled");
        cy.wait(STEP_PAUSE);

        cy.on("window:alert", (alertText) => {
            expect(alertText).to.equal("Compra finalizada com sucesso!");
        });

        cy.get("#btn-finalize").click();
        cy.wait(STEP_PAUSE);

        cy.url({ timeout: 15000 }).should(
            "include",
            "/pages/client/orders/index.html",
        );
    });
});
