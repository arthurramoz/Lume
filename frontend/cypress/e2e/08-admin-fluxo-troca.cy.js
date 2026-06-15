/// <reference types="cypress" />

const API_URL = "http://localhost:3333/api";
const CLIENT_EMAIL = "arthur@lume.com";
const CLIENT_PASSWORD = "12345678";
const ADMIN_EMAIL = "admin@lume.com";
const ADMIN_PASSWORD = "12345678";
const TOKEN_KEY = "@lume:accessToken";
const USER_KEY = "@lume:user";

const TYPING_DELAY = 80;
const STEP_PAUSE = 2000;

describe("Administrador — fluxo de autorização e conclusão de troca", () => {
    let exchangeOrderId;
    let savedClientToken;
    let adminToken;
    let adminUser;

    before(() => {
        cy.visit("/pages/login.html");
        cy.wait(STEP_PAUSE);
        cy.get("#email").clear().type(ADMIN_EMAIL, { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);
        cy.get("#senha").clear().type(ADMIN_PASSWORD, { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);
        cy.get(".book-card__btn").click();
        cy.url({ timeout: 10000 }).should("include", "/pages/admin/");

        cy.window().then((win) => {
            adminToken = win.localStorage.getItem(TOKEN_KEY);
            const raw = win.localStorage.getItem(USER_KEY);
            if (raw) adminUser = JSON.parse(raw);
        });

        cy.then(() => {
            cy.request("POST", `${API_URL}/auth/login`, {
                email: CLIENT_EMAIL,
                password: CLIENT_PASSWORD,
            }).then((clientRes) => {
                const clientToken = clientRes.body.token;
                savedClientToken = clientToken;
                cy.addBookToCart(clientToken);
                cy.request({
                    method: "GET",
                    url: `${API_URL}/addresses`,
                    headers: { Authorization: `Bearer ${clientToken}` },
                }).then((addrRes) => {
                    const address = addrRes.body.filter(
                        (a) => a.is_delivery,
                    )[0];
                    cy.request({
                        method: "GET",
                        url: `${API_URL}/cards`,
                        headers: { Authorization: `Bearer ${clientToken}` },
                    }).then((cardsRes) => {
                        const card = cardsRes.body[0];
                        cy.request({
                            method: "GET",
                            url: `${API_URL}/shipping/${address.id}`,
                            headers: { Authorization: `Bearer ${clientToken}` },
                        }).then((freightRes) => {
                            cy.request("GET", `${API_URL}/books`).then(
                                (booksRes) => {
                                    const b = booksRes.body.filter(
                                        (b) => b.stock_quantity > 0,
                                    )[0];
                                    const freight =
                                        Number(freightRes.body.rate) || 0;
                                    const total = Number(b.price) + freight;
                                    cy.request({
                                        method: "POST",
                                        url: `${API_URL}/orders`,
                                        headers: {
                                            Authorization: `Bearer ${clientToken}`,
                                        },
                                        body: {
                                            address_id: address.id,
                                            freight,
                                            cards: [
                                                {
                                                    card_id: card.id,
                                                    amount: total,
                                                },
                                            ],
                                        },
                                        failOnStatusCode: false,
                                    }).then((orderRes) => {
                                        if (orderRes.status === 201) {
                                            exchangeOrderId =
                                                orderRes.body.order_id;
                                            cy.request({
                                                method: "PATCH",
                                                url: `${API_URL}/admin/orders/${exchangeOrderId}/status`,
                                                headers: {
                                                    Authorization: `Bearer ${adminToken}`,
                                                },
                                                body: { status: "entregue" },
                                            }).then(() => {
                                                cy.request({
                                                    method: "GET",
                                                    url: `${API_URL}/orders/${exchangeOrderId}`,
                                                    headers: {
                                                        Authorization: `Bearer ${clientToken}`,
                                                    },
                                                }).then((orderDetailRes) => {
                                                    const orderItems = orderDetailRes.body.items || [];
                                                    const itemsToExchange = orderItems.map((item) => ({
                                                        order_item_id: item.id,
                                                    }));

                                                    cy.request({
                                                        method: "PUT",
                                                        url: `${API_URL}/orders/${exchangeOrderId}/exchange`,
                                                        headers: {
                                                            Authorization: `Bearer ${clientToken}`,
                                                        },
                                                        body: {
                                                            reason: "Produto danificado.",
                                                            items: itemsToExchange,
                                                        },
                                                    });
                                                });
                                            });
                                        }
                                    });
                                },
                            );
                        });
                    });
                });
            });
        });
    });

    beforeEach(() => {
        cy.visit("/pages/admin/orders/index.html", {
            onBeforeLoad(win) {
                win.localStorage.setItem(TOKEN_KEY, adminToken);
                win.localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
            },
        });
        cy.wait(STEP_PAUSE);
        cy.get("#orders-table-body", { timeout: 15000 }).should("not.be.empty");
    });

    it("deve autorizar a troca solicitada pelo cliente", () => {
        cy.wait(STEP_PAUSE);
        cy.contains(`#${String(exchangeOrderId).padStart(2, "0")}`)
            .closest(".table-row")
            .within(() => {
                cy.get(".status-badge").should("contain", "Em troca");
                cy.get(".action-btn[aria-label='Editar']").click();
            });
        cy.wait(STEP_PAUSE);
        cy.get("#edit-order-modal").should("be.visible");
        cy.wait(STEP_PAUSE);
        cy.get("#modal-order-status-select").select("troca_autorizada");
        cy.wait(STEP_PAUSE);
        cy.get("#exchange-coupon-note").should("not.be.visible");
        cy.wait(STEP_PAUSE);
        cy.get("#modal-btn-salvar").click();
        cy.wait(STEP_PAUSE);
        cy.contains(`#${String(exchangeOrderId).padStart(2, "0")}`)
            .closest(".table-row")
            .within(() => {
                cy.get(".status-badge").should("contain", "Troca autorizada");
            });
    });

    it("deve exibir nota de cupom ao selecionar Troca concluída", () => {
        cy.wait(STEP_PAUSE);
        cy.contains(`#${String(exchangeOrderId).padStart(2, "0")}`)
            .closest(".table-row")
            .within(() => {
                cy.get(".action-btn[aria-label='Editar']").click();
            });
        cy.wait(STEP_PAUSE);
        cy.get("#edit-order-modal").should("be.visible");
        cy.wait(STEP_PAUSE);
        cy.get("#modal-order-status-select").select("troca_concluida");
        cy.wait(STEP_PAUSE);
        cy.get("#exchange-coupon-note").should("be.visible");
        cy.get("#exchange-coupon-value").should("not.be.empty");
        cy.wait(STEP_PAUSE);
        cy.get("#modal-btn-cancelar").click();
        cy.wait(STEP_PAUSE);
        cy.get("#edit-order-modal").should("not.exist");
    });

    it("deve concluir a troca e gerar cupom de troca para o cliente", () => {
        cy.wait(STEP_PAUSE);
        cy.contains(`#${String(exchangeOrderId).padStart(2, "0")}`)
            .closest(".table-row")
            .within(() => {
                cy.get(".action-btn[aria-label='Editar']").click();
            });
        cy.wait(STEP_PAUSE);
        cy.get("#modal-order-status-select").select("troca_concluida");
        cy.wait(STEP_PAUSE);
        cy.get("#exchange-coupon-note").should("be.visible");
        cy.wait(STEP_PAUSE);
        cy.get("#modal-btn-salvar").click();
        cy.wait(STEP_PAUSE);
        cy.contains(`#${String(exchangeOrderId).padStart(2, "0")}`)
            .closest(".table-row")
            .within(() => {
                cy.get(".status-badge").should("contain", "Troca conclu");
            });
        cy.wait(STEP_PAUSE);
        cy.request({
            method: "GET",
            url: `${API_URL}/coupons/my`,
            headers: { Authorization: `Bearer ${savedClientToken}` },
        }).then((couponsRes) => {
            const exchangeCoupons = couponsRes.body.filter(
                (c) => c.type === "troca" && !c.is_used,
            );
            expect(
                exchangeCoupons.length,
                "Cliente deve ter recebido cupom de troca",
            ).to.be.greaterThan(0);
        });
    });
});
