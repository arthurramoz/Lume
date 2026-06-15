-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                                                                            ║
-- ║                         📚  LUME  —  LIVRARIA ONLINE                       ║
-- ║                                                                            ║
-- ║                   Script de Criação do Banco de Dados (DDL)                ║
-- ║                            PostgreSQL  ·  v1.0                             ║
-- ║                                                                            ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝


-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │                        👤  DOMÍNIO: USUÁRIOS                               │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- ─── 1. users ───────────────────────────────────────────────────────────────────
-- Armazena os dados cadastrais dos clientes da plataforma.
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL          PRIMARY KEY,
    gender          VARCHAR(20),
    full_name       VARCHAR(255)    NOT NULL,
    birth_date      DATE,
    cpf             VARCHAR(14)     UNIQUE NOT NULL,
    phone_type      VARCHAR(20),
    phone_ddd       VARCHAR(3),
    phone_number    VARCHAR(15),
    email           VARCHAR(255)    UNIQUE NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    status          VARCHAR(20)     DEFAULT 'ativo',
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ─── 2. addresses ───────────────────────────────────────────────────────────────
-- Endereços vinculados a um usuário (cobrança e/ou entrega).
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS addresses (
    id              SERIAL          PRIMARY KEY,
    user_id         INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alias           VARCHAR(100),
    residence_type  VARCHAR(50),
    street_type     VARCHAR(50),
    street_name     VARCHAR(255),
    street_number   VARCHAR(20),
    neighborhood    VARCHAR(100),
    zip_code        VARCHAR(10),
    city            VARCHAR(100),
    state           VARCHAR(2),
    country         VARCHAR(50)     DEFAULT 'Brasil',
    observations    TEXT,
    is_billing      BOOLEAN         DEFAULT FALSE,
    is_delivery     BOOLEAN         DEFAULT FALSE,
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ─── 3. credit_cards ────────────────────────────────────────────────────────────
-- Cartões de crédito cadastrados pelo usuário para pagamento.
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credit_cards (
    id              SERIAL          PRIMARY KEY,
    user_id         INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_number     VARCHAR(20)     NOT NULL,
    printed_name    VARCHAR(100)    NOT NULL,
    card_flag       VARCHAR(30)     NOT NULL,
    security_code   VARCHAR(4)      NOT NULL,
    expiration_date VARCHAR(6)      NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │                        📖  DOMÍNIO: CATÁLOGO                               │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- ─── 4. authors ─────────────────────────────────────────────────────────────────
-- Autores dos livros cadastrados no catálogo.
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS authors (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ─── 5. genres ──────────────────────────────────────────────────────────────────
-- Gêneros literários (Aventura, Fábula, Fantasia, etc.).
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS genres (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ─── 6. books ───────────────────────────────────────────────────────────────────
-- Catálogo de livros disponíveis para venda.
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS books (
    id               SERIAL         PRIMARY KEY,
    title            VARCHAR(255)   NOT NULL,
    description      TEXT,
    price            NUMERIC(10,2)  NOT NULL,
    cover_image      TEXT,
    publication_year INTEGER,
    isbn             VARCHAR(20),
    stock_quantity   INTEGER        DEFAULT 0,
    cost_value       NUMERIC(10,2),
    author_id        INTEGER        REFERENCES authors(id),
    genre_id         INTEGER        REFERENCES genres(id),
    created_at       TIMESTAMP      DEFAULT NOW()
);


-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │                        🛒  DOMÍNIO: CARRINHO                               │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- ─── 7. carts ───────────────────────────────────────────────────────────────────
-- Carrinho de compras do usuário. Status: 'aberto' ou 'finalizado'.
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS carts (
    id              SERIAL          PRIMARY KEY,
    user_id         INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(20)     DEFAULT 'aberto',
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ─── 8. cart_items ──────────────────────────────────────────────────────────────
-- Itens adicionados ao carrinho (livro + quantidade).
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cart_items (
    id              SERIAL          PRIMARY KEY,
    cart_id         INTEGER         NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    book_id         INTEGER         NOT NULL REFERENCES books(id),
    quantity        INTEGER         NOT NULL DEFAULT 1,
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │                        📦  DOMÍNIO: PEDIDOS                                │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- ─── 9. orders ──────────────────────────────────────────────────────────────────
-- Pedidos realizados pelos clientes.
-- Status: aguardando_pagamento | em_processamento | em_transito
--         entregue | cancelado | em_troca
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
    id              SERIAL          PRIMARY KEY,
    user_id         INTEGER         NOT NULL REFERENCES users(id),
    address_id      INTEGER         REFERENCES addresses(id),
    coupon_id       INTEGER,
    total_amount    NUMERIC(10,2)   NOT NULL,
    freight         NUMERIC(10,2)   DEFAULT 0,
    status          VARCHAR(30)     DEFAULT 'aguardando_pagamento',
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ─── 10. order_items ────────────────────────────────────────────────────────────
-- Itens que compõem cada pedido (livro, quantidade e preço no momento da compra).
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_items (
    id              SERIAL          PRIMARY KEY,
    order_id        INTEGER         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    book_id         INTEGER         NOT NULL REFERENCES books(id),
    quantity        INTEGER         NOT NULL,
    price           NUMERIC(10,2)   NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ─── 11. payments ───────────────────────────────────────────────────────────────
-- Pagamentos vinculados aos pedidos.
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
    id              SERIAL          PRIMARY KEY,
    order_id        INTEGER         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    card_id         INTEGER         REFERENCES credit_cards(id),
    amount          NUMERIC(10,2)   NOT NULL,
    payment_method  VARCHAR(30)     DEFAULT 'cartao',
    payment_status  VARCHAR(30)     DEFAULT 'aprovado',
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │                        🎟️  DOMÍNIO: CUPONS                                 │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- ─── 12. coupons ────────────────────────────────────────────────────────────────
-- Cupons de desconto. Tipos: 'promocional' ou 'troca'.
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coupons (
    id              SERIAL          PRIMARY KEY,
    code            VARCHAR(50)     UNIQUE NOT NULL,
    type            VARCHAR(30)     NOT NULL,
    value           NUMERIC(10,2)   NOT NULL,
    is_used         BOOLEAN         DEFAULT FALSE,
    expires_at      TIMESTAMP,
    user_id         INTEGER         REFERENCES users(id),
    order_id        INTEGER         REFERENCES orders(id),
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ─── 13. coupon_usages ──────────────────────────────────────────────────────────
-- Registro de uso de cupons por usuário (evita uso duplicado).
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coupon_usages (
    id              SERIAL          PRIMARY KEY,
    coupon_id       INTEGER         NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id         INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ─── 14. order_coupons ──────────────────────────────────────────────────────────
-- Cupons efetivamente aplicados em cada pedido (valor e tipo no momento do uso).
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_coupons (
    id              SERIAL          PRIMARY KEY,
    order_id        INTEGER         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    coupon_id       INTEGER         NOT NULL REFERENCES coupons(id),
    applied_value   NUMERIC(10,2)   NOT NULL,
    coupon_code     VARCHAR(50),
    coupon_type     VARCHAR(30),
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │                        🔄  DOMÍNIO: TROCAS & FRETE                         │
-- └──────────────────────────────────────────────────────────────────────────────┘

-- ─── 15. exchange_items ─────────────────────────────────────────────────────────
-- Itens solicitados para troca/devolução dentro de um pedido.
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exchange_items (
    id              SERIAL          PRIMARY KEY,
    order_id        INTEGER         NOT NULL REFERENCES orders(id),
    order_item_id   INTEGER         NOT NULL REFERENCES order_items(id),
    reason          TEXT            NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ─── 16. shipping_rates ─────────────────────────────────────────────────────────
-- Tabela de frete por estado (UF).
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shipping_rates (
    id              SERIAL          PRIMARY KEY,
    state           VARCHAR(2)      NOT NULL UNIQUE,
    rate            NUMERIC(10,2)   NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);


-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                          ✅  SCRIPT FINALIZADO                             ║
-- ║                                                                            ║
-- ║   Total de tabelas: 16                                                     ║
-- ║   Banco: PostgreSQL                                                        ║
-- ║                                                                            ║
-- ║   👤 Usuários ─── users · addresses · credit_cards                         ║
-- ║   📖 Catálogo ─── authors · genres · books                                 ║
-- ║   🛒 Carrinho ─── carts · cart_items                                       ║
-- ║   📦 Pedidos  ─── orders · order_items · payments                          ║
-- ║   🎟️ Cupons   ─── coupons · coupon_usages · order_coupons                 ║
-- ║   🔄 Extras   ─── exchange_items · shipping_rates                          ║
-- ║                                                                            ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝
