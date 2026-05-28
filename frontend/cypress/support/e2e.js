// ***********************************************************
// Comandos globais do Cypress
// ***********************************************************

const API_URL = "http://localhost:3333/api";
const TOKEN_KEY = "@lume:accessToken";
const USER_KEY = "@lume:user";

// Comando de login programático (sem passar pela UI)
Cypress.Commands.add("loginAs", (email, password) => {
    cy.request("POST", `${API_URL}/auth/login`, { email, password }).then(
        (res) => {
            expect(res.status).to.eq(200);
            cy.window().then((win) => {
                win.localStorage.setItem(TOKEN_KEY, res.body.token);
                win.localStorage.setItem(
                    USER_KEY,
                    JSON.stringify(res.body.user),
                );
            });
            return res.body;
        },
    );
});

// Adiciona livro ao carrinho via API
Cypress.Commands.add("addBookToCart", (token) => {
    cy.request("GET", `${API_URL}/books`).then((res) => {
        const available = res.body.filter((b) => b.stock_quantity > 0);
        expect(available.length).to.be.greaterThan(0);
        const book = available[0];
        cy.request({
            method: "POST",
            url: `${API_URL}/cart`,
            headers: { Authorization: `Bearer ${token}` },
            body: { book_id: book.id, quantity: 1 },
            failOnStatusCode: false,
        });
    });
});
