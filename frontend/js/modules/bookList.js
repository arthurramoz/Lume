import { formatCurrency } from "../utils/format.js";
import { getIsAuthenticated, localStorageKeys } from "../hooks/useAuth.js";
const API_URL = window.API_URL;

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

  const response = await fetch(`${API_URL}/api/cart`, {
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

    if (!bookId) return;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".book-card__btn")) return;
      window.location.href = `/pages/book.html?id=${bookId}`;
    });

    if (!btn) return;

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
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
        const response = await fetch(`${API_URL}/api/books/cards`);
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
            .slice(0, 5)
            .map((book) => createBookCard(book, false))
            .join("");
        attachBuyButtons(container);
    }

    if (catalogContainer && items.length > 0) {
        const itemsPerPage = 6;
        let currentPage = 1;
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

        const renderCatalogPage = (page) => {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = items.slice(start, end);

            catalogContainer.innerHTML = pageItems
                .map((book) => createBookCard(book, true))
                .join("");
            attachBuyButtons(catalogContainer);

            const paginationInfo = document.querySelector(".pagination-info");
            const paginationControls = document.querySelector(".pagination-controls");

            if (paginationInfo) {
                const showingCount = pageItems.length;
                paginationInfo.textContent = `Mostrando ${showingCount.toString().padStart(2, '0')} de ${totalItems.toString().padStart(2, '0')}`;
            }

            if (paginationControls) {
                let controlsHTML = `
                    <button class="page-number" data-page="${page > 1 ? page - 1 : 1}" ${page === 1 ? 'disabled' : ''}>
                        <img src="/assets/icons/users-pagination-left.svg" alt="Anterior" />
                    </button>
                `;

                let startPage = Math.max(1, page - 2);
                let endPage = Math.min(totalPages, page + 2);

                if (startPage > 1) {
                    controlsHTML += `<button class="page-number" data-page="1">1</button>`;
                    if (startPage > 2) {
                        controlsHTML += `<span class="page-number" style="pointer-events: none; border: none; background: transparent;">...</span>`;
                    }
                }

                for (let i = startPage; i <= endPage; i++) {
                    controlsHTML += `
                        <button class="page-number ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>
                    `;
                }

                if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                        controlsHTML += `<span class="page-number" style="pointer-events: none; border: none; background: transparent;">...</span>`;
                    }
                    controlsHTML += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`;
                }

                controlsHTML += `
                    <button class="page-number" data-page="${page < totalPages ? page + 1 : totalPages}" ${page === totalPages ? 'disabled' : ''}>
                        <img src="/assets/icons/users-pagination-right.svg" alt="Próximo" />
                    </button>
                `;

                paginationControls.innerHTML = controlsHTML;

                paginationControls.querySelectorAll("button[data-page]").forEach(btn => {
                    btn.addEventListener("click", () => {
                        if (btn.disabled) return;
                        const newPage = parseInt(btn.dataset.page);
                        if (newPage && newPage !== currentPage) {
                            currentPage = newPage;
                            renderCatalogPage(currentPage);
                            const sectionTitle = document.querySelector('.catalog-title');
                            if (sectionTitle) sectionTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    });
                });
            }
        };

        renderCatalogPage(currentPage);
    }
};
