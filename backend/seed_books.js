require("dotenv").config();
const pool = require("./config/database");

const books = [
    {
        title: "O Grúfalo",
        description: "Um ratinho esperto inventa um monstro terrível para assustar os predadores da floresta, mas descobre que o Grúfalo é real!",
        price: 39.90,
        cover_image: "https://m.media-amazon.com/images/I/81Kls5yLfJL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1999,
        isbn: "978-8574068466",
        stock_quantity: 40,
        cost_value: 18.00,
        author_name: "Julia Donaldson",
        genre_name: "Infantil"
    },
    {
        title: "O Monstro das Cores",
        description: "O Monstro das Cores acordou confuso e precisa aprender a organizar suas emoções com a ajuda de uma menina.",
        price: 49.90,
        cover_image: "https://m.media-amazon.com/images/I/81WC05JNFUL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 2012,
        isbn: "978-8550701240",
        stock_quantity: 55,
        cost_value: 22.00,
        author_name: "Anna Llenas",
        genre_name: "Infantil"
    },
    {
        title: "A Lagarta Muito Comilona",
        description: "Acompanhe a jornada de uma lagartinha muito faminta que come de tudo até se transformar em uma linda borboleta.",
        price: 44.90,
        cover_image: "https://m.media-amazon.com/images/I/81C8oiKfMKL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1969,
        isbn: "978-8574164618",
        stock_quantity: 45,
        cost_value: 20.00,
        author_name: "Eric Carle",
        genre_name: "Infantil"
    },
    {
        title: "Adivinha Quanto Eu Te Amo",
        description: "Uma história terna entre o Coelhinho e o Coelhão sobre o amor que não se consegue medir.",
        price: 42.90,
        cover_image: "https://m.media-amazon.com/images/I/81oKuBB-ndL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1994,
        isbn: "978-8578272364",
        stock_quantity: 30,
        cost_value: 19.00,
        author_name: "Sam McBratney",
        genre_name: "Infantil"
    },
    {
        title: "O Menino Maluquinho",
        description: "A divertida história de um menino que usava uma panela na cabeça e vivia aprontando com seus amigos.",
        price: 34.90,
        cover_image: "https://m.media-amazon.com/images/I/51i7pKQh5fL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1980,
        isbn: "978-8506070680",
        stock_quantity: 50,
        cost_value: 14.00,
        author_name: "Ziraldo",
        genre_name: "Infantil"
    },
    {
        title: "A Parte que Falta",
        description: "Um círculo incompleto sai em busca da parte que lhe falta, descobrindo que a jornada é mais importante que o destino.",
        price: 36.90,
        cover_image: "https://m.media-amazon.com/images/I/41BhRcXttbL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1976,
        isbn: "978-8574068848",
        stock_quantity: 25,
        cost_value: 16.00,
        author_name: "Shel Silverstein",
        genre_name: "Infantil"
    },
    {
        title: "Onde Vivem os Monstros",
        description: "Max veste sua fantasia de lobo e viaja para o lugar onde vivem os monstros selvagens.",
        price: 47.90,
        cover_image: "https://m.media-amazon.com/images/I/71JrQ5R2yYL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1963,
        isbn: "978-8575038543",
        stock_quantity: 20,
        cost_value: 22.00,
        author_name: "Maurice Sendak",
        genre_name: "Infantil"
    },
    {
        title: "O Gato de Botas",
        description: "Um gato astuto usa botas e um chapéu para transformar seu dono pobre em um rico marquês.",
        price: 24.90,
        cover_image: "https://m.media-amazon.com/images/I/81YfHv5FLZL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1697,
        isbn: "978-8539416417",
        stock_quantity: 35,
        cost_value: 10.00,
        author_name: "Charles Perrault",
        genre_name: "Conto de Fadas"
    },
    {
        title: "Chapeuzinho Amarelo",
        description: "Chapeuzinho Amarelo tinha medo de tudo, até que um dia enfrentou o Lobo e descobriu que medo é pra ser enfrentado.",
        price: 32.90,
        cover_image: "https://m.media-amazon.com/images/I/81W+oi+qYaL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1979,
        isbn: "978-8503012522",
        stock_quantity: 40,
        cost_value: 14.00,
        author_name: "Chico Buarque",
        genre_name: "Infantil"
    },
    {
        title: "Flicts",
        description: "Flicts era uma cor rara e triste que não encontrava seu lugar no arco-íris nem em lugar nenhum do mundo.",
        price: 39.90,
        cover_image: "https://m.media-amazon.com/images/I/51Lc+D13uJL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1969,
        isbn: "978-8506079706",
        stock_quantity: 28,
        cost_value: 17.00,
        author_name: "Ziraldo",
        genre_name: "Infantil"
    },
    {
        title: "A Fada Que Tinha Ideias",
        description: "Clara Luz é uma fadinha muito curiosa que adora inventar coisas e questionar as regras do Reino das Fadas.",
        price: 29.90,
        cover_image: "https://m.media-amazon.com/images/I/71J8cB38AML._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1971,
        isbn: "978-8516092405",
        stock_quantity: 32,
        cost_value: 12.00,
        author_name: "Fernanda Lopes de Almeida",
        genre_name: "Infantil"
    },
    {
        title: "Marcelo, Marmelo, Martelo",
        description: "Marcelo gosta de inventar nomes novos para as coisas: cachorro é 'au-au' e bola é 'brincadeira redonda'.",
        price: 27.90,
        cover_image: "https://m.media-amazon.com/images/I/81Ocs2JHRDL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1976,
        isbn: "978-8508113187",
        stock_quantity: 38,
        cost_value: 11.00,
        author_name: "Ruth Rocha",
        genre_name: "Infantil"
    },
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
        genre_name: "Infantil"
    },
    {
        title: "O Sítio do Picapau Amarelo",
        description: "As incríveis aventuras de Narizinho, Pedrinho e Emília no sítio mágico de Dona Benta.",
        price: 37.90,
        cover_image: "https://m.media-amazon.com/images/I/91EshRJLycL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1920,
        isbn: "978-8525044066",
        stock_quantity: 45,
        cost_value: 16.00,
        author_name: "Monteiro Lobato",
        genre_name: "Infantil"
    },
    {
        title: "Reinações de Narizinho",
        description: "Narizinho descobre o Reino das Águas Claras e faz amizade com o Príncipe Escamado e a boneca Emília.",
        price: 42.90,
        cover_image: "https://m.media-amazon.com/images/I/81TH2nCWb0L._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1931,
        isbn: "978-8525053718",
        stock_quantity: 30,
        cost_value: 19.00,
        author_name: "Monteiro Lobato",
        genre_name: "Infantil"
    },
    {
        title: "Meu Pé de Laranja Lima",
        description: "A história sensível do menino Zezé, que conversa com uma árvore e descobre a dor de crescer.",
        price: 34.90,
        cover_image: "https://m.media-amazon.com/images/I/8116kK5dEqL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 1968,
        isbn: "978-8522031436",
        stock_quantity: 35,
        cost_value: 15.00,
        author_name: "José Mauro de Vasconcelos",
        genre_name: "Infantil"
    },
    {
        title: "Amoras",
        description: "Um pai e sua filha passeiam e conversam sobre identidade, amor e pertencimento.",
        price: 34.90,
        cover_image: "https://m.media-amazon.com/images/I/61mGfOvJJRL._AC_UF1000,1000_QL80_.jpg",
        publication_year: 2018,
        isbn: "978-8574068855",
        stock_quantity: 50,
        cost_value: 15.00,
        author_name: "Emicida",
        genre_name: "Infantil"
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
