/// <reference types="cypress" />

const API_URL = "http://localhost:3333/api";
const CLIENT_EMAIL = "arthur@lume.com";
const CLIENT_PASSWORD = "12345678";
const TOKEN_KEY = "@lume:accessToken";

const STEP_PAUSE = 2000;

describe("Compra com cupom de troca cobrindo 100% do valor", () => {
    let authToken;
    let exchangeCoupon;

    before(() => {
        cy.request("POST", `${API_URL}/auth/login`, {
            email: CLIENT_EMAIL,
            password: CLIENT_PASSWORD,
        }).then((res) => {
            expect(res.status).to.eq(200);
            authToken = res.body.token;

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

                cy.request("GET", `${API_URL}/books`).then((booksRes) => {
                    const affordable = booksRes.body.filter(
                        (b) =>
                            b.stock_quantity > 0 &&
                            Number(b.price) <= Number(exchangeCoupon.value),
                    );
                    expect(
                        affordable.length,
                        "Deve haver livro com preço menor ou igual ao cupom",
                    ).to.be.greaterThan(0);

                    cy.request({
                        method: "POST",
                        url: `${API_URL}/cart`,
                        headers: { Authorization: `Bearer ${authToken}` },
                        body: { book_id: affordable[0].id, quantity: 1 },
                        failOnStatusCode: false,
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
