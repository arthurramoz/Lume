import { usersMock } from "../mock/users.js";

const createUserRow = (user) => `
  <div class="table-row users-table" >
    <span class="col-code">#${user.id}</span>
    <span>${user.name}</span>
    <span>${user.email}</span>
    <span>${user.phone}</span>
    <span>${user.status ? "Ativo" : "Inativo"}</span>
    <div class="col-actions">
      <button class="icon-btn" aria-label="Editar">
        <img src="/assets/icons/users-edit-blue.svg" alt="" />
      </button>
      <button class="icon-btn" aria-label="Deletar">
        <img src="/assets/icons/users-trash.svg" alt="" />
      </button>
      <button class="toggle-btn ${user.status ? "active" : ""}" aria-pressed="${user.status}">
        <div class="toggle-circle"></div>
      </button>
    </div>
  </div>
`;

const renderEmptyState = () => `
  <div class="empty-state">
    <img src="/assets/icons/empty-cloud.svg" alt="" class="empty-state__img" />
    <p class="empty-state__text">Ainda não há usuários cadastrados</p>
    <button class="btn-primary">
      <img src="/assets/icons/users-plus.svg" alt="+" width="16" />
      Adicionar
    </button>
  </div>
`;

export const initUserList = () => {
  const tableBody = document.querySelector(".table-body");
  const tableContainer = document.querySelector(".table-container");

  if (!tableBody || !tableContainer) return;

  if (usersMock.length === 0) {
    tableContainer.innerHTML = renderEmptyState();
    return;
  }

  tableBody.innerHTML = usersMock.map(createUserRow).join("");

  tableBody.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".toggle-btn");

    if (toggleBtn) {
      const isActive = toggleBtn.classList.toggle("active");
      toggleBtn.setAttribute("aria-pressed", isActive);

      const statusSpan = toggleBtn
        .closest(".table-row")
        .querySelector("span:nth-child(5)");
      statusSpan.textContent = isActive ? "Ativo" : "Inativo";
    }
  });
};
