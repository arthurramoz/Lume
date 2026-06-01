import { localStorageKeys } from "../hooks/useAuth.js";

const API_URL = window.API_URL;
const API_BASE = `${API_URL}/api`;
const ORDERS_PER_PAGE = 10;

let currentPage = 1;
let allOrders = [];
let filteredOrders = [];

const STATUS_LABEL = {
    em_processamento: "Em processamento",
    em_transito: "Em trânsito",
    entregue: "Entregue",
    em_troca: "Em troca",
    solicitacao_de_troca: "Solicitação de troca",
    troca_autorizada: "Troca autorizada",
    troca_concluida: "Troca concluída",
    "Em processamento": "Em processamento",
    "Em trânsito": "Em trânsito",
    Entregue: "Entregue",
    "Em troca": "Em troca",
    "Solicitação de troca": "Solicitação de troca",
    "Troca autorizada": "Troca autorizada",
    "Troca concluída": "Troca concluída",
};

const EDITABLE_STATUSES = new Set([
    "em_processamento",
    "em_transito",
    "entregue",
    "em_troca",
    "troca_autorizada",
]);

const EXCHANGE_STATUSES = new Set([
    "em_troca",
    "troca_autorizada",
    "troca_concluida",
]);

function getToken() {
    return (
        localStorage.getItem(localStorageKeys.accessToken) ||
        sessionStorage.getItem(localStorageKeys.accessToken)
    );
}

function formatDate(dateStr) {
    if (!dateStr) return "---";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatCurrency(value) {
    if (value === undefined || value === null) return "---";
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function statusLabel(status) {
    return STATUS_LABEL[status] || status || "---";
}

function createOrderRow(order) {
    const isEditable = EDITABLE_STATUSES.has(order.status);

    const editBtn = isEditable
        ? `<button class="action-btn" aria-label="Editar" data-id="${order.id}" data-status="${order.status}" title="Editar status">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>`
        : "";

    return `
    <div class="table-row orders-table" data-id="${order.id}">
      <span class="col-code">#${String(order.id).padStart(2, "0")}</span>
      <span>${formatDate(order.created_at)}</span>
      <span>${order.client_name || "---"}</span>
      <span>${formatCurrency(order.total_amount)}</span>
      <span>---</span>
      <span class="status-badge">${statusLabel(order.status)}</span>
      <div class="col-actions">
        ${editBtn}
        <button class="action-btn" aria-label="Visualizar" data-id="${order.id}" title="Ver detalhes">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    </div>`;
}

function renderTable() {
    const tableBody = document.getElementById("orders-table-body");
    if (!tableBody) return;

    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `<div class="orders-empty">Nenhum pedido encontrado.</div>`;
        updatePagination(0);
        return;
    }

    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    const pageSlice = filteredOrders.slice(start, start + ORDERS_PER_PAGE);

    tableBody.innerHTML = pageSlice.map(createOrderRow).join("");
    updatePagination(totalPages);
}

function updatePagination(totalPages) {
    const info = document.getElementById("pagination-info");
    const numbers = document.getElementById("page-numbers");
    const prevBtn = document.getElementById("prev-page");
    const nextBtn = document.getElementById("next-page");

    const safeTotalPages = Math.max(totalPages, 1);

    if (info)
        info.textContent = `Mostrando ${currentPage} de ${safeTotalPages}`;

    if (numbers) {
        numbers.innerHTML = "";

        for (let i = 1; i <= safeTotalPages; i++) {
            const btn = document.createElement("button");
            btn.className = `page-number${i === currentPage ? " active" : ""}`;
            btn.textContent = i;
            btn.addEventListener("click", () => {
                currentPage = i;
                renderTable();
            });
            numbers.appendChild(btn);
        }
    }

    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
        prevBtn.style.opacity = currentPage <= 1 ? "0.4" : "1";
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage >= safeTotalPages;
        nextBtn.style.opacity = currentPage >= safeTotalPages ? "0.4" : "1";
        nextBtn.onclick = () => {
            if (currentPage < safeTotalPages) {
                currentPage++;
                renderTable();
            }
        };
    }
}

function openEditModal(orderId, currentStatus) {
    const existing = document.getElementById("edit-order-modal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "edit-order-modal";
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
        <div class="modal-content modal-content--sm">
            <h2 class="modal-title">Editar status</h2>
            <p class="modal-subtitle">Altere o status do pedido #${String(orderId).padStart(2, "0")}:</p>

            <div class="form-group" style="margin-bottom: 24px;">
                <div class="select-edit-wrapper">
                    <select id="modal-order-status-select">
                    </select>
                    <span class="select-chevron">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                </div>
            </div>

            <div id="exchange-coupon-note" style="display:none; background:var(--color-secundaria20,#e8f5e9); border:1px solid var(--color-success1,#22c55e); border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:13px; color:var(--color-neutro100);">
                <strong>&#9432; Cupom de troca será gerado</strong><br/>
                Ao concluir a troca, um cupom de troca no valor de <strong id="exchange-coupon-value"></strong> será emitido automaticamente para o cliente.
            </div>

            <div class="modal-buttons">
                <button class="btn-outline" id="modal-btn-cancelar">Cancelar</button>
                <button class="btn-primary" id="modal-btn-salvar">Salvar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const order = allOrders.find((o) => o.id == orderId);

    const select = document.getElementById("modal-order-status-select");
    const noteEl = document.getElementById("exchange-coupon-note");
    const noteValueEl = document.getElementById("exchange-coupon-value");

    async function loadExchangeValue() {
        try {
            const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
                const detail = await res.json();
                if (detail.exchange_items && detail.exchange_items.length > 0) {
                    let total = 0;
                    for (const ei of detail.exchange_items) {
                        total += Number(ei.price) * Number(ei.quantity);
                    }
                    if (noteValueEl) noteValueEl.textContent = formatCurrency(total);
                    return;
                }
            }
        } catch (e) { /* fallback */ }
        if (noteValueEl) noteValueEl.textContent = formatCurrency(order ? Number(order.total_amount || 0) : 0);
    }
    loadExchangeValue();

    function updateExchangeNote() {
        if (noteEl) {
            noteEl.style.display = select.value === "troca_concluida" ? "block" : "none";
        }
    }

    if (select) {
        const isExchangeFlow = EXCHANGE_STATUSES.has(currentStatus);

        const options = isExchangeFlow
            ? [
                  { value: "em_troca", label: "Em troca" },
                  { value: "troca_autorizada", label: "Troca autorizada" },
                  { value: "troca_concluida", label: "Troca concluída" },
              ]
            : [
                  { value: "em_processamento", label: "Em processamento" },
                  { value: "em_transito", label: "Em trânsito" },
                  { value: "entregue", label: "Entregue" },
              ];

        select.innerHTML = options
            .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
            .join("");

        if (currentStatus) {
            select.value = currentStatus;
        }

        select.addEventListener("change", updateExchangeNote);
        updateExchangeNote();
    }

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeEditModal();
    });

    const escHandler = (e) => {
        if (e.key === "Escape") {
            closeEditModal();
            document.removeEventListener("keydown", escHandler);
        }
    };
    document.addEventListener("keydown", escHandler);

    document
        .getElementById("modal-btn-cancelar")
        .addEventListener("click", closeEditModal);

    document
        .getElementById("modal-btn-salvar")
        .addEventListener("click", async () => {
            const newStatus = select.value;
            const btnSalvar = document.getElementById("modal-btn-salvar");

            try {
                btnSalvar.disabled = true;
                btnSalvar.textContent = "Salvando...";

                const res = await fetch(
                    `${API_BASE}/admin/orders/${orderId}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getToken()}`,
                        },
                        body: JSON.stringify({ status: newStatus }),
                    },
                );

                if (res.ok) {
                    const order = allOrders.find((o) => o.id == orderId);
                    if (order) order.status = newStatus;
                    filteredOrders = filteredOrders.map((o) =>
                        o.id == orderId ? { ...o, status: newStatus } : o,
                    );
                    renderTable();
                    attachTableListeners();
                    closeEditModal();
                } else {
                    const errData = await res.json();
                    alert(
                        "Erro ao atualizar status: " +
                            (errData.error || errData.message || ""),
                    );
                }
            } catch (error) {
                console.error("Erro ao salvar status:", error);
                alert("Erro de conexão ao salvar status.");
            } finally {
                btnSalvar.disabled = false;
                btnSalvar.textContent = "Salvar";
            }
        });
}

function closeEditModal() {
    const modal = document.getElementById("edit-order-modal");
    if (modal) modal.remove();
}

function applyFilter(statusValue) {
    if (!statusValue) {
        filteredOrders = [...allOrders];
    } else {
        filteredOrders = allOrders.filter(
            (o) =>
                o.status === statusValue ||
                statusLabel(o.status) === statusValue,
        );
    }
    currentPage = 1;
    renderTable();
}

async function openDetailsModal(orderId) {
    const existing = document.getElementById("details-order-modal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "details-order-modal";
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
        <div class="modal-content">
            <a href="javascript:void(0)" class="client-back-link" id="modal-details-close">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                </svg>
                Voltar
            </a>
            <h2 class="modal-title">Detalhes do pedido</h2>
            <p class="modal-subtitle">Carregando...</p>

            <div id="modal-client-info" style="display: none;"></div>
            <div id="modal-exchange-reason" style="display: none;"></div>

            <div class="modal-items" id="modal-items-list"></div>
            <div class="modal-footer-info" id="modal-footer-info" style="display: none;">
                <div id="modal-coupons-used" style="display: none;"></div>
                <div class="modal-footer-row">
                    <span class="modal-footer-label">Frete</span>
                    <span class="modal-footer-value" id="modal-freight"></span>
                </div>
                <div class="modal-footer-row">
                    <span class="modal-footer-label">Total</span>
                    <span class="modal-footer-value" id="modal-total"></span>
                </div>
                <div class="modal-footer-row">
                    <span class="modal-footer-label">Pagamento</span>
                    <span class="modal-footer-value">Cartão de crédito</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeDetailsModal();
    });

    document
        .getElementById("modal-details-close")
        .addEventListener("click", closeDetailsModal);

    const escHandler = (e) => {
        if (e.key === "Escape") {
            closeDetailsModal();
            document.removeEventListener("keydown", escHandler);
        }
    };
    document.addEventListener("keydown", escHandler);

    try {
        const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar detalhes");
        const order = await res.json();

        const subtitle = overlay.querySelector(".modal-subtitle");
        subtitle.textContent = `Pedido #${String(order.id).padStart(2, "0")} — ${statusLabel(order.status)}`;

        const clientInfoEl = document.getElementById("modal-client-info");
        if (clientInfoEl) {
            const phone = order.client_phone_ddd
                ? `(${order.client_phone_ddd}) ${order.client_phone_number}`
                : "";

            clientInfoEl.innerHTML = `
                <div class="modal-section">
                    <h3 class="modal-section__title">Dados do cliente</h3>
                    <div class="modal-section__grid">
                        <div class="modal-section__field">
                            <span class="modal-section__label">Nome</span>
                            <span class="modal-section__value">${order.client_name || "---"}</span>
                        </div>
                        <div class="modal-section__field">
                            <span class="modal-section__label">E-mail</span>
                            <span class="modal-section__value">${order.client_email || "---"}</span>
                        </div>
                        ${order.client_cpf ? `
                        <div class="modal-section__field">
                            <span class="modal-section__label">CPF</span>
                            <span class="modal-section__value">${order.client_cpf}</span>
                        </div>` : ""}
                        ${phone ? `
                        <div class="modal-section__field">
                            <span class="modal-section__label">Telefone</span>
                            <span class="modal-section__value">${phone}</span>
                        </div>` : ""}
                    </div>
                </div>
            `;
            clientInfoEl.style.display = "";
        }

        const exchangeReasonEl = document.getElementById("modal-exchange-reason");
        if (exchangeReasonEl && order.exchange_items && order.exchange_items.length > 0) {
            const exchangeItemsHtml = order.exchange_items.map((ei) => {
                const coverRaw = ei.cover_image || "";
                let cover = "/assets/books/upload.svg";
                if (coverRaw) {
                    cover = coverRaw.startsWith("/") ? coverRaw : `/${coverRaw}`;
                    if (!cover.startsWith("/assets")) cover = `/assets${cover}`;
                }
                return `
                    <div class="exchange-section__item">
                        <img src="${cover}" alt="${ei.title}" class="exchange-section__cover" onerror="this.src='/assets/books/upload.svg'" />
                        <div class="exchange-section__info">
                            <div class="exchange-section__book-title">${ei.title}</div>
                            <div class="exchange-section__detail">Por: ${ei.author_name || "Autor"}</div>
                            <div class="exchange-section__detail">Qtd: ${ei.quantity} — ${formatCurrency(Number(ei.price) * Number(ei.quantity))}</div>
                            <div class="exchange-section__reason">Motivo: ${ei.reason}</div>
                        </div>
                    </div>
                `;
            }).join("");

            exchangeReasonEl.innerHTML = `
                <div class="exchange-section">
                    <h3 class="exchange-section__title">Itens solicitados para troca</h3>
                    ${exchangeItemsHtml}
                </div>
            `;
            exchangeReasonEl.style.display = "";
        }

        const address = order.street_name
            ? `${order.street_type || "Rua"} ${order.street_name}, n${order.street_number} - ${order.neighborhood}`
            : "";

        const itemsHtml = (order.items || [])
            .map((item) => {
                const coverRaw = item.cover_image || "";
                let cover = "/assets/books/upload.svg";
                if (coverRaw) {
                    cover = coverRaw.startsWith("/")
                        ? coverRaw
                        : `/${coverRaw}`;
                    if (!cover.startsWith("/assets")) {
                        cover = `/assets${cover}`;
                    }
                }
                const itemTotal = Number(item.price) * Number(item.quantity);
                return `
                    <div class="modal-item">
                        <img src="${cover}" alt="${item.title}" class="modal-item__cover" onerror="this.src='/assets/books/upload.svg'" />
                        <div class="modal-item__info">
                            <div class="modal-item__title">${item.title}</div>
                            <div class="modal-item__detail">Por: ${item.author_name || "Autor"}</div>
                            <div class="modal-item__detail">Quantidade: ${item.quantity}</div>
                            ${address ? `<div class="modal-item__detail">Endereço: ${address}</div>` : ""}
                            <div class="modal-item__detail">Total: ${formatCurrency(itemTotal)}</div>
                        </div>
                    </div>
                `;
            })
            .join("");

        document.getElementById("modal-items-list").innerHTML = itemsHtml;

        const couponsEl = document.getElementById("modal-coupons-used");
        if (couponsEl && order.coupons_used && order.coupons_used.length > 0) {
            const couponsRows = order.coupons_used.map((c) => {
                const typeLabel = c.coupon_type === "promocional" ? "Promocional" : "Troca";
                return `
                    <div class="modal-footer-row">
                        <span class="modal-footer-label">${c.coupon_code} <small>(${typeLabel})</small></span>
                        <span class="modal-footer-value" style="color: var(--color-success1);">- ${formatCurrency(c.applied_value)}</span>
                    </div>
                `;
            }).join("");

            couponsEl.innerHTML = couponsRows;
            couponsEl.style.display = "";
        }

        const freight = Number(order.freight || 0);
        document.getElementById("modal-freight").textContent =
            freight > 0 ? formatCurrency(freight) : "Grátis";
        document.getElementById("modal-total").textContent = formatCurrency(
            order.total_amount,
        );
        document.getElementById("modal-footer-info").style.display = "";
    } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
        const subtitle = overlay.querySelector(".modal-subtitle");
        subtitle.textContent = "Erro ao carregar detalhes do pedido.";
        subtitle.style.color = "var(--color-error1)";
    }
}

function closeDetailsModal() {
    const modal = document.getElementById("details-order-modal");
    if (modal) modal.remove();
}

function attachTableListeners() {
    const tableBody = document.getElementById("orders-table-body");
    if (!tableBody) return;

    tableBody.addEventListener("click", (e) => {
        const editBtn = e.target.closest('[aria-label="Editar"]');
        if (editBtn) {
            const id = editBtn.dataset.id;
            const status = editBtn.dataset.status;
            openEditModal(id, status);
            return;
        }

        const viewBtn = e.target.closest('[aria-label="Visualizar"]');
        if (viewBtn) {
            const id = viewBtn.dataset.id;
            openDetailsModal(id);
        }
    });
}

export const initAdminOrderList = async () => {
    const tableBody = document.getElementById("orders-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = `<div class="orders-empty">Carregando pedidos...</div>`;

    try {
        const response = await fetch(`${API_BASE}/admin/orders`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        allOrders = Array.isArray(data) ? data : data.orders || [];
        filteredOrders = [...allOrders];

        renderTable();
        attachTableListeners();

        const statusFilter = document.getElementById("status-filter");
        if (statusFilter) {
            statusFilter.addEventListener("change", (e) =>
                applyFilter(e.target.value),
            );
        }
    } catch (error) {
        console.error("Erro ao buscar pedidos (admin):", error);
        tableBody.innerHTML = `
            <div class="orders-empty" style="color: var(--color-error1);">
              Erro ao carregar pedidos. Verifique a conexão com o servidor.
            </div>`;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("orders-table-body")) {
        initAdminOrderList();
    }
});
