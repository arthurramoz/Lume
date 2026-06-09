import { formatCurrency } from "../utils/format.js";
import { getIsAuthenticated, localStorageKeys } from "../hooks/useAuth.js";
const API_URL = window.API_URL;

/* ─── Book Card Template ──────────────────────────────────────────── */

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

/* ─── Cart ────────────────────────────────────────────────────────── */

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

/* ─── Image URL resolver ──────────────────────────────────────────── */

function resolveImageUrl(coverImage) {
  if (!coverImage) return "/assets/books/upload.svg";
  if (coverImage.startsWith("http")) return coverImage;
  if (coverImage.startsWith("/assets/")) return coverImage;
  if (coverImage.startsWith("assets/")) return `/${coverImage}`;
  if (coverImage.startsWith("/")) return `/assets${coverImage}`;
  return `/assets/${coverImage}`;
}

/* ─── Map API book to card data ───────────────────────────────────── */

function mapBookToCard(book) {
  return {
    id: book.id,
    title: book.title,
    by: book.author_name || "Desconhecido",
    price: typeof book.price === "string"
      ? parseFloat(book.price.replace("R$", "").replace(",", "."))
      : book.price,
    image: { url: resolveImageUrl(book.cover_image) },
    available: book.stock_quantity > 0,
  };
}

/* ─── Catalog State ───────────────────────────────────────────────── */

let catalogState = {
  search: "",
  authorIds: [],
  genreIds: [],
  sort: "",
  page: 1,
  limit: 6,
};

/* ─── Debounce helper ─────────────────────────────────────────────── */

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ─── Catalog: Load filters from API ──────────────────────────────── */

async function loadFilters() {
  try {
    const [authorsRes, genresRes] = await Promise.all([
      fetch(`${API_URL}/api/books/authors`),
      fetch(`${API_URL}/api/books/genres`),
    ]);

    if (authorsRes.ok) {
      const authors = await authorsRes.json();
      const authorsContainer = document.getElementById("catalog-authors");
      if (authorsContainer) {
        const VISIBLE_COUNT = 5;
        const hasMore = authors.length > VISIBLE_COUNT;

        authorsContainer.innerHTML = authors
          .map(
            (a, i) => `
            <label class="catalog-checkbox ${i >= VISIBLE_COUNT ? "catalog-checkbox--hidden" : ""}">
              <input type="checkbox" value="${a.id}" name="author" /> ${a.name}
            </label>`
          )
          .join("");

        if (hasMore) {
          const toggleBtn = document.createElement("button");
          toggleBtn.className = "catalog-toggle-btn";
          toggleBtn.textContent = `Ver todos (${authors.length})`;
          toggleBtn.addEventListener("click", () => {
            const hidden = authorsContainer.querySelectorAll(".catalog-checkbox--hidden");
            const isExpanded = toggleBtn.dataset.expanded === "true";

            hidden.forEach((el) => {
              el.style.display = isExpanded ? "none" : "flex";
            });

            toggleBtn.dataset.expanded = isExpanded ? "false" : "true";
            toggleBtn.textContent = isExpanded
              ? `Ver todos (${authors.length})`
              : "Ver menos";
          });
          authorsContainer.appendChild(toggleBtn);
        }

        authorsContainer.querySelectorAll("input[name='author']").forEach((cb) => {
          cb.addEventListener("change", () => {
            catalogState.authorIds = getCheckedValues("author");
            catalogState.page = 1;
            loadCatalog();
          });
        });
      }
    }

    if (genresRes.ok) {
      const genres = await genresRes.json();
      const genresContainer = document.getElementById("catalog-genres");
      if (genresContainer) {
        genresContainer.innerHTML = genres
          .map(
            (g) => `
            <label class="catalog-checkbox">
              <input type="checkbox" value="${g.id}" name="genre" /> ${g.name}
            </label>`
          )
          .join("");

        genresContainer.querySelectorAll("input[name='genre']").forEach((cb) => {
          cb.addEventListener("change", () => {
            catalogState.genreIds = getCheckedValues("genre");
            catalogState.page = 1;
            loadCatalog();
          });
        });
      }
    }
  } catch (error) {
    console.error("Erro ao carregar filtros:", error);
  }
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name='${name}']:checked`)].map(
    (cb) => Number(cb.value)
  );
}

/* ─── Catalog: Load books from search API ─────────────────────────── */

async function loadCatalog() {
  const catalogContainer = document.getElementById("catalog-grid");
  if (!catalogContainer) return;

  const params = new URLSearchParams();
  if (catalogState.search) params.set("search", catalogState.search);
  if (catalogState.authorIds.length > 0) params.set("authors", catalogState.authorIds.join(","));
  if (catalogState.genreIds.length > 0) params.set("genres", catalogState.genreIds.join(","));
  if (catalogState.sort) params.set("sort", catalogState.sort);
  params.set("page", catalogState.page);
  params.set("limit", catalogState.limit);

  try {
    const response = await fetch(`${API_URL}/api/books/search?${params.toString()}`);
    if (!response.ok) throw new Error("Erro na busca");

    const data = await response.json();
    const items = data.books.map(mapBookToCard);

    if (items.length === 0) {
      catalogContainer.innerHTML = `
        <div class="catalog-empty">
          <p>Nenhum livro encontrado com os filtros selecionados.</p>
        </div>
      `;
    } else {
      catalogContainer.innerHTML = items
        .map((book) => createBookCard(book, true))
        .join("");
      attachBuyButtons(catalogContainer);
    }

    renderPagination(data.total, data.page, data.totalPages);
  } catch (error) {
    console.error("Erro ao buscar catálogo:", error);
    catalogContainer.innerHTML = `
      <div class="catalog-empty">
        <p>Erro ao carregar livros. Tente novamente.</p>
      </div>
    `;
  }
}

/* ─── Pagination ──────────────────────────────────────────────────── */

function renderPagination(total, currentPage, totalPages) {
  const paginationInfo = document.querySelector("#catalog-pagination .pagination-info");
  const paginationControls = document.querySelector("#catalog-pagination .pagination-controls");

  if (paginationInfo) {
    const showing = Math.min(catalogState.limit, total - (currentPage - 1) * catalogState.limit);
    paginationInfo.textContent = total > 0
      ? `Mostrando ${showing.toString().padStart(2, "0")} de ${total.toString().padStart(2, "0")}`
      : "";
  }

  if (!paginationControls || totalPages <= 1) {
    if (paginationControls) paginationControls.innerHTML = "";
    return;
  }

  let controlsHTML = `
    <button class="page-number" data-page="${currentPage > 1 ? currentPage - 1 : 1}" ${currentPage === 1 ? "disabled" : ""}>
      <img src="/assets/icons/users-pagination-left.svg" alt="Anterior" />
    </button>
  `;

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    controlsHTML += `<button class="page-number" data-page="1">1</button>`;
    if (startPage > 2) {
      controlsHTML += `<span class="page-number" style="pointer-events: none; border: none; background: transparent;">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    controlsHTML += `
      <button class="page-number ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      controlsHTML += `<span class="page-number" style="pointer-events: none; border: none; background: transparent;">...</span>`;
    }
    controlsHTML += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`;
  }

  controlsHTML += `
    <button class="page-number" data-page="${currentPage < totalPages ? currentPage + 1 : totalPages}" ${currentPage === totalPages ? "disabled" : ""}>
      <img src="/assets/icons/users-pagination-right.svg" alt="Próximo" />
    </button>
  `;

  paginationControls.innerHTML = controlsHTML;

  paginationControls.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const newPage = parseInt(btn.dataset.page);
      if (newPage && newPage !== catalogState.page) {
        catalogState.page = newPage;
        loadCatalog();
        const sectionTitle = document.querySelector(".catalog-title");
        if (sectionTitle) sectionTitle.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ─── Init: Wire up events ────────────────────────────────────────── */

function initCatalogEvents() {
  // Search input com debounce
  const searchInput = document.getElementById("catalog-search-input");
  if (searchInput) {
    const debouncedSearch = debounce((value) => {
      catalogState.search = value;
      catalogState.page = 1;
      loadCatalog();
    }, 400);

    searchInput.addEventListener("input", (e) => {
      debouncedSearch(e.target.value);
    });
  }

  // Sort select
  const sortSelect = document.getElementById("catalog-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      catalogState.sort = e.target.value;
      catalogState.page = 1;
      loadCatalog();
    });
  }

  // Clear filters button
  const clearBtn = document.getElementById("catalog-clear-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      catalogState.search = "";
      catalogState.authorIds = [];
      catalogState.genreIds = [];
      catalogState.sort = "";
      catalogState.page = 1;

      // Reset UI
      if (searchInput) searchInput.value = "";
      if (sortSelect) sortSelect.value = "";
      document.querySelectorAll("input[name='author'], input[name='genre']").forEach((cb) => {
        cb.checked = false;
      });

      loadCatalog();
    });
  }
}

/* ─── Main init ───────────────────────────────────────────────────── */

export const initBookList = async () => {
  const container = document.querySelector(".book-list");
  const catalogContainer = document.getElementById("catalog-grid");

  // ── Seção "Favoritos dos pequenos leitores" (top 5 livros) ──
  try {
    const response = await fetch(`${API_URL}/api/books/cards`);
    if (response.ok) {
      const apiBooks = await response.json();
      const items = apiBooks.map(mapBookToCard);

      if (container && items.length > 0) {
        container.innerHTML = items
          .slice(0, 5)
          .map((book) => createBookCard(book, false))
          .join("");
        attachBuyButtons(container);
      }
    }
  } catch (error) {
    console.error("Erro de conexão na API:", error);
  }

  // ── Seção Catálogo com busca, filtros, ordenação e paginação ──
  if (catalogContainer) {
    await loadFilters();
    initCatalogEvents();
    loadCatalog();
  }
};
