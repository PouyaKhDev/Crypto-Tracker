//-----------------------------------------
//  Global State
//-----------------------------------------

let currentPage = 1;
let allCryptoData = [];
let chartInstances = {};
const itemsPerPage = 20;
const sparklineBaseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
};

//-----------------------------------------
//  DOM Elements
//-----------------------------------------

const elements = {
  // Stats
  totalMarketCap: document.getElementById("total-market-cap"),
  totalVolume: document.getElementById("total-volume"),
  btcDominance: document.getElementById("btc-dominance"),
  totalCryptos: document.getElementById("total-cryptos"),
  totalMarkets: document.getElementById("total-markets"),
  ethDominance: document.getElementById("eth-dominance"),
  usdtDominance: document.getElementById("usdt-dominance"),
  defiMarketCap: document.getElementById("defi-market-cap"),
  marketCapText: document.getElementById("market-cap-text"),
  volumeText: document.getElementById("volume-text"),

  // Table
  tableBody: document.getElementById("crypto-table-body"),
};

//-----------------------------------------
//  Data Fetching
//-----------------------------------------

/**
 * Fetch global market data
 */
async function fetchGlobalData() {
  try {
    const data = await getGlobalCryptoData();
    const global = data.data;

    // Update hero stats
    if (elements.totalMarketCap) {
      elements.totalMarketCap.textContent = formatCurrency(global.total_market_cap.usd);
    }
    if (elements.totalVolume) {
      elements.totalVolume.textContent = formatCurrency(global.total_volume.usd);
    }
    if (elements.btcDominance) {
      elements.btcDominance.textContent = `${global.market_cap_percentage.btc.toFixed(1)}%`;
    }
    if (elements.totalCryptos) {
      elements.totalCryptos.textContent = formatCompactNumber(global.active_cryptocurrencies);
    }
    if (elements.totalMarkets) {
      elements.totalMarkets.textContent = formatCompactNumber(global.markets);
    }
    if (elements.ethDominance) {
      elements.ethDominance.textContent = `${global.market_cap_percentage.eth.toFixed(1)}%`;
    }
    if (elements.usdtDominance) {
      elements.usdtDominance.textContent = `${global.market_cap_percentage.usdt.toFixed(1)}%`;
    }
    if (elements.defiMarketCap) {
      const defiData = await getGlobalDefiData();
      elements.defiMarketCap.textContent = formatCurrency(defiData.defi_market_cap);
    }
    if (elements.marketCapText) {
      elements.marketCapText.textContent = formatCurrency(global.total_market_cap.usd);
    }
    if (elements.volumeText) {
      elements.volumeText.textContent = formatCurrency(global.total_volume.usd);
    }
  } catch (error) {
    console.error("Error fetching global data:", error);
  }
}

/**
 * Fetch cryptocurrency market data
 */
async function fetchCryptoData(page = 1) {
  try {
    showLoading(elements.tableBody, true);

    const data = await getCryptoMarketData({
      page: page,
      per_page: itemsPerPage,
    });

    showLoading(elements.tableBody, false);

    allCryptoData = data;
    renderTable(data);
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    showError("Failed to load cryptocurrency data. Please try again later.", elements.tableBody);
    showLoading(elements.tableBody, false);
  }
}

//-----------------------------------------
//  Rendering
//-----------------------------------------

/**
 * Render cryptocurrency table
 * @param {Array} data - Cryptocurrency data array
 */
function renderTable(data) {
  if (!elements.tableBody) return;

  elements.tableBody.innerHTML = "";

  data.forEach((crypto, index) => {
    const row = createCryptoRow(crypto, index);
    elements.tableBody.appendChild(row);

    // Render sparkline chart after row is added to DOM
    if (crypto.sparkline_in_7d?.price) {
      setTimeout(() => {
        renderSparkline(crypto.id, crypto.sparkline_in_7d.price);
      }, 0);
    }
  });
}

/**
 * Create table row element
 * @param {Object} crypto - Cryptocurrency data
 * @param {number} index - Row index
 * @returns {HTMLElement} Table row element
 */
function createCryptoRow(crypto, index) {
  const row = document.createElement("tr");
  row.setAttribute("role", "row");

  console.log(crypto);

  // Calculate price changes
  const change24h = crypto.price_change_percentage_24h || 0;

  // Format values
  const price = formatCurrency(crypto.current_price);
  const marketCap = formatCurrency(crypto.market_cap);
  const volume = formatCurrency(crypto.total_volume);
  const supply = formatCompactNumber(crypto.circulating_supply) + " " + crypto.symbol.toUpperCase();

  // Get first letter of name for icon
  const firstLetter = crypto.name.charAt(0).toUpperCase();

  row.innerHTML = `
    <td class="col-fav">
      <button class="favorite-btn" aria-label="Add to watchlist" data-coin-id="${crypto.id}">
        <svg class="icon icon-star" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </button>
    </td>
    <td class="col-name">
      <div class="coin-info">
        <div class="coin-icon">${firstLetter}</div>
        <div class="coin-details">
          <div class="coin-symbol">${crypto.name}</div>
          <div class="coin-name">${crypto.symbol.toUpperCase()}</div>
        </div>
      </div>
    </td>
    <td class="col-price">${price}</td>
    <td class="col-change ${change24h >= 0 ? "text-positive" : "text-negative"}">
      ${formatPercentage(change24h)}
    </td>
    <td class="col-market-cap">${marketCap}</td>
    <td class="col-volume">${volume}</td>
    <td class="col-supply">${supply}</td>
    <td class="col-chart">
      <canvas class="sparkline-container" id="chart-${crypto.id}"></canvas>
    </td>
  `;

  return row;
}

/**
 * Render sparkline chart using Chart.js
 * @param {string} coinId - Cryptocurrency ID
 * @param {Array<number>} data - Price data array
 */
function renderSparkline(coinId, data) {
  // Validate inputs
  if (!data || data.length === 0) return;

  const canvas = document.getElementById(`chart-${coinId}`);
  if (!canvas) return;

  // Destroy existing chart if any
  if (chartInstances[coinId]) {
    chartInstances[coinId].destroy();
  }

  // Determine trend and colors
  const firstPrice = data[0];
  const lastPrice = data[data.length - 1];
  const isPositive = lastPrice >= firstPrice;
  const color = isPositive ? "#10B981" : "#EF4444";
  const gradientColor = isPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";

  // 5. Calculate min and max safely (O(n) complexity, avoids stack overflow on large arrays)
  let min = data[0];
  let max = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }

  // Create chart
  const chart = new Chart(canvas, {
    type: "line",
    data: {
      datasets: [
        {
          data: data,
          borderColor: color,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null; // Fallback for initial render

            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, gradientColor);
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            return gradient;
          },
        },
      ],
    },
    options: {
      ...sparklineBaseOptions,
      scales: {
        ...sparklineBaseOptions.scales,
        y: {
          ...sparklineBaseOptions.scales.y,
          min: min * 0.95,
          max: max * 1.05,
        },
      },
    },
  });

  chartInstances[coinId] = chart;
}

//-----------------------------------------
//  Event Handlers
//-----------------------------------------

/**
 * Handle page change
 * @param {number} page - New page number
 */
function handlePageChange(page) {
  currentPage = page;
  fetchCryptoData(page);

  // Scroll to top of table
  elements.tableBody?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Handle favorite toggle
 * @param {string} coinId - Cryptocurrency ID
 */
function handleFavoriteToggle(coinId) {
  const btn = document.querySelector(`[data-coin-id="${coinId}"]`);
  if (btn) {
    btn.classList.toggle("active");

    // This will be saved in backend
    console.log(`Toggled favorite for ${coinId}`);
  }
}

/**
 * Handle search
 * @param {string} query - Search query
 */
function handleSearch(query) {
  if (query.length < 2) {
    fetchCryptoData(currentPage);
    return;
  }

  const filtered = allCryptoData.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(query.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(query.toLowerCase()),
  );

  renderTable(filtered);
}

//-----------------------------------------
//  Initialization
//-----------------------------------------

/**
 * Initialize event listeners
 */
function initEventListeners() {
  // Search
  const searchInput = document.querySelector(".search-input");
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        handleSearch(e.target.value);
      }, 300),
    );
  }

  // Favorite buttons (event delegation)
  if (elements.tableBody) {
    elements.tableBody.addEventListener("click", (e) => {
      const favoriteBtn = e.target.closest(".favorite-btn");
      if (favoriteBtn) {
        const coinId = favoriteBtn.getAttribute("data-coin-id");
        handleFavoriteToggle(coinId);
      }
    });
  }
}

/**
 * Initialize home page
 */
async function init() {
  // Fetch data
  await Promise.all([fetchGlobalData(), fetchCryptoData(currentPage)]);

  // Initialize event listeners
  initEventListeners();
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Auto-refresh every 60 seconds
// setInterval(() => {
//   console.log("Auto-refreshing data...");
//   fetchGlobalData();
//   fetchCryptoData(currentPage);
// }, 60000);
