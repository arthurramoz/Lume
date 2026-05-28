/// <reference types="cypress" />;

const API_URL = "http://localhost:3333/api";

const TEST_EMAIL = "arthur@lume.com";
const TEST_PASSWORD = "12345678";

const TYPING_DELAY = 80;

const STEP_PAUSE = 3000;

describe("Registro de pedido de venda com sucesso", () => {
    let authToken;

    before(() => {
        cy.request("POST", `${API_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        }).then((loginRes) => {
            expect(loginRes.status).to.eq(200);
            expect(loginRes.body).to.have.property("token");
            authToken = loginRes.body.token;

            cy.request("GET", `${API_URL}/books/cards`).then((booksRes) => {
                expect(booksRes.status).to.eq(200);
                const availableBooks = booksRes.body.filter(
                    (b) => b.stock_quantity > 0,
                );
                expect(availableBooks.length).to.be.greaterThan(0);

                const book = availableBooks[0];

                cy.request({
                    method: "POST",
                    url: `${API_URL}/cart`,
                    headers: { Authorization: `Bearer ${authToken}` },
                    body: { book_id: book.id, quantity: 1 },
                    failOnStatusCode: false,
                }).then((cartRes) => {
                    expect([201, 400]).to.include(cartRes.status);
                });
            });
        });
    });

    it("deve completar o pedido de venda com sucesso", () => {
        cy.visit("/pages/login.html");

        cy.wait(STEP_PAUSE);

        cy.get("#email").clear().type(TEST_EMAIL, { delay: TYPING_DELAY });

        cy.wait(STEP_PAUSE);

        cy.get("#senha").clear().type(TEST_PASSWORD, { delay: TYPING_DELAY });

        cy.wait(STEP_PAUSE);

        cy.get(".book-card__btn").click();

        cy.wait(STEP_PAUSE);

        cy.url({ timeout: 10000 }).should("eq", Cypress.config().baseUrl + "/");

        cy.wait(STEP_PAUSE);

        cy.visit("/pages/client/cart.html");

        cy.wait(STEP_PAUSE);

        cy.get("#cart-items-container .cart-item", { timeout: 15000 }).should(
            "have.length.at.least",
            1,
        );

        cy.wait(STEP_PAUSE);

        cy.get("#select-address option")
            .should("have.length.at.least", 2)
            .then(($options) => {
                const firstValue = $options.eq(1).val();
                cy.get("#select-address").select(firstValue);
            });

        cy.wait(3000);

        cy.get(".card-select")
            .first()
            .find("option")
            .should("have.length.at.least", 2)
            .then(($options) => {
                const firstCardValue = $options.eq(1).val();
                cy.get(".card-select").first().select(firstCardValue);
            });

        cy.wait(2000);

        cy.get("#btn-finalize", { timeout: 5000 }).should("not.be.disabled");

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
