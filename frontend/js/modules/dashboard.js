export const initDashboard = () => {
  const btnGenerate = document.getElementById("btn-generate");
  const emptyState = document.getElementById("dashboard-empty");
  const chartContainer = document.getElementById("dashboard-data");
  const ctx = document.getElementById("salesChart");

  if (!btnGenerate || !ctx) return;

  const mockChartData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        label: "O corajoso Pinguim",
        data: [12, 19, 15, 25, 22, 30],
        borderColor: "#6165dc",
        backgroundColor: "#6165dc",
        borderWidth: 2,
        pointBackgroundColor: "#6165dc",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.1,
      },
      {
        label: "Um Dia Muito Mal Humorada",
        data: [5, 10, 8, 15, 12, 20],
        borderColor: "#119da4",
        backgroundColor: "#119da4",
        borderWidth: 2,
        pointBackgroundColor: "#119da4",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.1,
      },
    ],
  };

  let salesChart = null;

  const renderChart = () => {
    emptyState.style.display = "none";
    chartContainer.style.display = "block";

    if (salesChart) {
      salesChart.destroy();
    }

    salesChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: mockChartData.labels,
        datasets: mockChartData.datasets,
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
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
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

  btnGenerate.addEventListener("click", () => {
    renderChart();
  });

  renderChart();
};
