import { Chart, registerables } from "chart.js";

// Register all Chart.js components
Chart.register(...registerables);

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("cryptoChart");

  if (ctx) {
    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
          {
            label: "Bitcoin Price (USD)",
            data: [40000, 42000, 38000, 45000, 48000],
            borderColor: "rgb(255, 165, 0)",
            backgroundColor: "rgba(255, 165, 0, 0.1)",
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
        },
      },
    });
  }
});
