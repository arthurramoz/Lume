import { formatCurrency } from "../utils/format.js";

const createBookCard = (book, isCatalog = false) => `
  <div class="book-card" data-id="${book.id}">
    <img
      src="${book.image.url}"
      alt="${book.title}"
      class="book-card__image"
      loading="lazy"
    />

    <div class="book-card__content">
      <h3 class="book-card__title">${book.title}</h3>
      <span class="book-card__author">${book.by}</span>
      <span class="book-card__status ${book.available ? "book-card__status--available" : "book-card__status--unavailable"}">
        ${book.available ? "Disponível" : "Indisponível"}
      </span>
    </div>

    <div class="book-card__footer">
      <span class="book-card__price">${formatCurrency(book.price)}</span>
      <button class="book-card__btn" aria-label="Comprar ${book.title}">
        <img src="assets/icons/cart-white.svg" alt="${book.title}" width="20" />
        Comprar
      </button>
    </div>
  </div>
`;

export const initBookList = async () => {
    const container = document.querySelector(".book-list");
    const catalogContainer = document.querySelector("#catalog-grid");

    let items = [];

    try {
        const response = await fetch("http://localhost:3333/api/books/cards");
        if (response.ok) {
            const apiBooks = await response.json();
            items = apiBooks.map((book, index) => {
                // Tenta puxar a imagem diretamente do banco
                // usando 'image_url' (nome mais comum)
                // ou use o path da capa se for outra coluna
                return {
                    id: book.id || index + 1,
                    title: book.title,
                    by: book.author_name || "Desconhecido",
                    price:
                        typeof book.price === "string"
                            ? parseFloat(
                                  book.price
                                      .replace("R$", "")
                                      .replace(",", "."),
                              )
                            : book.price,
                    image: {
                        url: book.cover_image || "assets/books/upload.svg",
                    },
                    available: book.stock_quantity > 0,
                };
            });
        } else {
            console.error("Erro ao buscar livros da API.");
        }
    } catch (error) {
        console.error("Erro de conexão na API:", error);
    }

    if (container && items.length > 0) {
        container.innerHTML = items
            .map((book) => createBookCard(book, false))
            .join("");
    }

    if (catalogContainer && items.length > 0) {
        catalogContainer.innerHTML = items
            .map((book) => createBookCard(book, true))
            .join("");
    }
};
