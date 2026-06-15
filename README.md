# 💜 Lume — Livraria Infantil Online

**Lume** é uma livraria online brasileira especializada em **livros infantis**. Nosso site moderno traz um tema roxo encantador, pensado para tornar a experiência de compra fácil, acolhedora e divertida.

---

## 💜 Tecnologias Utilizadas

### Backend

| Tecnologia | Descrição |
|------------|-----------|
| **Node.js** | Runtime JavaScript para o servidor |
| **Express 5** | Framework web para criação da API REST |
| **PostgreSQL** | Banco de dados relacional |
| **pg** | Driver PostgreSQL para Node.js |
| **JWT** (`jsonwebtoken`) | Autenticação via tokens |
| **bcryptjs** | Hash seguro de senhas |
| **dotenv** | Gerenciamento de variáveis de ambiente |
| **cors** | Controle de acesso entre origens (CORS) |

### Frontend

| Tecnologia | Descrição |
|------------|-----------|
| **HTML5** | Estrutura das páginas |
| **CSS3** | Estilização com tema roxo 💜 |
| **JavaScript (Vanilla)** | Lógica e interatividade no navegador |

### Inteligência Artificial 🤖

| Tecnologia | Descrição |
|------------|-----------|
| **Groq SDK** | Integração com IA para o chatbot da Lume |
| **LLaMA 3.3 70B** | Modelo de linguagem utilizado pelo chatbot |

O chatbot **Lume** é um assistente virtual inteligente que recomenda livros infantis com base no histórico de compras do cliente e no catálogo disponível na loja.

### Testes

| Tecnologia | Descrição |
|------------|-----------|
| **Cypress** | Testes end-to-end automatizados do frontend |

### Deploy e Infraestrutura 🚀

| Serviço | Utilização |
|---------|------------|
| **Render** | Hospedagem do backend (API) e do banco PostgreSQL |
| **Vercel** | Hospedagem do frontend (site estático) |

---

## 💜 Como Rodar o Projeto

### Pré-requisitos

- **Node.js** (v18 ou superior)
- **npm**
- **PostgreSQL** (local ou remoto)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/Lume.git
cd Lume
```

### 2. Configure o banco de dados

Crie um banco PostgreSQL e execute o script de criação das tabelas:

```bash
psql -U seu_usuario -d lume_db -f backend/scripts/create_tables.sql
```

### 3. Configure as variáveis de ambiente

Crie o arquivo `backend/.env` com as seguintes variáveis:

```env
PORT=3333
DATABASE_URL=postgresql://usuario:senha@localhost:5432/lume_db
NODE_ENV=development
GROQ_API_KEY=sua_chave_groq
JWT_SECRET=sua_chave_secreta
```

### 4. Instale as dependências e inicie o backend

```bash
cd backend
npm install
npm start
```

O servidor estará rodando em `http://localhost:3333`

### 5. Popule o banco com dados iniciais (opcional)

```bash
node seed_books.js
node seed_genres.js
node seed_coupons.js
node seed_dashboard.js
```

### 6. Inicie o frontend

Abra o arquivo `frontend/index.html` com o **Live Server** (extensão do VS Code) ou qualquer servidor local na porta **5502**.

---

## 💜 Como Rodar os Testes (Cypress)

Para validar o funcionamento da plataforma com testes de ponta a ponta (E2E), você pode usar o Cypress:

### 1. Pré-requisitos
Certifique-se de que:
- O **backend** está rodando (`npm start` no diretório `/backend`).
- O **frontend** está ativo e servido no endereço `http://localhost:5502` (conforme configurado no Live Server).

### 2. Preparar o ambiente do frontend
Navegue até a pasta do frontend e instale as dependências:
```bash
cd frontend
npm install
```

### 3. Rodar os testes

*   **Modo Interativo (Painel do Cypress 🖥️):**
    ```bash
    npm run cypress:open
    ```
    Isso abrirá a interface visual do Cypress. Selecione **E2E Testing**, escolha o navegador desejado e clique no arquivo de teste (`.cy.js`) que deseja executar.

*   **Modo Headless (Execução direta no terminal 🧪):**
    ```bash
    npm run cypress:run
    ```

---

## 💜 Estrutura de Pastas

```
Lume/
├── backend/
│   ├── config/          # Configuração do banco de dados
│   ├── controllers/     # Lógica de negócio das rotas
│   ├── middlewares/      # Middleware de autenticação (JWT)
│   ├── models/dao/      # Camada de acesso a dados (DAOs)
│   ├── routes/          # Definição das rotas da API
│   ├── scripts/         # Scripts SQL e documentação do banco
│   ├── server.js        # Ponto de entrada da aplicação
│   ├── seed_*.js        # Scripts para popular o banco
│   └── .env             # Variáveis de ambiente
│
├── frontend/
│   ├── assets/          # Imagens e recursos estáticos
│   ├── css/             # Estilos CSS
│   ├── js/              # Scripts JavaScript
│   ├── pages/           # Páginas HTML (admin e cliente)
│   ├── cypress/         # Testes end-to-end
│   ├── index.html       # Página inicial da loja
│   └── vercel.json      # Configuração de deploy na Vercel
│
└── render.yaml          # Configuração de deploy no Render
```

---

## 💜 Rotas da API

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login do usuário |
| POST | `/api/auth/register` | Cadastro de novo usuário |

### Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/users` | Listar todos os usuários |
| GET | `/api/users/:id` | Buscar usuário por ID |
| PUT | `/api/users/:id` | Atualizar dados do usuário |
| PATCH | `/api/users/:id/status` | Ativar/inativar usuário |

### Endereços
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/addresses` | Cadastrar endereço |
| GET | `/api/addresses/:id` | Buscar endereço por ID |
| PUT | `/api/addresses/:id` | Atualizar endereço |
| DELETE | `/api/addresses/:id` | Remover endereço |

### Cartões
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/cards` | Cadastrar cartão |
| GET | `/api/cards` | Listar cartões |
| DELETE | `/api/cards/:id` | Remover cartão |

### Livros
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/books` | Listar livros (catálogo) |
| GET | `/api/books/:id` | Detalhes de um livro |
| GET | `/api/books/search` | Busca com filtros e paginação |

### Carrinho
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/cart` | Adicionar item ao carrinho |
| GET | `/api/cart` | Ver itens do carrinho |
| PUT | `/api/cart/:id` | Atualizar quantidade |
| DELETE | `/api/cart/:id` | Remover item |

### Pedidos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/orders` | Criar pedido |
| GET | `/api/orders` | Listar pedidos do usuário |
| GET | `/api/orders/:id` | Detalhes do pedido |
| POST | `/api/orders/:id/exchange` | Solicitar troca |

### Cupons
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/coupons` | Listar cupons do usuário |
| POST | `/api/coupons/validate` | Validar cupom |

### Frete
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/shipping/:state` | Calcular frete por estado |

### Chatbot 🤖
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/chatbot` | Enviar mensagem ao chatbot Lume |

### Admin — Pedidos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/orders` | Listar todos os pedidos |
| GET | `/api/admin/orders/:id` | Detalhes do pedido (admin) |
| PATCH | `/api/admin/orders/:id/status` | Atualizar status do pedido |

### Admin — Cupons
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/coupons` | Listar todos os cupons |
| PATCH | `/api/admin/coupons/:id/toggle` | Ativar/desativar cupom |

### Dashboard
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/dashboard/sales` | Vendas por gênero e período |

---

## 💜 Estrutura do Banco de Dados

**Banco:** PostgreSQL  
**Total de tabelas:** 16

---

### 👤 Usuários

#### `users`

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

#### `addresses`

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

#### `credit_cards`

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

### 📖 Catálogo

#### `authors`

Cadastro dos **autores** dos livros disponíveis no catálogo.

```sql
CREATE TABLE IF NOT EXISTS authors (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

#### `genres`

Cadastro dos **gêneros literários** utilizados para classificar os livros (ex.: Aventura, Fábula, Fantasia, Poesia).

```sql
CREATE TABLE IF NOT EXISTS genres (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    created_at      TIMESTAMP       DEFAULT NOW()
);
```

---

#### `books`

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

### 🛒 Carrinho

#### `carts`

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

#### `cart_items`

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

### 📦 Pedidos

#### `orders`

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

#### `order_items`

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

#### `payments`

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

### 🎟️ Cupons

#### `coupons`

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

#### `coupon_usages`

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

#### `order_coupons`

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

### 🔄 Trocas e Frete

#### `exchange_items`

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

#### `shipping_rates`

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

### 📊 Resumo das Tabelas

| Domínio | Tabelas |
|---------|---------|
| **👤 Usuários** | `users` · `addresses` · `credit_cards` |
| **📖 Catálogo** | `authors` · `genres` · `books` |
| **🛒 Carrinho** | `carts` · `cart_items` |
| **📦 Pedidos** | `orders` · `order_items` · `payments` |
| **🎟️ Cupons** | `coupons` · `coupon_usages` · `order_coupons` |
| **🔄 Trocas/Frete** | `exchange_items` · `shipping_rates` |

---

> 💜 *Feito com carinho pelo time Lume.*
