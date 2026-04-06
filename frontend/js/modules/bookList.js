import { formatCurrency } from "../utils/format.js";
import { getIsAuthenticated, localStorageKeys } from "../hooks/useAuth.js";

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
      <button class="book-card__btn" aria-label="Comprar ${book.title}" ${!book.available ? "disabled" : ""}>
        <img src="assets/icons/cart-white.svg" alt="${book.title}" width="20" />
        Comprar
      </button>
    </div>
  </div>
`;

async function addToCart(bookId) {
  const isAuthenticated = getIsAuthenticated();

  if (!isAuthenticated) {
    window.location.href = "/pages/login.html";
    return false;
  }

  const token =
    localStorage.getItem(localStorageKeys.accessToken) ||
    sessionStorage.getItem(localStorageKeys.accessToken);

  const response = await fetch("http://localhost:3333/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ book_id: bookId, quantity: 1 }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Erro ao adicionar ao carrinho");
  }

  // Troca o ícone do carrinho para notificação em todas as navbars
  const cartIcons = document.querySelectorAll("#topbar-cart-icon, #client-cart-icon");
  cartIcons.forEach((icon) => {
    icon.src = "/assets/icons/home-cart-notification.svg";
  });

  return true;
}

function attachBuyButtons(container) {
  container.querySelectorAll(".book-card").forEach((card) => {
    const btn = card.querySelector(".book-card__btn");
    const bookId = card.dataset.id;

    if (!btn || !bookId) return;

    btn.addEventListener("click", async () => {
      btn.disabled = true;

      try {
        const success = await addToCart(Number(bookId));
        if (success) {
          setTimeout(() => {
            btn.disabled = false;
          }, 1000);
        }
      } catch (err) {
        alert(err.message);
        btn.disabled = false;
      }
    });
  });
}

export const initBookList = async () => {
    const container = document.querySelector(".book-list");
    const catalogContainer = document.querySelector("#catalog-grid");

    let items = [];

    try {
        const response = await fetch("http://localhost:3333/api/books/cards");
        if (response.ok) {
            const apiBooks = await response.json();
            items = apiBooks.map((book, index) => {
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
                        url: book.cover_image 
                             ? (book.cover_image.startsWith('/') ? `/assets${book.cover_image}` : book.cover_image)
                             : "assets/books/upload.svg",
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
        attachBuyButtons(container);
    }

    if (catalogContainer && items.length > 0) {
        catalogContainer.innerHTML = items
            .map((book) => createBookCard(book, true))
            .join("");
        attachBuyButtons(catalogContainer);
    }
};
