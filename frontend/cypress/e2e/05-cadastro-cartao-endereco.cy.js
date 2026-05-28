/// <reference types="cypress" />

const API_URL = "http://localhost:3333/api";
const CLIENT_EMAIL = "arthur@lume.com";
const CLIENT_PASSWORD = "12345678";
const TOKEN_KEY = "@lume:accessToken";
const USER_KEY = "@lume:user";

const TYPING_DELAY = 70;
const STEP_PAUSE = 2000;

const UNIQUE_CARD_NUMBER = `4${Date.now().toString().slice(-15)}`;

describe("Cadastro de endereço e cartão durante o checkout", () => {
    let authToken;
    let authUser;

    before(() => {
        cy.visit("/pages/login.html");
        cy.get("#email").clear().type(CLIENT_EMAIL, { delay: TYPING_DELAY });
        cy.get("#senha").clear().type(CLIENT_PASSWORD, { delay: TYPING_DELAY });
        cy.get(".book-card__btn").click();
        cy.url({ timeout: 10000 }).should(
            "eq",
            Cypress.config().baseUrl + "/",
        );

        cy.window().then((win) => {
            authToken = win.localStorage.getItem(TOKEN_KEY);
            const raw = win.localStorage.getItem(USER_KEY);
            if (raw) authUser = JSON.parse(raw);
        });

        cy.then(() => {
            cy.addBookToCart(authToken);
        });
    });

    beforeEach(() => {
        cy.visit("/");
        cy.window().then((win) => {
            win.localStorage.setItem(TOKEN_KEY, authToken);
            if (authUser) {
                win.localStorage.setItem(USER_KEY, JSON.stringify(authUser));
            }
        });
    });

    it("deve cadastrar novo endereço de entrega clicando em Adicionar no carrinho", () => {
        cy.visit("/pages/client/cart.html");
        cy.wait(STEP_PAUSE);

        cy.get(
            "a.cart-add-link[href='/pages/client/addresses/create/index.html']",
        ).click();
        cy.wait(STEP_PAUSE);

        cy.url({ timeout: 8000 }).should(
            "include",
            "/pages/client/addresses/create/index.html",
        );
        cy.wait(STEP_PAUSE);

        cy.get("#tipo_endereco").select("entrega");
        cy.wait(STEP_PAUSE);

        cy.get("#tipo_logradouro").select("Rua");
        cy.wait(STEP_PAUSE);

        cy.get("#logradouro")
            .clear()
            .type("Avenida Paulista", { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);

        cy.get("#numero").clear().type("1001", { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);

        cy.get("#bairro").clear().type("Bela Vista", { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);

        cy.get("#cep").clear().type("01310100", { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);

        cy.get("#cidade").clear().type("Sao Paulo", { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);

        cy.get("#estado").select("SP");
        cy.wait(STEP_PAUSE);

        cy.on("window:confirm", () => true);
        cy.on("window:alert", () => {});

        cy.get("button[type='submit']").click();
        cy.wait(STEP_PAUSE);

        cy.url({ timeout: 10000 }).should(
            "include",
            "/pages/client/addresses/index.html",
        );
    });

    it("deve cadastrar novo cartão de crédito clicando em Cadastre um novo no carrinho", () => {
        cy.visit("/pages/client/cart.html");
        cy.wait(STEP_PAUSE);

        cy.contains("a", "Cadastre um novo").click();
        cy.wait(STEP_PAUSE);

        cy.url({ timeout: 8000 }).should(
            "include",
            "/pages/client/cards/create/index.html",
        );
        cy.wait(STEP_PAUSE);

        cy.get("#numero_cartao")
            .clear()
            .type(UNIQUE_CARD_NUMBER.replace(/\D/g, ""), {
                delay: TYPING_DELAY,
            });
        cy.wait(STEP_PAUSE);

        cy.get("#nome_impresso")
            .clear()
            .type("cypress", { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);

        cy.get("#cvv").clear().type("123", { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);

        cy.get("#vencimento").clear().type("12/28", { delay: TYPING_DELAY });
        cy.wait(STEP_PAUSE);

        cy.get("#bandeira").select("Visa");
        cy.wait(STEP_PAUSE);

        cy.on("window:confirm", () => true);
        cy.on("window:alert", () => {});

        cy.get("button[type='submit']").click();
        cy.wait(STEP_PAUSE);

        cy.url({ timeout: 10000 }).should(
            "include",
            "/pages/client/cards/index.html",
        );
    });

    it("deve finalizar compra com endereço e cartão recém-cadastrados", () => {
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
                cy.get("#select-address").select($opts.last().val());
            });
        cy.wait(STEP_PAUSE);

        cy.get(".card-select")
            .first()
            .find("option")
            .should("have.length.at.least", 2)
            .then(($opts) => {
                cy.get(".card-select").first().select($opts.last().val());
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
