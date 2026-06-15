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

describe("Solicitação de troca de pedido pelo cliente", () => {
    let deliveredOrderId;

    before(() => {
        cy.request("POST", `${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        }).then((adminRes) => {
            const adminToken = adminRes.body.token;
            cy.request("POST", `${API_URL}/auth/login`, {
                email: CLIENT_EMAIL,
                password: CLIENT_PASSWORD,
            }).then((clientRes) => {
                const clientToken = clientRes.body.token;
                cy.request("GET", `${API_URL}/books`).then((booksRes) => {
                    const book = booksRes.body.filter(
                        (b) => b.stock_quantity > 0,
                    )[0];
                    cy.request({
                        method: "POST",
                        url: `${API_URL}/cart`,
                        headers: { Authorization: `Bearer ${clientToken}` },
                        body: { book_id: book.id, quantity: 1 },
                        failOnStatusCode: false,
                    });
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
                                headers: {
                                    Authorization: `Bearer ${clientToken}`,
                                },
                            }).then((freightRes) => {
                                const freight =
                                    Number(freightRes.body.rate) || 0;
                                const total = Number(book.price) + freight;
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
                                            { card_id: card.id, amount: total },
                                        ],
                                    },
                                    failOnStatusCode: false,
                                }).then((orderRes) => {
                                    if (orderRes.status === 201) {
                                        deliveredOrderId =
                                            orderRes.body.order_id;
                                        cy.request({
                                            method: "PATCH",
                                            url: `${API_URL}/admin/orders/${deliveredOrderId}/status`,
                                            headers: {
                                                Authorization: `Bearer ${adminToken}`,
                                            },
                                            body: { status: "entregue" },
                                        });
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    beforeEach(() => {
        cy.visit("/pages/login.html");
        cy.wait(STEP_PAUSE);
        cy.get("#email").clear().type(CLIENT_EMAIL, { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);
        cy.get("#senha").clear().type(CLIENT_PASSWORD, { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);
        cy.get(".book-card__btn").click();
        cy.url({ timeout: 10000 }).should("eq", Cypress.config().baseUrl + "/");
    });

    it("deve exibir o pedido entregue e permitir solicitar troca", () => {
        cy.visit("/pages/client/orders/index.html");
        cy.wait(STEP_PAUSE);
        cy.get("#orders-list", { timeout: 15000 }).should(
            "not.contain",
            "Nenhum pedido",
        );
        cy.wait(STEP_PAUSE);
        cy.get("#filter-status").select("entregue");
        cy.wait(STEP_PAUSE);
        cy.get(
            "#orders-list .orders-table__row, #orders-list .table-row",
        ).should("have.length.at.least", 1);
        cy.wait(STEP_PAUSE);
        cy.get(".btn-exchange-order").first().click();
        cy.wait(STEP_PAUSE);
        cy.get("#modal-exchange", { timeout: 8000 }).should("be.visible");
        cy.wait(STEP_PAUSE);
        cy.get(".exchange-item__checkbox").first().check();
        cy.wait(STEP_PAUSE);
        cy.get("#exchange-reason")
            .clear()
            .type("Livro com defeito na impressão, páginas borradas.", {
                delay: TYPING_DELAY,
            });
        cy.wait(STEP_PAUSE);
        cy.on("window:alert", (str) => {
            expect(str).to.equal("Troca solicitada com sucesso!");
        });
        cy.get("#btn-submit-exchange").click();
        cy.wait(STEP_PAUSE);
        cy.get("#modal-exchange").should("not.be.visible");
        cy.wait(STEP_PAUSE);
        cy.get("#filter-status").select("em_troca");
        cy.wait(STEP_PAUSE);
        cy.get("#orders-list").should("contain", "Em troca");
    });
});
