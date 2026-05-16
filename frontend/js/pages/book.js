import { formatCurrency } from "../utils/format.js";
import { initTopbar } from "../modules/topbar.js";
import { getIsAuthenticated, localStorageKeys } from "../hooks/useAuth.js";

document.addEventListener("DOMContentLoaded", () => {
  initTopbar();
  loadProductDetails();
});

async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get("id");

  if (!bookId) {
    document.getElementById("product-details").innerHTML = "<p style='padding: 2rem; text-align: center; color: var(--color-gray-500);'>Livro não encontrado.</p>";
    document.getElementById("breadcrumb-title").textContent = "Erro";
    return;
  }

  try {
    const response = await fetch(`http://localhost:3333/api/books/${bookId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Livro não encontrado no catálogo.");
      }
      throw new Error("Erro ao carregar os detalhes do livro.");
    }
    
    const book = await response.json();
    renderProductDetails(book);
  } catch (err) {
    document.getElementById("product-details").innerHTML = `<p style='padding: 2rem; text-align: center; color: var(--color-error, red);'>${err.message}</p>`;
    document.getElementById("breadcrumb-title").textContent = "Erro";
  }
}

function renderProductDetails(book) {
  const container = document.getElementById("product-details");
  
  const price = typeof book.price === "string" 
    ? parseFloat(book.price.replace("R$", "").replace(",", ".")) 
    : book.price;
    
  let imageUrl = "../assets/books/upload.svg";
  if (book.cover_image) {
    if (book.cover_image.startsWith('http')) {
      imageUrl = book.cover_image;
    } else if (book.cover_image.startsWith('/')) {
      imageUrl = `../assets${book.cover_image}`;
    } else if (book.cover_image.startsWith('assets/')) {
      imageUrl = `../${book.cover_image}`;
    } else {
      imageUrl = `../assets/${book.cover_image}`;
    }
  }
    
  const isAvailable = book.stock_quantity > 0;

  document.getElementById("breadcrumb-title").textContent = book.title;
  
  const description = book.synopsis || book.description || "Descrição detalhada não disponível para este livro.";
  
  const html = `
    <div class="product-image-container">
      <img src="${imageUrl}" alt="${book.title}" class="product-image" />
    </div>
    
    <div class="product-info">
      <h1 class="product-title">${book.title}</h1>
      <div class="product-author">por <strong>${book.author_name || "Desconhecido"}</strong></div>
      
      <div class="product-price">${formatCurrency(price)}</div>
      
      <div class="product-description">
        ${description}
      </div>
      
      <div class="product-actions">
        <button id="add-to-cart-btn" class="btn-add-cart" ${!isAvailable ? 'disabled' : ''}>
          <img src="../assets/icons/cart-white.svg" alt="Carrinho" width="24" />
          ${isAvailable ? 'Adicionar ao Carrinho' : 'Indisponível'}
        </button>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  const btn = document.getElementById("add-to-cart-btn");
  if (btn) {
    btn.addEventListener("click", () => handleAddToCart(book.id, btn));
  }
}

async function handleAddToCart(bookId, btn) {
  const isAuthenticated = getIsAuthenticated();

  if (!isAuthenticated) {
    window.location.href = "/pages/login.html";
    return;
  }

  btn.disabled = true;

  const token =
    localStorage.getItem(localStorageKeys.accessToken) ||
    sessionStorage.getItem(localStorageKeys.accessToken);

  try {
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

    const cartIcons = document.querySelectorAll("#topbar-cart-icon, #client-cart-icon");
    cartIcons.forEach((icon) => {
      icon.src = "../assets/icons/home-cart-notification.svg";
    });

    window.location.href = "/pages/client/cart.html";
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
  }
}
