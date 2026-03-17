import { booksMock } from "../mock/books.js";
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
      ${
        isCatalog
          ? `<span class="book-card__status ${book.id % 2 === 0 ? "book-card__status--unavailable" : "book-card__status--available"}">
              ${book.id % 2 === 0 ? "Indisponível" : "Disponível"}
             </span>`
          : ""
      }
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

export const initBookList = () => {
  const container = document.querySelector(".book-list");
  const catalogContainer = document.querySelector("#catalog-grid");

  if (container) {
    container.innerHTML = booksMock
      .map((book) => createBookCard(book, false))
      .join("");
  }

  if (catalogContainer) {
    const extendedMock = [...booksMock, ...booksMock, ...booksMock].slice(0, 9);
    catalogContainer.innerHTML = extendedMock
      .map((book) => createBookCard(book, true))
      .join("");
  }
};
