import { localStorageKeys } from "./hooks/useAuth.js";

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("senha");
  const emailInput = document.getElementById("email");
  const botao = document.getElementById("toggleSenha");
  const backBtn = document.querySelector(".back");
  const submitBtn = document.querySelector(".book-card__btn");

  if (botao && input) {
    botao.addEventListener("click", function () {
      if (input.type === "password") {
        input.type = "text";
        botao.innerHTML =
          '<img src="../assets/icons/eye-open-icon.svg" alt="Mostrar" />';
      } else {
        input.type = "password";
        botao.innerHTML =
          '<img src="../assets/icons/eye-off-icon.svg" alt="Ocultar" />';
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.location.href = "/";
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const email = emailInput.value;
      const pass = input.value;

      if (!email || !pass) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      submitBtn.disabled = true;

      await new Promise((resolve) => setTimeout(resolve, 1200));

      const fakeUser = {
        id: 1,
        name: "Usuário Teste",
        email: email,
        role: "admin",
      };

      localStorage.setItem(localStorageKeys.user, JSON.stringify(fakeUser));
      localStorage.setItem(
        localStorageKeys.accessToken,
        "fake-jwt-access-token",
      );

      window.location.replace("/");
    });
  }
});
