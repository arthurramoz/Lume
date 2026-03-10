import { booksMock } from "../mock/books.js";
import { formatCurrency } from "../utils/format.js";

const createBookCard = (book) => `
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

  if (!container) return;

  container.innerHTML = booksMock.map(createBookCard).join("");

  container.addEventListener("click", (event) => {
    const btn = event.target.closest(".book-card__btn");

    if (!btn) return;

    window.location.href = "/login";
  });
};
