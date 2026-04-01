import { getIsAuthenticated, getUser, logout } from "../hooks/useAuth.js";

export const initTopbar = () => {
  const topbar = document.querySelector(".topbar");

  if (!topbar) return;

  const isAuthenticated = getIsAuthenticated();
  const user = getUser();
  const userName = user?.full_name || user?.name || "Usuário";

  const rightContentHTML = isAuthenticated
    ? `
      <div class="topbar__logged-actions">
        ${user?.role === "admin" ? `
        <a href="/pages/admin/dashboard/index.html" class="topbar__action-link" aria-label="Admin">
         <span>Admin</span>
        </a>
        <div class="topbar__divider"></div>
        ` : ""}

        <a href="/pages/cart.html" class="topbar__action-link" aria-label="Carrinho">
          <img src="/assets/icons/home-cart.svg" alt="Carrinho" width="24" />
        </a>

        <div class="topbar__divider"></div>

        <a href="/pages/client/addresses/index.html" class="topbar__action-link" aria-label="Perfil">
          <span>${userName}</span>
          <img src="/assets/icons/home-profile.svg" alt="Perfil" width="24" />
        </a>

        <div class="topbar__divider"></div>

        <button class="topbar__action-btn" id="topbar-logout-btn">
          <span>Sair</span>
          <img src="/assets/icons/home-logout.svg" alt="Sair" width="24" />
        </button>
      </div>
    `
    : `
      <div class="topbar__actions">
        <a href="/pages/login.html" class="topbar__btn-login">
          Entrar
        </a>
      </div>
    `;

  topbar.innerHTML = `
    <div class="topbar__wrapper">
      <a href="/" class="topbar__logo-link">
        <img src="/assets/images/logo-lume.svg" alt="Lume Logo" class="topbar__logo" />
      </a>

      ${rightContentHTML}
    </div>
  `;

  if (isAuthenticated) {
    const logoutBtn = document.querySelector("#topbar-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        logout();
      });
    }
  } else {
    const loginBtn = document.querySelector(".topbar__btn-login");
    if (loginBtn) {
      loginBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = "/pages/login.html";
      });
    }
  }
};
