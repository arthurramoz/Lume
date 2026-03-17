export const initTopbar = () => {
  const topbar = document.querySelector(".topbar");

  if (!topbar) return;

  topbar.innerHTML = `
    <div class="topbar__wrapper">
      <a href="/" class="topbar__logo-link">
        <img src="assets/images/logo-lume.svg" alt="Lume Logo" class="topbar__logo" />
      </a>

      <div class="topbar__actions">
        <a href="/login" class="topbar__btn-login">
          Entrar
        </a>
      </div>
    </div>
  `;

  const loginBtn = document.querySelector(".topbar__btn-login");

  loginBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "/pages/login.html";
  });
};
