const API_URL = window.API_URL;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".register-password-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        btn.innerHTML =
          '<img src="../assets/icons/eye-open-icon.svg" alt="Mostrar" style="width:22px" />';
      } else {
        input.type = "password";
        btn.innerHTML =
          '<img src="../assets/icons/eye-off-icon.svg" alt="Ocultar" style="width:22px" />';
      }
    });
  });
  document.addEventListener("input", (e) => {
    if (e.target.name && e.target.name.endsWith("_cep")) {
      let v = e.target.value.replace(/\D/g, "");
      v = v.replace(/^(\d{5})(\d)/, "$1-$2");
      e.target.value = v;
    }
    if (e.target.name && e.target.name.endsWith("_numero")) {
      e.target.value = e.target.value.replace(/\D/g, "");
    }
    if (e.target.id === "cpf") {
      let v = e.target.value.replace(/\D/g, "");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = v;
    }
    if (e.target.id === "telefone") {
      let v = e.target.value.replace(/\D/g, "");
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d)(\d{4})$/, "$1-$2");
      e.target.value = v;
    }
  });

  let entregaCount = 0;
  let cobrancaCount = 0;

  const entregaContainer = document.getElementById(
    "entrega-addresses-container",
  );
  const cobrancaContainer = document.getElementById(
    "cobranca-addresses-container",
  );
  const cobrancaSection = document.getElementById("cobranca-section");
  const sameAsBillingCheckbox = document.getElementById("same-as-billing");

  function createAddressBlockHTML(type, index) {
    const prefix = `${type}_${index}`;
    const label = type === "entrega" ? "Entrega" : "Cobrança";

    return `
      <div class="register-address-block" data-type="${type}" data-index="${index}">
        <div class="register-address-header">
          <span>Endereço de ${label} #${index + 1}</span>
          <button type="button" class="register-address-remove" data-type="${type}" data-index="${index}">
            Remover
          </button>
        </div>
        <div class="register-form-grid">
          <div class="form-group">
            <label class="label-admin">Tipo de logradouro <span style="color: red">*</span></label>
            <select name="${prefix}_tipo_logradouro" required>
              <option value="" disabled selected>Selecione</option>
              <option value="Rua">Rua</option>
              <option value="Avenida">Avenida</option>
              <option value="Travessa">Travessa</option>
              <option value="Alameda">Alameda</option>
              <option value="Praça">Praça</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label-admin">Logradouro <span style="color: red">*</span></label>
            <input type="text" name="${prefix}_logradouro" placeholder="Nome da rua" required />
          </div>

          <div class="form-group">
            <label class="label-admin">Número <span style="color: red">*</span></label>
            <input type="text" name="${prefix}_numero" placeholder="123" maxlength="10" required />
          </div>

          <div class="form-group">
            <label class="label-admin">Bairro <span style="color: red">*</span></label>
            <input type="text" name="${prefix}_bairro" placeholder="Bairro" required />
          </div>

          <div class="form-group">
            <label class="label-admin">CEP <span style="color: red">*</span></label>
            <input type="text" name="${prefix}_cep" placeholder="00000-000" maxlength="9" required />
          </div>

          <div class="form-group">
            <label class="label-admin">Cidade <span style="color: red">*</span></label>
            <input type="text" name="${prefix}_cidade" placeholder="Cidade" required />
          </div>

          <div class="form-group">
            <label class="label-admin">Estado <span style="color: red">*</span></label>
            <select name="${prefix}_estado" required>
              <option value="" disabled selected>Selecione</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label-admin">País <span style="color: red">*</span></label>
            <input type="text" name="${prefix}_pais" placeholder="Brasil" value="Brasil" required />
          </div>

          <div class="form-group">
            <label class="label-admin">Observações</label>
            <input type="text" name="${prefix}_observacoes" placeholder="Apto, bloco, referência..." />
          </div>
        </div>
      </div>
    `;
  }

  function updateAddressLabels(type) {
    const container = type === "entrega" ? entregaContainer : cobrancaContainer;
    const blocks = container.querySelectorAll(".register-address-block");
    const labelPrefix = type === "entrega" ? "Entrega" : "Cobrança";

    blocks.forEach((block, idx) => {
      const headerSpan = block.querySelector(".register-address-header span");
      if (headerSpan) {
        headerSpan.textContent = `Endereço de ${labelPrefix} #${idx + 1}`;
      }
    });
  }

  function addAddressBlock(type) {
    const container = type === "entrega" ? entregaContainer : cobrancaContainer;
    const index = type === "entrega" ? entregaCount++ : cobrancaCount++;
    container.insertAdjacentHTML("beforeend", createAddressBlockHTML(type, index));
    updateAddressLabels(type);
  }

  addAddressBlock("entrega");

  document.getElementById("btn-add-entrega").addEventListener("click", () => {
    addAddressBlock("entrega");
  });

  document.getElementById("btn-add-cobranca").addEventListener("click", () => {
    addAddressBlock("cobranca");
  });

  document.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".register-address-remove");
    if (!removeBtn) return;
    const block = removeBtn.closest(".register-address-block");
    if (block) {
      const type = block.dataset.type;
      block.remove();
      updateAddressLabels(type);
    }
  });

  sameAsBillingCheckbox.addEventListener("change", () => {
    if (sameAsBillingCheckbox.checked) {
      cobrancaSection.style.display = "none";
      cobrancaContainer
        .querySelectorAll("[required]")
        .forEach((el) => (el.required = false));
    } else {
      cobrancaSection.style.display = "";
      cobrancaContainer
        .querySelectorAll("input, select")
        .forEach((el) => {
          if (!el.name.includes("_observacoes")) {
            el.required = true;
          }
        });
      if (cobrancaContainer.children.length === 0) {
        addAddressBlock("cobranca");
      }
    }
  });

  function collectAddressData(block, type) {
    const prefix = `${type}_${block.dataset.index}`;
    const get = (field) => {
      const el = block.querySelector(`[name="${prefix}_${field}"]`);
      return el ? el.value : "";
    };

    return {
      alias: "Meu Endereço",
      residence_type: "Casa",
      street_type: get("tipo_logradouro"),
      street_name: get("logradouro"),
      street_number: get("numero"),
      neighborhood: get("bairro"),
      zip_code: get("cep").replace(/\D/g, ""),
      city: get("cidade"),
      state: get("estado"),
      country: get("pais"),
      observations: get("observacoes"),
      is_delivery: type === "entrega",
      is_billing: type === "cobranca",
    };
  }

  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar_senha").value;

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    const entregaBlocks = entregaContainer.querySelectorAll(
      ".register-address-block",
    );
    if (entregaBlocks.length === 0) {
      alert("Adicione pelo menos um endereço de entrega.");
      return;
    }

    const cobrancaBlocks = cobrancaContainer.querySelectorAll(
      ".register-address-block",
    );
    if (!sameAsBillingCheckbox.checked && cobrancaBlocks.length === 0) {
      alert(
        "Adicione pelo menos um endereço de cobrança ou marque para usar o mesmo de entrega.",
      );
      return;
    }

    const telefoneRaw = document.getElementById("telefone").value.replace(/\D/g, "");
    let phone_ddd = "";
    let phone_number = "";
    if (telefoneRaw.length >= 10) {
      phone_ddd = telefoneRaw.substring(0, 2);
      phone_number = telefoneRaw.substring(2);
    } else {
      phone_number = telefoneRaw;
    }
    const phone_type = telefoneRaw.length >= 11 ? "Celular" : "Fixo";

    const userData = {
      gender: document.getElementById("genero").value,
      full_name: document.getElementById("nome").value,
      birth_date: document.getElementById("data_nascimento").value,
      cpf: document.getElementById("cpf").value.replace(/\D/g, ""),
      phone_type: phone_type,
      phone_ddd: phone_ddd,
      phone_number: phone_number,
      email: document.getElementById("email").value,
      password_hash: senha,
    };

    const allAddresses = [];

    entregaBlocks.forEach((block) => {
      allAddresses.push(collectAddressData(block, "entrega"));
    });

    if (sameAsBillingCheckbox.checked) {
      entregaBlocks.forEach((block) => {
        const billingCopy = collectAddressData(block, "entrega");
        billingCopy.is_delivery = false;
        billingCopy.is_billing = true;
        allAddresses.push(billingCopy);
      });
    } else {
      cobrancaBlocks.forEach((block) => {
        allAddresses.push(collectAddressData(block, "cobranca"));
      });
    }

    const confirmSave = confirm("Deseja confirmar o cadastro?");
    if (!confirmSave) return;

    try {
      const userRes = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!userRes.ok) {
        const err = await userRes.json();
        alert("Erro ao criar usuário: " + (err.details || err.error || ""));
        return;
      }

      const createdResponse = await userRes.json();
      const userId = createdResponse.user?.id || createdResponse.id;
      const userToken = createdResponse.token;

      for (const addr of allAddresses) {
        try {
          await fetch(`${API_URL}/api/addresses`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${userToken}`
            },
            body: JSON.stringify({ ...addr, user_id: userId }),
          });
        } catch (err) {
          console.error("Erro ao salvar endereço:", err);
        }
      }

      alert("Cadastro realizado com sucesso!");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert(
        "Erro de conexão com o servidor. Verifique se o backend está rodando.",
      );
    }
  });
});
