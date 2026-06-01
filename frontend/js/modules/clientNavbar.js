import { getUser, logout, localStorageKeys } from "../hooks/useAuth.js";
const API_URL = window.API_URL;

export const initClientNavbar = () => {
  const sidebar = document.querySelector(".client-sidebar");
  if (!sidebar) return;

  sidebar.innerHTML = `
    <h2 class="client-sidebar__title">Atalhos</h2>
    <nav class="client-sidebar__nav">
      <a href="/pages/client/profile/index.html" class="client-sidebar__link nav-profile">Meu perfil</a>
      <a href="/pages/client/addresses/index.html" class="client-sidebar__link nav-addresses">Endereços</a>
      <a href="/pages/client/cards/index.html" class="client-sidebar__link nav-cards">Cartões</a>
      <a href="/pages/client/orders/index.html" class="client-sidebar__link nav-orders">Pedidos e devoluções</a>
      <a href="/pages/client/coupons/index.html" class="client-sidebar__link nav-coupons">Cupons</a>
    </nav>
  `;

  const path = window.location.pathname;

  const routes = [
    { path: "/client/addresses", selector: ".nav-addresses" },
    { path: "/client/cards", selector: ".nav-cards" },
    { path: "/client/profile", selector: ".nav-profile" },
    { path: "/client/orders", selector: ".nav-orders" },
    { path: "/client/coupons", selector: ".nav-coupons" },
  ];

  for (const route of routes) {
    if (path.includes(route.path)) {
      const link = document.querySelector(route.selector);
      if (link) link.classList.add("active");
      break;
    }
  }
};

export const initClientTopbar = () => {
  const topbar = document.querySelector(".client-topbar");
  if (!topbar) return;

  const user = getUser();
  const userName = user?.full_name || user?.name || "Usuário";

  topbar.innerHTML = `
    <div class="client-topbar__left">
      <a href="/">
        <img src="/assets/images/logo-lume.svg" alt="Lume" class="client-topbar__logo" />
      </a>
    </div>
    <div class="client-topbar__right">
      <a href="/pages/client/cart.html">
        <img id="client-cart-icon" src="/assets/icons/home-cart.svg" alt="Carrinho" width="22" />
      </a>
      <div class="client-topbar__divider"></div>
      <a href="/pages/client/profile/index.html">
        <span>${userName}</span>
        <img src="/assets/icons/home-profile.svg" alt="Perfil" width="22" />
      </a>
      <div class="client-topbar__divider"></div>
      <button id="client-logout-btn">
        <span>Sair</span>
        <img src="/assets/icons/home-logout.svg" alt="Sair" width="22" />
      </button>
    </div>
  `;

  const logoutBtn = document.querySelector("#client-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }

  const token = localStorage.getItem(localStorageKeys.accessToken) || sessionStorage.getItem(localStorageKeys.accessToken);
  if (token) {
    fetch(`${API_URL}/api/cart/count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.count > 0) {
          const cartIcon = document.getElementById("client-cart-icon");
          if (cartIcon) {
            cartIcon.src = "/assets/icons/home-cart-notification.svg";
          }
        }
      })
      .catch((err) => console.error("Erro ao verificar carrinho:", err));
  }
};

export const initClientFooter = () => {
  const footer = document.querySelector(".client-footer");
  if (!footer) return;

  footer.innerHTML = `
    <div class="client-footer__wrapper">
      <div class="client-footer__left">
        <span class="client-footer__text" style="font-weight: 700;">Fale conosco</span>
        <a href="mailto:contato@lume.com" class="client-footer__text">
          <img src="/assets/icons/email.svg" alt="E-mail" width="18" />
          www.contato@lume.com
        </a>
      </div>
      <div>
        <img src="/assets/images/logo-lume.svg" alt="Lume" class="client-footer__logo" />
      </div>
    </div>
  `;
};
