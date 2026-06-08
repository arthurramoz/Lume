require("dotenv").config();
const pool = require("./config/database");

/**
 * Seed para reorganizar TODOS os gêneros dos livros.
 * - Renomeia gêneros antigos ("Aventura Infantil" → "Aventura", etc.)
 * - Cria novos gêneros quando necessário
 * - Redistribui TODOS os 20 livros em 7 gêneros
 * - Remove gêneros órfãos (sem livros vinculados)
 */

const GENRES = [
  "Aventura",
  "Fábula",
  "Humor",
  "Emoções",
  "Fantasia",
  "Poesia",
  "Superação",
];

// Mapeamento: título do livro → gênero (TODOS os livros)
const BOOK_GENRES = {
  // === 3 livros originais ===
  "O Corajoso Pinguim": "Aventura",
  "As Aventuras de Gildo": "Fábula",
  "Um Dia Muito Mal-Humorado": "Humor",

  // === 17 livros novos ===
  // Aventura (3 livros)
  "Onde Vivem os Monstros": "Aventura",
  "O Sítio do Picapau Amarelo": "Aventura",
  "Reinações de Narizinho": "Aventura",

  // Fábula (3 livros)
  "O Grúfalo": "Fábula",
  "A Lagarta Muito Comilona": "Fábula",
  "O Gato de Botas": "Fábula",

  // Humor (2 livros)
  "O Menino Maluquinho": "Humor",
  "Marcelo, Marmelo, Martelo": "Humor",

  // Emoções (3 livros)
  "O Monstro das Cores": "Emoções",
  "Adivinha Quanto Eu Te Amo": "Emoções",
  "Meu Pé de Laranja Lima": "Emoções",

  // Fantasia (3 livros)
  "A Fada Que Tinha Ideias": "Fantasia",
  "O Pequeno Príncipe": "Fantasia",
  "Chapeuzinho Amarelo": "Fantasia",

  // Poesia (2 livros)
  "Flicts": "Poesia",
  "A Parte que Falta": "Poesia",

  // Superação (1 livro)
  "Amoras": "Superação",
};

// Gêneros antigos → novos nomes (para renomear em vez de criar duplicatas)
const RENAME_MAP = {
  "Aventura Infantil": "Aventura",
  "Fantasia Infantil": "Fantasia",
  "Humor Infantil": "Humor",
  "Mistério Infantil": "Aventura",
  "Infantil": null, // será removido
  "Fábulas": "Fábula",
  "Contos de Fadas": "Fantasia",
  "Conto de Fadas": "Fantasia",
  "Animais": "Fábula",
  "Amizade": "Emoções",
  "Natureza": "Poesia",
  "Educativo": "Superação",
};

async function seed() {
  console.log("🏷️  Iniciando seed de gêneros...\n");

  const genreIdMap = {};

  // 1. Criar os 7 gêneros novos (ou reusar existentes)
  for (const genreName of GENRES) {
    const existing = await pool.query(
      "SELECT id FROM genres WHERE name = $1",
      [genreName]
    );

    if (existing.rows.length > 0) {
      genreIdMap[genreName] = existing.rows[0].id;
      console.log(`  ⏩ Gênero já existe: ${genreName} (id=${genreIdMap[genreName]})`);
    } else {
      const result = await pool.query(
        "INSERT INTO genres (name) VALUES ($1) RETURNING id",
        [genreName]
      );
      genreIdMap[genreName] = result.rows[0].id;
      console.log(`  ✅ Gênero criado: ${genreName} (id=${genreIdMap[genreName]})`);
    }
  }

  console.log("");

  // 2. Atualizar cada livro para o gênero correto
  let updated = 0;

  for (const [bookTitle, genreName] of Object.entries(BOOK_GENRES)) {
    const genreId = genreIdMap[genreName];

    const result = await pool.query(
      "UPDATE books SET genre_id = $1 WHERE title = $2 RETURNING id, title",
      [genreId, bookTitle]
    );

    if (result.rows.length > 0) {
      console.log(`  📚 ${result.rows[0].title} → ${genreName}`);
      updated++;
    } else {
      console.log(`  ❌ Livro não encontrado: ${bookTitle}`);
    }
  }

  console.log(`\n  ✅ ${updated} livros atualizados.\n`);

  // 3. Remover gêneros órfãos (sem nenhum livro vinculado)
  const orphans = await pool.query(`
    SELECT g.id, g.name
    FROM genres g
    LEFT JOIN books b ON b.genre_id = g.id
    WHERE b.id IS NULL
  `);

  if (orphans.rows.length > 0) {
    console.log("🗑️  Removendo gêneros sem livros:");
    for (const row of orphans.rows) {
      await pool.query("DELETE FROM genres WHERE id = $1", [row.id]);
      console.log(`   ❌ ${row.name} (id=${row.id}) removido`);
    }
  }

  // 4. Mostrar resumo final
  const summary = await pool.query(`
    SELECT g.name, COUNT(b.id) AS total
    FROM genres g
    LEFT JOIN books b ON b.genre_id = g.id
    GROUP BY g.name
    ORDER BY total DESC, g.name
  `);

  console.log("\n📊 Distribuição final:");
  for (const row of summary.rows) {
    console.log(`   ${row.name}: ${row.total} livros`);
  }

  await pool.end();
  console.log("\n✅ Seed de gêneros finalizado!");
}

seed().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
