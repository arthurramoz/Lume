import { localStorageKeys } from "../hooks/useAuth.js";

const API_BASE = "http://localhost:3333/api";
const ITEMS_PER_PAGE = 10;

let currentPage = 1;
let allCoupons = [];
let filteredCoupons = [];
let currentType = "";
let currentStatus = "";

function getToken() {
    return (
        localStorage.getItem(localStorageKeys.accessToken) ||
        sessionStorage.getItem(localStorageKeys.accessToken)
    );
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const day   = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year  = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatCurrency(value) {
    if (value === undefined || value === null) return "---";
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getStatus(coupon) {
    if (coupon.is_used) return { label: "Inativo", class: "status-badge--used" };
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { label: "Expirado", class: "status-badge--expired" };
    }
    return { label: "Ativo", class: "status-badge--active" };
}

function createCouponRow(coupon) {
    const status = getStatus(coupon);
    const isActive = !coupon.is_used;
    const isPromo = (coupon.type || "").toLowerCase() === "promocional";
    const typeLabel = isPromo ? "Promocional" : "Troca";

    const userInfo = coupon.user_name
        ? `<span title="${coupon.user_email || ""}"><strong>${coupon.user_name}</strong></span>`
        : `<span style="color:var(--color-neutro60);">—</span>`;

    const toggleBtn = isPromo
        ? `<button class="toggle-btn ${isActive ? "active" : ""}" data-id="${coupon.id}" title="${isActive ? "Desativar cupom" : "Ativar cupom"}">
             <span class="toggle-circle"></span>
           </button>`
        : `<span style="color:var(--color-neutro60);font-size:13px;">—</span>`;

    return `
    <div class="table-row admin-coupons-table" data-id="${coupon.id}">
      <span class="col-code">#${String(coupon.id).padStart(2, "0")}</span>
      <span><strong>${coupon.code}</strong></span>
      <span>${typeLabel}</span>
      <span>${formatCurrency(coupon.value)}</span>
      <span class="status-badge ${status.class}">${status.label}</span>
      <span>${formatDate(coupon.expires_at)}</span>
      <span>${userInfo}</span>
      <div class="col-actions">${toggleBtn}</div>
    </div>`;
}

function renderTable() {
    const tableBody = document.getElementById("coupons-table-body");
    if (!tableBody) return;

    if (filteredCoupons.length === 0) {
        tableBody.innerHTML = `<div class="orders-empty">Nenhum cupom encontrado.</div>`;
        updatePagination(0);
        return;
    }

    const totalPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start     = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageSlice = filteredCoupons.slice(start, start + ITEMS_PER_PAGE);

    tableBody.innerHTML = pageSlice.map(createCouponRow).join("");
    updatePagination(totalPages);
    attachToggleListeners();
}

function updatePagination(totalPages) {
    const info     = document.getElementById("pagination-info");
    const numbers  = document.getElementById("page-numbers");
    const prevBtn  = document.getElementById("prev-page");
    const nextBtn  = document.getElementById("next-page");

    const safeTotalPages = Math.max(totalPages, 1);

    if (info) info.textContent = `Mostrando ${currentPage} de ${safeTotalPages}`;

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
        prevBtn.disabled      = currentPage <= 1;
        prevBtn.style.opacity = currentPage <= 1 ? "0.4" : "1";
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled      = currentPage >= safeTotalPages;
        nextBtn.style.opacity = currentPage >= safeTotalPages ? "0.4" : "1";
        nextBtn.onclick = () => {
            if (currentPage < safeTotalPages) {
                currentPage++;
                renderTable();
            }
        };
    }
}

function attachToggleListeners() {
    const tableBody = document.getElementById("coupons-table-body");
    if (!tableBody) return;

    tableBody.querySelectorAll(".toggle-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const couponId = btn.dataset.id;
            btn.disabled = true;

            try {
                const res = await fetch(`${API_BASE}/admin/coupons/${couponId}/toggle`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Erro ao alternar cupom");
                }

                const data = await res.json();
                const updatedCoupon = data.coupon;

                allCoupons = allCoupons.map((c) =>
                    c.id == couponId ? { ...c, is_used: updatedCoupon.is_used } : c
                );
                filteredCoupons = filteredCoupons.map((c) =>
                    c.id == couponId ? { ...c, is_used: updatedCoupon.is_used } : c
                );

                renderTable();
            } catch (error) {
                console.error("Erro ao alternar cupom:", error);
                alert(error.message);
            } finally {
                btn.disabled = false;
            }
        });
    });
}

function applyFilter() {
    filteredCoupons = allCoupons.filter((c) => {
        if (currentType && (c.type || "").toLowerCase() !== currentType.toLowerCase()) return false;
        if (currentStatus === "ativo") {
            return !c.is_used && (!c.expires_at || new Date(c.expires_at) > new Date());
        } else if (currentStatus === "inativo") {
            return c.is_used || (c.expires_at && new Date(c.expires_at) <= new Date());
        }
        return true;
    });
    currentPage = 1;
    renderTable();
}

export const initAdminCouponList = async () => {
    const tableBody = document.getElementById("coupons-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = `<div class="orders-empty">Carregando cupons...</div>`;

    try {
        const response = await fetch(`${API_BASE}/admin/coupons`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        allCoupons      = Array.isArray(data) ? data : [];
        filteredCoupons  = [...allCoupons];

        renderTable();

        const statusFilter = document.getElementById("status-filter");
        if (statusFilter) {
            statusFilter.addEventListener("change", (e) => {
                currentStatus = e.target.value;
                applyFilter();
            });
        }

        const typeFilter = document.getElementById("type-filter");
        if (typeFilter) {
            typeFilter.addEventListener("change", (e) => {
                currentType = e.target.value;
                applyFilter();
            });
        }
    } catch (error) {
        console.error("Erro ao buscar cupons (admin):", error);
        tableBody.innerHTML = `
            <div class="orders-empty" style="color: var(--color-error1);">
              Erro ao carregar cupons. Verifique a conexão com o servidor.
            </div>`;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("coupons-table-body")) {
        initAdminCouponList();
    }
});
