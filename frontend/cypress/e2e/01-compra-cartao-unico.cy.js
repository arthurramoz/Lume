/// <reference types="cypress" />

const API_URL = "http://localhost:3333/api";
const CLIENT_EMAIL = "arthur@lume.com";
const CLIENT_PASSWORD = "12345678";
const TOKEN_KEY = "@lume:accessToken";

const TYPING_DELAY = 80;
const STEP_PAUSE = 2000;

describe("Compra com cartão de crédito único", () => {
    let authToken;

    before(() => {
        cy.request("POST", `${API_URL}/auth/login`, {
            email: CLIENT_EMAIL,
            password: CLIENT_PASSWORD,
        }).then((res) => {
            expect(res.status).to.eq(200);
            authToken = res.body.token;
            cy.clearCart(authToken);
            cy.addBookToCart(authToken);
        });
    });

    it("deve realizar a compra com um cartão e redirecionar para pedidos", () => {
        cy.visit("/pages/login.html");
        cy.wait(STEP_PAUSE);

        cy.get("#email").clear().type(CLIENT_EMAIL, { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);

        cy.get("#senha").clear().type(CLIENT_PASSWORD, { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);

        cy.get(".book-card__btn").click();
        cy.wait(STEP_PAUSE);

        cy.url({ timeout: 10000 }).should(
            "eq",
            Cypress.config().baseUrl + "/",
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

        cy.get(".card-select")
            .first()
            .find("option")
            .should("have.length.at.least", 2)
            .then(($opts) => {
                cy.get(".card-select").first().select($opts.eq(1).val());
            });
        cy.wait(STEP_PAUSE);

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
