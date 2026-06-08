require("dotenv").config();
const pool = require("./config/database");
const bcrypt = require("bcryptjs");

// ─── Dados fictícios ─────────────────────────────────────────────────────────

const users = [
  {
    gender: "M",
    full_name: "Carlos Eduardo Mendes",
    birth_date: "1990-03-15",
    cpf: "123.456.789-00",
    phone_type: "celular",
    phone_ddd: "11",
    phone_number: "98765-4321",
    email: "carlos.mendes@email.com",
    password: "Senha@123",
  },
  {
    gender: "F",
    full_name: "Ana Paula Ferreira",
    birth_date: "1995-07-22",
    cpf: "234.567.890-11",
    phone_type: "celular",
    phone_ddd: "21",
    phone_number: "97654-3210",
    email: "ana.ferreira@email.com",
    password: "Senha@123",
  },
  {
    gender: "M",
    full_name: "Roberto Silva Neto",
    birth_date: "1988-11-05",
    cpf: "345.678.901-22",
    phone_type: "fixo",
    phone_ddd: "31",
    phone_number: "3322-1100",
    email: "roberto.neto@email.com",
    password: "Senha@123",
  },
  {
    gender: "F",
    full_name: "Juliana Costa Alves",
    birth_date: "1992-05-30",
    cpf: "456.789.012-33",
    phone_type: "celular",
    phone_ddd: "51",
    phone_number: "98877-6655",
    email: "juliana.alves@email.com",
    password: "Senha@123",
  },
  {
    gender: "M",
    full_name: "Marcos Antônio Lima",
    birth_date: "1985-09-18",
    cpf: "567.890.123-44",
    phone_type: "celular",
    phone_ddd: "41",
    phone_number: "99988-7766",
    email: "marcos.lima@email.com",
    password: "Senha@123",
  },
  {
    gender: "F",
    full_name: "Fernanda Rocha Santos",
    birth_date: "1998-01-12",
    cpf: "678.901.234-55",
    phone_type: "celular",
    phone_ddd: "71",
    phone_number: "91234-5678",
    email: "fernanda.santos@email.com",
    password: "Senha@123",
  },
  {
    gender: "M",
    full_name: "Thiago Oliveira Barros",
    birth_date: "1993-04-25",
    cpf: "789.012.345-66",
    phone_type: "celular",
    phone_ddd: "61",
    phone_number: "98765-1234",
    email: "thiago.barros@email.com",
    password: "Senha@123",
  },
  {
    gender: "F",
    full_name: "Camila Pereira Gomes",
    birth_date: "1997-08-09",
    cpf: "890.123.456-77",
    phone_type: "celular",
    phone_ddd: "19",
    phone_number: "97890-1234",
    email: "camila.gomes@email.com",
    password: "Senha@123",
  },
  {
    gender: "M",
    full_name: "Felipe Nascimento Cruz",
    birth_date: "1991-12-03",
    cpf: "901.234.567-88",
    phone_type: "celular",
    phone_ddd: "85",
    phone_number: "98901-2345",
    email: "felipe.cruz@email.com",
    password: "Senha@123",
  },
  {
    gender: "F",
    full_name: "Beatriz Martins Cardoso",
    birth_date: "1996-06-17",
    cpf: "012.345.678-99",
    phone_type: "celular",
    phone_ddd: "47",
    phone_number: "99012-3456",
    email: "beatriz.cardoso@email.com",
    password: "Senha@123",
  },
];

const addresses = [
  { alias: "Casa", residence_type: "casa", street_type: "Rua", street_name: "das Flores", street_number: "123", neighborhood: "Jardim Europa", zip_code: "01310-100", city: "São Paulo", state: "SP" },
  { alias: "Casa", residence_type: "apartamento", street_type: "Av", street_name: "Atlântica", street_number: "456", neighborhood: "Copacabana", zip_code: "22010-000", city: "Rio de Janeiro", state: "RJ" },
  { alias: "Trabalho", residence_type: "casa", street_type: "Rua", street_name: "dos Inconfidentes", street_number: "789", neighborhood: "Savassi", zip_code: "30140-120", city: "Belo Horizonte", state: "MG" },
  { alias: "Casa", residence_type: "casa", street_type: "Av", street_name: "Ipiranga", street_number: "321", neighborhood: "Centro", zip_code: "90160-092", city: "Porto Alegre", state: "RS" },
  { alias: "Casa", residence_type: "condominio", street_type: "Rua", street_name: "XV de Novembro", street_number: "654", neighborhood: "Bigorrilho", zip_code: "80020-310", city: "Curitiba", state: "PR" },
  { alias: "Casa", residence_type: "casa", street_type: "Rua", street_name: "da Bahia", street_number: "987", neighborhood: "Pituba", zip_code: "41830-021", city: "Salvador", state: "BA" },
  { alias: "Apartamento", residence_type: "apartamento", street_type: "SQN", street_name: "203 Bloco A", street_number: "12", neighborhood: "Asa Norte", zip_code: "70833-030", city: "Brasília", state: "DF" },
  { alias: "Casa", residence_type: "casa", street_type: "Av", street_name: "Brasil", street_number: "1500", neighborhood: "Cambuí", zip_code: "13025-001", city: "Campinas", state: "SP" },
  { alias: "Casa", residence_type: "casa", street_type: "Rua", street_name: "Meireles", street_number: "200", neighborhood: "Meireles", zip_code: "60165-050", city: "Fortaleza", state: "CE" },
  { alias: "Casa", residence_type: "apartamento", street_type: "Rua", street_name: "Visconde de Taunay", street_number: "350", neighborhood: "Victor Konder", zip_code: "89012-190", city: "Blumenau", state: "SC" },
];

const cards = [
  { card_number: "4111111111111111", printed_name: "CARLOS E MENDES", card_flag: "Visa", security_code: "123", expiration_date: "12/2027" },
  { card_number: "5500005555555559", printed_name: "ANA P FERREIRA", card_flag: "Mastercard", security_code: "456", expiration_date: "08/2026" },
  { card_number: "4012888888881881", printed_name: "ROBERTO S NETO", card_flag: "Visa", security_code: "789", expiration_date: "03/2028" },
  { card_number: "5555555555554444", printed_name: "JULIANA C ALVES", card_flag: "Mastercard", security_code: "321", expiration_date: "10/2027" },
  { card_number: "4111111111111111", printed_name: "MARCOS A LIMA", card_flag: "Visa", security_code: "654", expiration_date: "05/2026" },
  { card_number: "5105105105105100", printed_name: "FERNANDA R SANTOS", card_flag: "Mastercard", security_code: "987", expiration_date: "11/2028" },
  { card_number: "4012888888881881", printed_name: "THIAGO O BARROS", card_flag: "Visa", security_code: "147", expiration_date: "07/2027" },
  { card_number: "5500005555555559", printed_name: "CAMILA P GOMES", card_flag: "Mastercard", security_code: "258", expiration_date: "09/2026" },
  { card_number: "4111111111111111", printed_name: "FELIPE N CRUZ", card_flag: "Visa", security_code: "369", expiration_date: "01/2029" },
  { card_number: "5555555555554444", printed_name: "BEATRIZ M CARDOSO", card_flag: "Mastercard", security_code: "741", expiration_date: "04/2027" },
];

/**
 * Gera uma data aleatória entre dois offsets de dias atrás.
 * minDaysAgo e maxDaysAgo são relativos a hoje.
 */
function randomPastDate(minDaysAgo, maxDaysAgo) {
  const now = new Date();
  const days = Math.floor(Math.random() * (maxDaysAgo - minDaysAgo + 1)) + minDaysAgo;
  now.setDate(now.getDate() - days);
  // Hora aleatória
  now.setHours(Math.floor(Math.random() * 14) + 8);
  now.setMinutes(Math.floor(Math.random() * 60));
  return now;
}

/**
 * Retorna um status de pedido aleatório realista.
 * Pedidos mais antigos tendem a estar entregues.
 */
function randomStatus(daysAgo) {
  if (daysAgo > 30) return "entregue";
  if (daysAgo > 14) {
    const roll = Math.random();
    if (roll < 0.7) return "entregue";
    if (roll < 0.85) return "enviado";
    return "cancelado";
  }
  if (daysAgo > 7) {
    const roll = Math.random();
    if (roll < 0.4) return "entregue";
    if (roll < 0.7) return "enviado";
    if (roll < 0.85) return "processando";
    return "aguardando_pagamento";
  }
  const roll = Math.random();
  if (roll < 0.3) return "aguardando_pagamento";
  if (roll < 0.6) return "processando";
  if (roll < 0.8) return "enviado";
  return "entregue";
}

// ─── Função principal ─────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Iniciando seed de dashboard (usuários + pedidos)...\n");

  // 1. Buscar livros existentes
  const booksResult = await pool.query("SELECT id, price FROM books ORDER BY id");
  if (booksResult.rows.length === 0) {
    console.error("❌ Nenhum livro encontrado. Execute seed_books.js primeiro.");
    pool.end();
    return;
  }
  const books = booksResult.rows;
  console.log(`📚 ${books.length} livros encontrados no banco.\n`);

  const userIds = [];
  const addressIds = [];
  const cardIds = [];

  // 2. Inserir usuários
  console.log("👤 Inserindo usuários fictícios...");
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    try {
      // Verifica se já existe
      const exists = await pool.query("SELECT id FROM users WHERE email = $1", [u.email]);
      if (exists.rows.length > 0) {
        console.log(`  ⚠️  Usuário já existe: ${u.email} (id=${exists.rows[0].id})`);
        userIds.push(exists.rows[0].id);
        continue;
      }

      const hash = await bcrypt.hash(u.password, 10);
      const result = await pool.query(
        `INSERT INTO users (gender, full_name, birth_date, cpf, phone_type, phone_ddd, phone_number, email, password_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [u.gender, u.full_name, u.birth_date, u.cpf, u.phone_type, u.phone_ddd, u.phone_number, u.email, hash]
      );
      const uid = result.rows[0].id;
      userIds.push(uid);
      console.log(`  ✅ Usuário criado: ${u.full_name} (id=${uid})`);
    } catch (err) {
      console.log(`  ❌ Erro ao criar ${u.full_name}: ${err.message}`);
      userIds.push(null);
    }
  }

  // 3. Inserir endereços
  console.log("\n🏠 Inserindo endereços...");
  for (let i = 0; i < userIds.length; i++) {
    const uid = userIds[i];
    if (!uid) { addressIds.push(null); continue; }
    const a = addresses[i];
    try {
      const result = await pool.query(
        `INSERT INTO addresses (user_id, alias, residence_type, street_type, street_name, street_number, neighborhood, zip_code, city, state, country, observations, is_billing, is_delivery)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
        [uid, a.alias, a.residence_type, a.street_type, a.street_name, a.street_number, a.neighborhood, a.zip_code, a.city, a.state, "Brasil", null, true, true]
      );
      const aid = result.rows[0].id;
      addressIds.push(aid);
      console.log(`  ✅ Endereço criado para user_id=${uid} (id=${aid})`);
    } catch (err) {
      console.log(`  ❌ Erro ao criar endereço para user_id=${uid}: ${err.message}`);
      addressIds.push(null);
    }
  }

  // 4. Inserir cartões
  console.log("\n💳 Inserindo cartões de crédito...");
  for (let i = 0; i < userIds.length; i++) {
    const uid = userIds[i];
    if (!uid) { cardIds.push(null); continue; }
    const c = cards[i];
    try {
      const result = await pool.query(
        `INSERT INTO credit_cards (user_id, card_number, printed_name, card_flag, security_code, expiration_date)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [uid, c.card_number, c.printed_name, c.card_flag, c.security_code, c.expiration_date]
      );
      const cid = result.rows[0].id;
      cardIds.push(cid);
      console.log(`  ✅ Cartão criado para user_id=${uid} (id=${cid})`);
    } catch (err) {
      console.log(`  ❌ Erro ao criar cartão para user_id=${uid}: ${err.message}`);
      cardIds.push(null);
    }
  }

  // 5. Inserir pedidos com datas passadas
  console.log("\n🛒 Inserindo pedidos fictícios com datas passadas...");

  // Distribuição de pedidos ao longo de 1 ANO (365 dias)
  // Cada usuário terá pedidos espalhados em vários meses
  const ordersConfig = [
    // [userIndex, daysAgoMin, daysAgoMax, qtdPedidos]

    // ── Mês 12 (340–365 dias atrás) ──
    [0, 350, 365, 2],
    [1, 340, 360, 1],
    [3, 345, 365, 2],
    [6, 350, 362, 1],
    [9, 355, 365, 2],

    // ── Mês 11 (310–340 dias atrás) ──
    [0, 315, 335, 1],
    [2, 310, 330, 2],
    [4, 320, 340, 1],
    [7, 312, 338, 2],
    [8, 318, 340, 1],

    // ── Mês 10 (280–310 dias atrás) ──
    [1, 285, 308, 2],
    [3, 280, 305, 1],
    [5, 290, 310, 2],
    [6, 282, 300, 1],
    [9, 288, 310, 2],

    // ── Mês 9 (250–280 dias atrás) ──
    [0, 255, 278, 2],
    [2, 250, 275, 1],
    [4, 260, 280, 2],
    [7, 252, 270, 1],
    [8, 258, 280, 2],

    // ── Mês 8 (220–250 dias atrás) ──
    [1, 225, 248, 2],
    [3, 220, 245, 2],
    [5, 230, 250, 1],
    [6, 222, 240, 2],
    [9, 228, 250, 1],

    // ── Mês 7 (190–220 dias atrás) ──
    [0, 195, 218, 1],
    [2, 190, 215, 2],
    [4, 200, 220, 1],
    [7, 192, 210, 2],
    [8, 198, 220, 1],

    // ── Mês 6 (160–190 dias atrás) ──
    [1, 165, 188, 2],
    [3, 160, 185, 1],
    [5, 170, 190, 2],
    [6, 162, 180, 2],
    [9, 168, 190, 1],

    // ── Mês 5 (130–160 dias atrás) ──
    [0, 135, 158, 2],
    [2, 130, 155, 2],
    [4, 140, 160, 1],
    [7, 132, 150, 1],
    [8, 138, 160, 2],

    // ── Mês 4 (100–130 dias atrás) ──
    [1, 105, 128, 2],
    [3, 100, 125, 2],
    [5, 110, 130, 1],
    [6, 102, 120, 2],
    [9, 108, 130, 3],

    // ── Mês 3 (70–100 dias atrás) ──
    [0, 75, 98, 2],
    [2, 70, 95, 3],
    [4, 80, 100, 2],
    [7, 72, 90, 2],
    [8, 78, 100, 1],

    // ── Mês 2 (35–70 dias atrás) ──
    [1, 40, 68, 3],
    [3, 35, 65, 2],
    [5, 45, 70, 2],
    [6, 38, 60, 2],
    [9, 42, 70, 2],

    // ── Mês 1 (1–35 dias atrás) ──
    [0, 5, 30, 2],
    [2, 3, 28, 2],
    [4, 8, 35, 3],
    [7, 2, 25, 3],
    [8, 10, 32, 2],
    [1, 1, 15, 1],
    [5, 5, 20, 2],
    [9, 3, 18, 2],
  ];

  let totalOrders = 0;

  for (const [userIdx, minDays, maxDays, qty] of ordersConfig) {
    const uid = userIds[userIdx];
    const aid = addressIds[userIdx];
    const cid = cardIds[userIdx];
    if (!uid || !aid || !cid) continue;

    for (let q = 0; q < qty; q++) {
      try {
        const orderDate = randomPastDate(minDays, maxDays);
        const daysAgo = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
        const status = randomStatus(daysAgo);

        // Selecionar 1 a 3 livros aleatórios
        const numBooks = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...books].sort(() => Math.random() - 0.5).slice(0, numBooks);

        let subtotal = 0;
        const itemsList = shuffled.map((b) => {
          const qty2 = Math.floor(Math.random() * 2) + 1;
          subtotal += parseFloat(b.price) * qty2;
          return { book_id: b.id, quantity: qty2, price: b.price };
        });

        const freight = subtotal >= 50 ? 0 : parseFloat((Math.random() * 15 + 5).toFixed(2));
        const total = parseFloat((subtotal + freight).toFixed(2));

        // Inserir pedido com data retroativa via SQL
        const orderResult = await pool.query(
          `INSERT INTO orders (user_id, address_id, coupon_id, total_amount, freight, status, created_at)
           VALUES ($1, $2, NULL, $3, $4, $5, $6) RETURNING id`,
          [uid, aid, total, freight, status, orderDate]
        );
        const orderId = orderResult.rows[0].id;

        // Inserir itens
        for (const item of itemsList) {
          await pool.query(
            `INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ($1,$2,$3,$4)`,
            [orderId, item.book_id, item.quantity, item.price]
          );
        }

        // Inserir pagamento (apenas para status != aguardando_pagamento)
        if (status !== "aguardando_pagamento") {
          await pool.query(
            `INSERT INTO payments (order_id, card_id, amount, payment_method, payment_status)
             VALUES ($1,$2,$3,'cartao','aprovado')`,
            [orderId, cid, total]
          );
        }

        totalOrders++;
        console.log(`  ✅ Pedido #${orderId} | user_id=${uid} | R$${total.toFixed(2)} | ${status} | ${orderDate.toLocaleDateString("pt-BR")}`);
      } catch (err) {
        console.log(`  ❌ Erro ao criar pedido para user_id=${uid}: ${err.message}`);
      }
    }
  }

  console.log(`\n✅ Seed finalizado!`);
  console.log(`   👤 Usuários: ${userIds.filter(Boolean).length}`);
  console.log(`   🏠 Endereços: ${addressIds.filter(Boolean).length}`);
  console.log(`   💳 Cartões: ${cardIds.filter(Boolean).length}`);
  console.log(`   🛒 Pedidos: ${totalOrders}`);

  pool.end();
}

seed().catch((err) => {
  console.error("Erro fatal:", err);
  pool.end();
});
