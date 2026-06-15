require("dotenv").config();
const pool = require("./config/database");

const GENRES = [
  "Aventura",
  "Fábula",
  "Humor",
  "Emoções",
  "Fantasia",
  "Poesia",
  "Superação",
];

const BOOK_GENRES = {

  "O Corajoso Pinguim": "Aventura",
  "As Aventuras de Gildo": "Fábula",
  "Um Dia Muito Mal-Humorado": "Humor",


  "Onde Vivem os Monstros": "Aventura",
  "O Sítio do Picapau Amarelo": "Aventura",
  "Reinações de Narizinho": "Aventura",


  "O Grúfalo": "Fábula",
  "A Lagarta Muito Comilona": "Fábula",
  "O Gato de Botas": "Fábula",


  "O Menino Maluquinho": "Humor",
  "Marcelo, Marmelo, Martelo": "Humor",


  "O Monstro das Cores": "Emoções",
  "Adivinha Quanto Eu Te Amo": "Emoções",
  "Meu Pé de Laranja Lima": "Emoções",


  "A Fada Que Tinha Ideias": "Fantasia",
  "O Pequeno Príncipe": "Fantasia",
  "Chapeuzinho Amarelo": "Fantasia",


  "Flicts": "Poesia",
  "A Parte que Falta": "Poesia",


  "Amoras": "Superação",
};

const RENAME_MAP = {
  "Aventura Infantil": "Aventura",
  "Fantasia Infantil": "Fantasia",
  "Humor Infantil": "Humor",
  "Mistério Infantil": "Aventura",
  "Infantil": null,
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
