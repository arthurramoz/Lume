require("dotenv").config();
const pool = require("./config/database");

/**
 * Seed para adicionar 13 novos livros ao catálogo.
 * - Reutiliza autores existentes (Anna Llenas, Ruth Rocha)
 * - Reutiliza gêneros existentes (Fantasia, Poesia, Emoções, Fábula)
 * - Cria novos autores e gêneros conforme necessário
 */

const newBooks = [
    {
        title: "A Maior Flor do Mundo",
        description: "Uma história mágica e realista onde um menino decide dar a volta ao mundo e encontra uma flor murchando, decidindo salvá-la de forma heroica.",
        price: 42.90,
        cover_image: "assets/back/a-maior-flor-do-mundo.png",
        publication_year: 2001,
        isbn: "9788535901931",
        stock_quantity: 15,
        cost_value: 21.45,
        genre_name: "Fantasia",
        author_name: "José Saramago"
    },
    {
        title: "O Menino Que Engoliu a Imaginação",
        description: "Mostra o poder da imaginação das crianças que, às vezes, enxergam monstros e aventuras onde os adultos só veem sombras cotidianas.",
        price: 39.90,
        cover_image: "assets/back/menino-engoliu-imaginacao.png",
        publication_year: 2013,
        isbn: "9788511018562",
        stock_quantity: 20,
        cost_value: 19.95,
        genre_name: "Fantasia",
        author_name: "Fabricio Carpinejar"
    },
    {
        title: "O Gênio do Crime",
        description: "Um clássico da literatura infantojuvenil brasileira onde a Turma do Gordo tenta desvendar quem está falsificando figurinhas raras de futebol.",
        price: 49.90,
        cover_image: "assets/back/o-genio-do-crime.png",
        publication_year: 1969,
        isbn: "9788526017429",
        stock_quantity: 10,
        cost_value: 24.95,
        genre_name: "Mistério e Detetive",
        author_name: "João Carlos Marinho"
    },
    {
        title: "Mistério no Casarão",
        description: "Uma aventura cheia de suspense onde um grupo de amigos decide investigar uma casa abandonada no bairro e acaba descobrindo segredos.",
        price: 35.00,
        cover_image: "assets/back/misterio-no-casarao.png",
        publication_year: 2005,
        isbn: "9788501072214",
        stock_quantity: 12,
        cost_value: 17.50,
        genre_name: "Mistério e Detetive",
        author_name: "Carlos Heitor Cony"
    },
    {
        title: "Ou Isto ou Aquilo",
        description: "O livro de poesia infantil mais famoso do Brasil, que brinca com a sonoridade das palavras, o ritmo e as eternas dúvidas e escolhas da infância.",
        price: 46.00,
        cover_image: "assets/back/ou-isto-ou-aquilo.png",
        publication_year: 1964,
        isbn: "9788526017047",
        stock_quantity: 25,
        cost_value: 23.00,
        genre_name: "Poesia",
        author_name: "Cecília Meireles"
    },
    {
        title: "A Arca de Noé",
        description: "Contém poemas musicais infantis icônicos e cheios de rimas, como A Casa (Era uma casa muito engraçada...) e O Pato.",
        price: 44.90,
        cover_image: "assets/back/a-arca-de-noe.png",
        publication_year: 1970,
        isbn: "9788535920048",
        stock_quantity: 18,
        cost_value: 22.45,
        genre_name: "Poesia",
        author_name: "Vinicius de Moraes"
    },
    {
        title: "O Monstro das Cores (Edição Ilustrada)",
        description: "Ajuda as crianças a identificarem, nomearem e organizarem suas emoções (alegria, tristeza, raiva, medo) através de analogias lúdicas com cores.",
        price: 54.90,
        cover_image: "assets/back/o-monstro-das-cores.png",
        publication_year: 2012,
        isbn: "9788501114532",
        stock_quantity: 30,
        cost_value: 27.45,
        genre_name: "Emoções",
        author_name: "Anna Llenas"
    },
    {
        title: "Parte de Mim",
        description: "Uma obra delicada que aborda sentimentos cotidianos, memórias de infância e a percepção do mundo sob a ótica pura e sensível das crianças.",
        price: 38.00,
        cover_image: "assets/back/parte-de-mim.png",
        publication_year: 2003,
        isbn: "9788501066541",
        stock_quantity: 14,
        cost_value: 19.00,
        genre_name: "Emoções",
        author_name: "Ferreira Gullar"
    },
    {
        title: "Cãorobot",
        description: "Uma aventura futurista e divertida sobre um cão-robô construído por um pequeno inventor, misturando tecnologia, amizade e ficção científica para crianças.",
        price: 48.90,
        cover_image: "assets/back/caorobot.png",
        publication_year: 2014,
        isbn: "9788574124612",
        stock_quantity: 12,
        cost_value: 24.45,
        genre_name: "Ficção Científica Infantil",
        author_name: "Chris Gall"
    },
    {
        title: "O Que Você Faz com uma Ideia?",
        description: "Um livro inspirador sobre criatividade e perseverança, que ensina as crianças a cultivarem suas ideias, por mais estranhas ou ousadas que pareçam.",
        price: 49.16,
        cover_image: "assets/back/o-que-voce-faz-com-uma-ideia.png",
        publication_year: 2014,
        isbn: "9788568643006",
        stock_quantity: 22,
        cost_value: 24.58,
        genre_name: "Educação e Aprendizagem",
        author_name: "Kobi Yamada"
    },
    {
        title: "Abigail",
        description: "Abigail adora contar, é a sua atividade favorita! Mas quando ela tenta contar as listras da zebra e as manchas do guepardo, seus amigos simplesmente não conseguem ficar parados. Uma história encantadora sobre amizade, números e criatividade.",
        price: 39.90,
        cover_image: "assets/back/abigail.png",
        publication_year: 2013,
        isbn: "9788538052876",
        stock_quantity: 15,
        cost_value: 19.95,
        genre_name: "Educação e Aprendizagem",
        author_name: "Catherine Rayner"
    },
    {
        title: "Almanaque do Albinho: Natureza e Meio Ambiente",
        description: "Uma obra educativa que ensina os pequenos sobre a importância da preservação ambiental, reciclagem e o respeito à fauna e flora de forma leve.",
        price: 32.00,
        cover_image: "assets/back/almanaque-albinho-natureza.png",
        publication_year: 2011,
        isbn: "9788506066225",
        stock_quantity: 15,
        cost_value: 16.00,
        genre_name: "Natureza e Meio Ambiente",
        author_name: "Ruth Rocha"
    },
    {
        title: "Fábulas de Esopo",
        description: "Os clássicos contos morais como A Tartaruga e a Lebre recontados com as ilustrações e a linguagem cativante da Turma da Mônica.",
        price: 39.90,
        cover_image: "assets/back/fabulas-de-esopo-turma-monica.png",
        publication_year: 2019,
        isbn: "9788534241618",
        stock_quantity: 18,
        cost_value: 19.95,
        genre_name: "Fábula",
        author_name: "Mauricio de Sousa"
    }
];

async function seed() {
    console.log("🌱 Iniciando seed de novos livros...\n");

    let inserted = 0;
    let skipped = 0;

    for (const book of newBooks) {
        try {
            // Verificar se o livro já existe (por ISBN)
            const existingBook = await pool.query(
                "SELECT id FROM books WHERE isbn = $1", [book.isbn]
            );
            if (existingBook.rows.length > 0) {
                console.log(`  ⏩ Livro já existe: ${book.title} (ISBN: ${book.isbn})`);
                skipped++;
                continue;
            }

            // Buscar ou criar autor
            let authorResult = await pool.query(
                "SELECT id FROM authors WHERE name = $1", [book.author_name]
            );
            let authorId;
            if (authorResult.rows.length === 0) {
                authorResult = await pool.query(
                    "INSERT INTO authors (name) VALUES ($1) RETURNING id", [book.author_name]
                );
                console.log(`  ✅ Autor criado: ${book.author_name} (id=${authorResult.rows[0].id})`);
            } else {
                console.log(`  ♻️  Autor reutilizado: ${book.author_name} (id=${authorResult.rows[0].id})`);
            }
            authorId = authorResult.rows[0].id;

            // Buscar ou criar gênero
            let genreResult = await pool.query(
                "SELECT id FROM genres WHERE name = $1", [book.genre_name]
            );
            let genreId;
            if (genreResult.rows.length === 0) {
                genreResult = await pool.query(
                    "INSERT INTO genres (name) VALUES ($1) RETURNING id", [book.genre_name]
                );
                console.log(`  ✅ Gênero criado: ${book.genre_name} (id=${genreResult.rows[0].id})`);
            } else {
                console.log(`  ♻️  Gênero reutilizado: ${book.genre_name} (id=${genreResult.rows[0].id})`);
            }
            genreId = genreResult.rows[0].id;

            // Inserir o livro
            await pool.query(
                `INSERT INTO books (title, description, price, cover_image, publication_year, isbn, stock_quantity, cost_value, author_id, genre_id) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [book.title, book.description, book.price, book.cover_image, book.publication_year, book.isbn, book.stock_quantity, book.cost_value, authorId, genreId]
            );
            console.log(`  📚 Livro inserido: ${book.title}`);
            inserted++;

        } catch (err) {
            console.log(`  ❌ Erro no livro "${book.title}": ${err.message}`);
        }
    }

    // Resumo final
    console.log(`\n📊 Resumo:`);
    console.log(`   📚 ${inserted} livros inseridos`);
    console.log(`   ⏩ ${skipped} livros já existiam (ignorados)`);

    // Mostrar total de livros no banco
    const totalBooks = await pool.query("SELECT COUNT(*) FROM books");
    const totalAuthors = await pool.query("SELECT COUNT(*) FROM authors");
    const totalGenres = await pool.query("SELECT COUNT(*) FROM genres");
    console.log(`\n   📖 Total de livros: ${totalBooks.rows[0].count}`);
    console.log(`   ✍️  Total de autores: ${totalAuthors.rows[0].count}`);
    console.log(`   🏷️  Total de gêneros: ${totalGenres.rows[0].count}`);

    console.log("\n✅ Seed de novos livros finalizado!");
    await pool.end();
}

seed().catch((err) => {
    console.error("❌ Erro no seed:", err);
    process.exit(1);
});
