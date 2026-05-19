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

describe("Administrador — fluxo de confirmação e entrega de pedido", () => {
    let orderId;
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
                                            orderId = orderRes.body.order_id;
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

    it("deve confirmar o pagamento: em_processamento → em_transito", () => {
        cy.wait(STEP_PAUSE);
        cy.get("#status-filter").select("em_processamento");
        cy.wait(STEP_PAUSE);
        cy.contains(`#${String(orderId).padStart(2, "0")}`)
            .closest(".table-row")
            .within(() => {
                cy.get(".status-badge").should("contain", "Em processamento");
                cy.get(".action-btn[aria-label='Editar']").click();
            });
        cy.wait(STEP_PAUSE);
        cy.get("#edit-order-modal").should("be.visible");
        cy.wait(STEP_PAUSE);
        cy.get("#modal-order-status-select").select("em_transito");
        cy.wait(STEP_PAUSE);
        cy.get("#modal-btn-salvar").click();
        cy.wait(STEP_PAUSE);
        cy.contains(`#${String(orderId).padStart(2, "0")}`)
            .closest(".table-row")
            .within(() => {
                cy.get(".status-badge").should("contain", "Em trânsito");
            });
    });

    it("deve confirmar a entrega: em_transito → entregue", () => {
        cy.wait(STEP_PAUSE);
        cy.get("#status-filter").select("em_transito");
        cy.wait(STEP_PAUSE);
        cy.contains(`#${String(orderId).padStart(2, "0")}`)
            .closest(".table-row")
            .within(() => {
                cy.get(".status-badge").should("contain", "Em trânsito");
                cy.get(".action-btn[aria-label='Editar']").click();
            });
        cy.wait(STEP_PAUSE);
        cy.get("#edit-order-modal").should("be.visible");
        cy.wait(STEP_PAUSE);
        cy.get("#modal-order-status-select").select("entregue");
        cy.wait(STEP_PAUSE);
        cy.get("#modal-btn-salvar").click();
        cy.wait(STEP_PAUSE);
        cy.contains(`#${String(orderId).padStart(2, "0")}`)
            .closest(".table-row")
            .within(() => {
                cy.get(".status-badge").should("contain", "Entregue");
            });
    });
});
