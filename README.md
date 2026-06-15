# 🗄️ Estrutura do Banco de Dados — Lume

**Banco:** PostgreSQL  
**Total de tabelas:** 16  

Abaixo está o script DDL completo de criação de todas as tabelas, organizadas por domínio.

---

## 👤 Usuários

### `users`

Armazena os **dados cadastrais** dos clientes da plataforma, incluindo informações pessoais, contato e credenciais de acesso.

```sql
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
```

---

### `addresses`

Armazena os **endereços** vinculados a um usuário. Cada endereço pode ser marcado como endereço de **cobrança**, de **entrega**, ou ambos.

```sql
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
```

---

### `credit_cards`

Armazena os **cartões de crédito** cadastrados pelo usuário para realizar pagamentos na plataforma.

```sql
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
```

---

## 📖 Catálogo

### `authors`

Cadastro dos **autores** dos livros disponíveis no catálogo.

```sql
CREATE TABLE IF NOT EXISTS authors (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

### `genres`

Cadastro dos **gêneros literários** utilizados para classificar os livros (ex.: Aventura, Fábula, Fantasia, Poesia).

```sql
CREATE TABLE IF NOT EXISTS genres (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

### `books`

Tabela principal do **catálogo de livros**, com informações como título, preço, estoque, capa e vínculos com autor e gênero.

```sql
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
```

---

## 🛒 Carrinho

### `carts`

Representa o **carrinho de compras** de cada usuário. Um carrinho pode estar com status **aberto** (em uso) ou **finalizado** (após a compra).

```sql
CREATE TABLE IF NOT EXISTS carts (
    id              SERIAL          PRIMARY KEY,
    user_id         INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(20)     DEFAULT 'aberto',
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

### `cart_items`

Armazena os **itens adicionados ao carrinho**, relacionando cada livro com a quantidade desejada.

```sql
CREATE TABLE IF NOT EXISTS cart_items (
    id              SERIAL          PRIMARY KEY,
    cart_id         INTEGER         NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    book_id         INTEGER         NOT NULL REFERENCES books(id),
    quantity        INTEGER         NOT NULL DEFAULT 1,
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

## 📦 Pedidos

### `orders`

Registra os **pedidos realizados** pelos clientes. Cada pedido possui um status que acompanha seu ciclo de vida: `aguardando_pagamento` → `em_processamento` → `em_transito` → `entregue`. Também pode ser `cancelado` ou estar `em_troca`.

```sql
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
```

---

### `order_items`

Armazena os **itens de cada pedido**, registrando o livro, a quantidade e o **preço no momento da compra** (snapshot).

```sql
CREATE TABLE IF NOT EXISTS order_items (
    id              SERIAL          PRIMARY KEY,
    order_id        INTEGER         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    book_id         INTEGER         NOT NULL REFERENCES books(id),
    quantity        INTEGER         NOT NULL,
    price           NUMERIC(10,2)   NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

### `payments`

Registra os **pagamentos** vinculados aos pedidos, incluindo o cartão utilizado, valor e status do pagamento.

```sql
CREATE TABLE IF NOT EXISTS payments (
    id              SERIAL          PRIMARY KEY,
    order_id        INTEGER         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    card_id         INTEGER         REFERENCES credit_cards(id),
    amount          NUMERIC(10,2)   NOT NULL,
    payment_method  VARCHAR(30)     DEFAULT 'cartao',
    payment_status  VARCHAR(30)     DEFAULT 'aprovado',
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

## 🎟️ Cupons

### `coupons`

Armazena os **cupons de desconto** da plataforma. Podem ser do tipo **promocional** (criados pelo admin) ou **troca** (gerados automaticamente ao aprovar uma devolução).

```sql
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
```

---

### `coupon_usages`

Registra **qual usuário usou qual cupom**, evitando que um mesmo cupom seja utilizado mais de uma vez pelo mesmo cliente.

```sql
CREATE TABLE IF NOT EXISTS coupon_usages (
    id              SERIAL          PRIMARY KEY,
    coupon_id       INTEGER         NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id         INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

### `order_coupons`

Registra os **cupons efetivamente aplicados** em cada pedido, salvando o valor do desconto, código e tipo no momento do uso.

```sql
CREATE TABLE IF NOT EXISTS order_coupons (
    id              SERIAL          PRIMARY KEY,
    order_id        INTEGER         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    coupon_id       INTEGER         NOT NULL REFERENCES coupons(id),
    applied_value   NUMERIC(10,2)   NOT NULL,
    coupon_code     VARCHAR(50),
    coupon_type     VARCHAR(30),
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

## 🔄 Trocas e Frete

### `exchange_items`

Armazena os **itens solicitados para troca/devolução** dentro de um pedido, incluindo o motivo informado pelo cliente.

```sql
CREATE TABLE IF NOT EXISTS exchange_items (
    id              SERIAL          PRIMARY KEY,
    order_id        INTEGER         NOT NULL REFERENCES orders(id),
    order_item_id   INTEGER         NOT NULL REFERENCES order_items(id),
    reason          TEXT            NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

### `shipping_rates`

Tabela de **frete por estado** (UF). Utilizada para calcular o custo de envio com base no endereço de entrega do cliente.

```sql
CREATE TABLE IF NOT EXISTS shipping_rates (
    id              SERIAL          PRIMARY KEY,
    state           VARCHAR(2)      NOT NULL UNIQUE,
    rate            NUMERIC(10,2)   NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

## 📊 Resumo das Tabelas

| Domínio | Tabelas |
|---------|---------|
| **👤 Usuários** | `users` · `addresses` · `credit_cards` |
| **📖 Catálogo** | `authors` · `genres` · `books` |
| **🛒 Carrinho** | `carts` · `cart_items` |
| **📦 Pedidos** | `orders` · `order_items` · `payments` |
| **🎟️ Cupons** | `coupons` · `coupon_usages` · `order_coupons` |
| **🔄 Trocas/Frete** | `exchange_items` · `shipping_rates` |
