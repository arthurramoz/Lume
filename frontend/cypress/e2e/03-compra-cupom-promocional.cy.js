/// <reference types="cypress" />

const API_URL = "http://localhost:3333/api";
const CLIENT_EMAIL = "arthur@lume.com";
const CLIENT_PASSWORD = "12345678";
const TOKEN_KEY = "@lume:accessToken";

const TYPING_DELAY = 80;
const STEP_PAUSE = 2000;

describe("Compra com cupom promocional", () => {
    let authToken;
    let promoCouponCode;

    before(() => {
        cy.request("POST", `${API_URL}/auth/login`, {
            email: CLIENT_EMAIL,
            password: CLIENT_PASSWORD,
        }).then((res) => {
            expect(res.status).to.eq(200);
            authToken = res.body.token;

            // Find an available promo coupon the user hasn't used yet
            cy.request({
                method: "GET",
                url: `${API_URL}/coupons`,
                headers: { Authorization: `Bearer ${authToken}` },
            }).then((couponsRes) => {
                const available = couponsRes.body.filter(
                    (c) =>
                        c.type === "promocional" &&
                        !c.is_used &&
                        !c.user_has_used,
                );
                expect(
                    available.length,
                    "Deve haver ao menos 1 cupom promocional disponível",
                ).to.be.greaterThan(0);
                promoCouponCode = available[0].code;

                cy.clearCart(authToken);
                cy.addBookToCart(authToken);
            });
        });
    });

    it("deve aplicar cupom promocional e reduzir o total da compra", () => {
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

        cy.get("#summary-total")
            .invoke("text")
            .then((totalAntes) => {
                cy.get("#coupon-input")
                    .clear()
                    .type(promoCouponCode, { delay: TYPING_DELAY });
                cy.wait(STEP_PAUSE);

                cy.get("#btn-apply-coupon").click();
                cy.wait(STEP_PAUSE);

                cy.get("#coupon-msg")
                    .should("be.visible")
                    .and("contain", "Cupom aplicado");

                cy.get("#summary-total")
                    .invoke("text")
                    .should("not.eq", totalAntes);

                cy.wait(STEP_PAUSE);
            });

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
