import { logout } from "../hooks/useAuth.js";

export const initAdminNavbar = () => {
  const navbar = document.querySelector(".navbar");

  if (!navbar) return;

  navbar.innerHTML = `
    <div class="top">
        <img src="/assets/images/logo-lume.svg" alt="Logo Lume" class="logo" />
    </div>
    <div class="middle">
      <div class="option nav-users">
        <img src="/assets/icons/users-off.svg" alt="Ícone" />
        <a href="/pages/admin/users/index.html">Usuários</a>
      </div>
      <div class="option nav-dashboard">
        <img src="/assets/icons/dashboard-off.svg" alt="Ícone" />
        <a href="/pages/admin/dashboard/index.html">Dashboard</a>
      </div>
      <div class="option nav-orders">
        <img src="/assets/icons/orders-off.svg" alt="Ícone" />
        <a href="/pages/admin/orders">Pedidos</a>
      </div>
      <div class="option nav-cupons">
        <img src="/assets/icons/cupons-off.svg" alt="Ícone" />
        <a href="/pages/admin/cupons">Cupons</a>
      </div>
    </div>
    <div class="bottom">
      <div class="logout" id="logout-btn">
        <img src="/assets/icons/left-off.svg" alt="Ícone" />
        <a href="#">Sair</a>
      </div>
    </div>
  `;

  const path = window.location.pathname;

  if (path.includes("/admin/users")) {
    const usersOption = document.querySelector(".nav-users");
    const usersIcon = usersOption?.querySelector("img");

    if (usersOption) usersOption.style.color = "var(--color-primaria100)";
    if (usersIcon) usersIcon.src = "/assets/icons/users-on.svg";
  }

  if (path.includes("/admin/dashboard")) {
    const dashboardOption = document.querySelector(".nav-dashboard");
    const dashboardIcon = dashboardOption?.querySelector("img");

    if (dashboardOption)
      dashboardOption.style.color = "var(--color-primaria100)";
    if (dashboardIcon) dashboardIcon.src = "/assets/icons/dashboard-on.svg";
  }

  if (path.includes("/admin/orders")) {
    const ordersOption = document.querySelector(".nav-orders");
    const ordersIcon = ordersOption?.querySelector("img");

    if (ordersOption) ordersOption.style.color = "var(--color-primaria100)";
    if (ordersIcon) ordersIcon.src = "/assets/icons/orders-on.svg";
  }

  if (path.includes("/admin/cupons")) {
    const cupomOption = document.querySelector(".nav-cupons");
    const cupomIcon = cupomOption?.querySelector("img");

    if (cupomOption) cupomOption.style.color = "var(--color-primaria100)";
    if (cupomIcon) cupomIcon.src = "/assets/icons/cupons-on.svg";
  }

  const logo = document.querySelector(".logo");
  const logoutBtn = document.querySelector("#logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }
  if (logo) {
    logo.addEventListener("click", function () {
      window.location.href = "/";
    });
  }
};
