export const initAdminNavbar = () => {
  const navbar = document.querySelector(".navbar");

  if (!navbar) return;

  navbar.innerHTML = `
    <div class="top">
      <img src="/assets/images/logo-lume.svg" alt="Logo Lume" />
    </div>
    <div class="middle">
      <div class="option">
        <img src="/assets/icons/users-off.svg" alt="Ícone" />
        <a href="/admin/users.html">Usuários</a>
      </div>
      <div class="option">
        <img src="/assets/icons/dashboard-off.svg" alt="Ícone" />
        <a href="/admin/dashboard.html">Dashboard</a>
      </div>
      <div class="option">
        <img src="/assets/icons/orders-off.svg" alt="Ícone" />
        <a href="/admin/orders.html">Pedidos</a>
      </div>
      <div class="option">
        <img src="/assets/icons/cupons-off.svg" alt="Ícone" />
        <a href="/admin/cupons.html">Cupons</a>
      </div>
    </div>
    <div class="bottom">
      <div class="logout" id="logout-btn">
        <img src="/assets/icons/left-off.svg" alt="Ícone" />
        <a href="#">Sair</a>
      </div>
    </div>
  `;

  const logoutBtn = document.querySelector("#logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "/login.html";
    });
  }
};
