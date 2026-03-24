const createUserRow = (user) => {
  const formattedPhone = user.phone_ddd && user.phone_number 
    ? `(${user.phone_ddd}) ${user.phone_number}` 
    : user.phone_number || "Sem telefone";
    
  // Vamos assumir Ativo por padrão se não houver campo de status no banco de dados ainda
  const statusAtivo = user.status !== undefined ? user.status : true;

  return `
  <div class="table-row users-table" >
    <span class="col-code">#${user.id}</span>
    <span>${user.full_name || user.nome || "---"}</span>
    <span>${user.email}</span>
    <span>${formattedPhone}</span>
    <span>${statusAtivo ? "Ativo" : "Inativo"}</span>
    <div class="col-actions">
      <button class="icon-btn" aria-label="Visualizar">
        <img src="/assets/icons/eye-open-icon.svg" alt="" />
      </button>
      <button class="icon-btn" aria-label="Editar">
        <img src="/assets/icons/users-edit-blue.svg" alt="" />
      </button>
      <button class="icon-btn" aria-label="Deletar">
        <img src="/assets/icons/users-trash.svg" alt="" />
      </button>
      <button class="toggle-btn ${statusAtivo ? "active" : ""}" aria-pressed="${statusAtivo}">
        <div class="toggle-circle"></div>
      </button>
    </div>
  </div>
`;
};

const renderEmptyState = () => `
  <div class="empty-state">
    <img src="/assets/icons/empty-cloud.svg" alt="" class="empty-state__img" />
    <p class="empty-state__text">Ainda não há usuários cadastrados</p>
    <button class="btn-primary" onclick="window.location.href='/pages/admin/users/create/index.html'">
      <img src="/assets/icons/users-plus.svg" alt="+" width="16" />
      Adicionar
    </button>
  </div>
`;

export const initUserList = async () => {
  const tableBody = document.querySelector(".table-body");
  const tableContainer = document.querySelector(".table-container");

  if (!tableBody || !tableContainer) return;

  try {
    const response = await fetch("http://localhost:3333/api/users");
    
    if (!response.ok) {
      throw new Error("Erro na resposta da API");
    }

    const users = await response.json();

    if (users.length === 0) {
      tableContainer.innerHTML = renderEmptyState();
      return;
    }

    const renderTable = (data) => {
      if (data.length === 0) {
        tableBody.innerHTML = `<div class="empty-state" style="padding: 20px;"><p class="empty-state__text">Nenhum usuário encontrado</p></div>`;
      } else {
        tableBody.innerHTML = data.map(createUserRow).join("");
      }
    };

    renderTable(users);

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", async (e) => {
        const term = e.target.value;
        let url = "http://localhost:3333/api/users";
        
        if (term) {
          url = `http://localhost:3333/api/users?search=${term}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        renderTable(data);
      });
    }

    tableBody.addEventListener("click", async (e) => {
      const toggleBtn = e.target.closest(".toggle-btn");

      if (toggleBtn) {
        const row = toggleBtn.closest(".table-row");
        let idText = row.querySelector(".col-code").textContent.trim();
        if (idText.startsWith("#")) {
          idText = idText.substring(1);
        }

        const isActive = toggleBtn.classList.toggle("active");
        toggleBtn.setAttribute("aria-pressed", isActive);

        const statusSpan = row.querySelector("span:nth-child(5)");
        statusSpan.textContent = isActive ? "Ativo" : "Inativo";

        try {
          const res = await fetch(`http://localhost:3333/api/users/${idText}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: isActive })
          });
          
          if (!res.ok) {
            throw new Error("Erro ao atualizar status na API");
          }
        } catch (error) {
          console.error("Erro ao atualizar status:", error);
          const reverted = toggleBtn.classList.toggle("active");
          toggleBtn.setAttribute("aria-pressed", reverted);
          statusSpan.textContent = reverted ? "Ativo" : "Inativo";
          alert("Erro ao atualizar status do usuário");
        }
      }
    });

  } catch (error) {
    console.error("Erro ao buscar usuários da API:", error);
    tableContainer.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__text" style="color: red;">Erro ao tentar buscar lista de usuários. O servidor pode estar offline.</p>
      </div>
    `;
  }
};
