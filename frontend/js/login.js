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

      const email = emailInput.value.trim();
      const pass = input.value.trim();

      if (!email || !pass) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      submitBtn.disabled = true;

      try {
        const response = await fetch("https://lume-api-xi0p.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || "Erro ao realizar login");
          submitBtn.disabled = false;
          return;
        }

        localStorage.setItem(localStorageKeys.user, JSON.stringify(data.user));
        localStorage.setItem(localStorageKeys.accessToken, data.token);

        if (data.user.role === "admin") {
          window.location.replace("/pages/admin/users/index.html");
        } else {
          window.location.replace("/");
        }
      } catch (err) {
        console.error("Erro no login:", err);
        alert("Servidor indisponível no momento.");
        submitBtn.disabled = false;
      }
    });
  }
});
