const API_URL = window.API_URL;

// Paleta de cores vibrantes para os gêneros
const GENRE_COLORS = [
  "#6165dc", "#119da4", "#e8553d", "#f2a541", "#3bb273",
  "#8338ec", "#ff6b6b", "#48bfe3", "#f77f00", "#06d6a0",
  "#e63946", "#457b9d", "#2a9d8f", "#e9c46a", "#264653",
];

export const initDashboard = () => {
  const btnGenerate = document.getElementById("btn-generate");
  const emptyState = document.getElementById("dashboard-empty");
  const loadingState = document.getElementById("dashboard-loading");
  const chartContainer = document.getElementById("dashboard-data");
  const ctx = document.getElementById("salesChart");
  const startDateInput = document.getElementById("filter-start-date");
  const endDateInput = document.getElementById("filter-end-date");

  if (!btnGenerate || !ctx) return;

  // Definir período padrão: últimos 12 meses
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const toMonthValue = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  startDateInput.value = toMonthValue(oneYearAgo);
  endDateInput.value = toMonthValue(today);

  let salesChart = null;

  const renderChart = (data) => {
    emptyState.style.display = "none";
    loadingState.style.display = "none";
    chartContainer.style.display = "block";

    if (salesChart) {
      salesChart.destroy();
    }

    const datasets = data.genres.map((genre, index) => ({
      label: genre.name,
      data: genre.data,
      borderColor: GENRE_COLORS[index % GENRE_COLORS.length],
      backgroundColor: GENRE_COLORS[index % GENRE_COLORS.length],
      borderWidth: 2,
      pointBackgroundColor: GENRE_COLORS[index % GENRE_COLORS.length],
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
      tension: 0.3,
    }));

    // Calcular max do eixo Y com margem
    const allValues = datasets.flatMap((d) => d.data);
    const maxValue = Math.max(...allValues, 1);
    const yMax = Math.ceil(maxValue * 1.2 / 5) * 5;

    salesChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              usePointStyle: true,
              boxWidth: 6,
              boxHeight: 6,
              padding: 12,
              font: {
                family: "'Nunito', sans-serif",
                size: 14,
              },
              color: "#7d7d7d",
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: { family: "'Nunito', sans-serif", size: 13 },
            bodyFont: { family: "'Nunito', sans-serif", size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) =>
                ` ${context.dataset.label}: ${context.parsed.y} unid.`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: yMax,
            ticks: {
              stepSize: Math.max(1, Math.ceil(yMax / 5)),
              font: {
                family: "'Nunito', sans-serif",
                size: 12,
              },
              color: "#7d7d7d",
            },
            grid: {
              color: "#e5e5e5",
              borderDash: [5, 5],
              drawBorder: false,
            },
          },
          x: {
            ticks: {
              font: {
                family: "'Nunito', sans-serif",
                size: 12,
              },
              color: "#7d7d7d",
            },
            grid: {
              display: true,
              color: "#e5e5e5",
              borderDash: [5, 5],
              drawBorder: true,
            },
          },
        },
      },
    });
  };

  const showEmpty = (message) => {
    chartContainer.style.display = "none";
    loadingState.style.display = "none";
    emptyState.style.display = "flex";
    const textEl = emptyState.querySelector(".empty-state__text");
    if (textEl && message) {
      textEl.textContent = message;
    }
  };

  const fetchData = async () => {
    const startMonth = startDateInput.value; // YYYY-MM
    const endMonth = endDateInput.value;     // YYYY-MM

    if (!startMonth || !endMonth) {
      showEmpty("Preencha o mês/ano de início e fim para gerar a análise.");
      return;
    }

    if (startMonth > endMonth) {
      showEmpty("O mês inicial deve ser anterior ao mês final.");
      return;
    }

    // Converter YYYY-MM para primeiro e último dia
    const startDate = `${startMonth}-01`;
    const [endYear, endMon] = endMonth.split("-").map(Number);
    const lastDay = new Date(endYear, endMon, 0).getDate();
    const endDate = `${endMonth}-${String(lastDay).padStart(2, "0")}`;

    // Mostrar loading
    emptyState.style.display = "none";
    chartContainer.style.display = "none";
    loadingState.style.display = "flex";

    try {
      const response = await fetch(
        `${API_URL}/api/dashboard/sales-by-genre?start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar dados");
      }

      const data = await response.json();

      if (!data.genres || data.genres.length === 0 || data.labels.length === 0) {
        showEmpty("Nenhuma venda encontrada no período selecionado.");
        return;
      }

      renderChart(data);
    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
      showEmpty("Erro ao carregar dados. Verifique a conexão com o servidor.");
    }
  };

  btnGenerate.addEventListener("click", fetchData);

  // Carregar dados automaticamente ao abrir a página
  fetchData();
};
