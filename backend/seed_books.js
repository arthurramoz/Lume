require("dotenv").config();
const pool = require("./config/database");

const books = [
    {
        title: "O Pequeno Príncipe",
        description: "Um piloto de avião, preso no deserto do Saara, encontra um pequeno príncipe que veio de outro planeta.",
        price: 29.90,
        cover_image: "https://m.media-amazon.com/images/I/71OZY035QKL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1943,
        isbn: "978-8595081512",
        stock_quantity: 50,
        cost_value: 12.00,
        author_name: "Antoine de Saint-Exupéry",
        genre_name: "Ficção"
    },
    {
        title: "Dom Casmurro",
        description: "A história de Bentinho e Capitu, um dos maiores clássicos da literatura brasileira.",
        price: 24.90,
        cover_image: "https://m.media-amazon.com/images/I/61hBMKrEFjL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1899,
        isbn: "978-8544001820",
        stock_quantity: 30,
        cost_value: 8.00,
        author_name: "Machado de Assis",
        genre_name: "Romance"
    },
    {
        title: "1984",
        description: "Em um mundo dominado por um regime totalitário, Winston Smith luta contra o controle absoluto do Grande Irmão.",
        price: 34.90,
        cover_image: "https://m.media-amazon.com/images/I/819js3EQwbL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1949,
        isbn: "978-8535914849",
        stock_quantity: 40,
        cost_value: 15.00,
        author_name: "George Orwell",
        genre_name: "Distopia"
    },
    {
        title: "Harry Potter e a Pedra Filosofal",
        description: "Harry descobre que é um bruxo e começa sua jornada na Escola de Magia e Bruxaria de Hogwarts.",
        price: 39.90,
        cover_image: "https://m.media-amazon.com/images/I/81ibfYk4qmL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1997,
        isbn: "978-8532530783",
        stock_quantity: 60,
        cost_value: 18.00,
        author_name: "J.K. Rowling",
        genre_name: "Fantasia"
    },
    {
        title: "A Revolução dos Bichos",
        description: "Uma fábula sobre uma fazenda onde os animais se revoltam contra os humanos.",
        price: 27.90,
        cover_image: "https://m.media-amazon.com/images/I/91LUbmx-iNL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1945,
        isbn: "978-8535909555",
        stock_quantity: 35,
        cost_value: 10.00,
        author_name: "George Orwell",
        genre_name: "Ficção"
    },
    {
        title: "O Hobbit",
        description: "Bilbo Bolseiro parte em uma aventura inesperada com um grupo de anões para recuperar um tesouro.",
        price: 44.90,
        cover_image: "https://m.media-amazon.com/images/I/91b0C2YNSrL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1937,
        isbn: "978-8595084742",
        stock_quantity: 25,
        cost_value: 20.00,
        author_name: "J.R.R. Tolkien",
        genre_name: "Fantasia"
    },
    {
        title: "Orgulho e Preconceito",
        description: "Elizabeth Bennet e Mr. Darcy superam suas diferenças neste clássico romance inglês.",
        price: 22.90,
        cover_image: "https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1813,
        isbn: "978-8544001011",
        stock_quantity: 20,
        cost_value: 9.00,
        author_name: "Jane Austen",
        genre_name: "Romance"
    },
    {
        title: "Cem Anos de Solidão",
        description: "A saga da família Buendía ao longo de sete gerações na cidade fictícia de Macondo.",
        price: 49.90,
        cover_image: "https://m.media-amazon.com/images/I/91H0MtCnE3L._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1967,
        isbn: "978-8501012173",
        stock_quantity: 15,
        cost_value: 22.00,
        author_name: "Gabriel García Márquez",
        genre_name: "Realismo Mágico"
    },
    {
        title: "O Senhor dos Anéis: A Sociedade do Anel",
        description: "Frodo parte para destruir o Um Anel e salvar a Terra-média.",
        price: 54.90,
        cover_image: "https://m.media-amazon.com/images/I/91b0C2YNSrL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1954,
        isbn: "978-8595084759",
        stock_quantity: 30,
        cost_value: 25.00,
        author_name: "J.R.R. Tolkien",
        genre_name: "Fantasia"
    },
    {
        title: "A Culpa é das Estrelas",
        description: "Dois adolescentes com câncer se apaixonam e vivem uma história emocionante.",
        price: 32.90,
        cover_image: "https://m.media-amazon.com/images/I/71FQEM5yqNL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 2012,
        isbn: "978-8580572261",
        stock_quantity: 45,
        cost_value: 14.00,
        author_name: "John Green",
        genre_name: "Romance"
    }
];

async function seed() {
    console.log("🌱 Iniciando seed de livros...\n");

    for (const book of books) {
        try {
            let authorResult = await pool.query(
                "SELECT id FROM authors WHERE name = $1", [book.author_name]
            );
            let authorId;
            if (authorResult.rows.length === 0) {
                authorResult = await pool.query(
                    "INSERT INTO authors (name) VALUES ($1) RETURNING id", [book.author_name]
                );
                console.log(`  ✅ Autor criado: ${book.author_name}`);
            }
            authorId = authorResult.rows[0].id;

            let genreResult = await pool.query(
                "SELECT id FROM genres WHERE name = $1", [book.genre_name]
            );
            let genreId;
            if (genreResult.rows.length === 0) {
                genreResult = await pool.query(
                    "INSERT INTO genres (name) VALUES ($1) RETURNING id", [book.genre_name]
                );
                console.log(`  ✅ Gênero criado: ${book.genre_name}`);
            }
            genreId = genreResult.rows[0].id;

            await pool.query(
                `INSERT INTO books (title, description, price, cover_image, publication_year, isbn, stock_quantity, cost_value, author_id, genre_id) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [book.title, book.description, book.price, book.cover_image, book.publication_year, book.isbn, book.stock_quantity, book.cost_value, authorId, genreId]
            );
            console.log(`  📚 Livro inserido: ${book.title}`);

        } catch (err) {
            console.log(`  ❌ Erro no livro "${book.title}": ${err.message}`);
        }
    }

    console.log("\n✅ Seed finalizado!");
    pool.end();
}

seed();
