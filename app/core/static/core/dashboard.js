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

  // Table
  tableBody: document.getElementById("crypto-table-body"),
};

//-----------------------------------------
//  Utilities
//-----------------------------------------

/**
 * Get watchlist from localStorage
 * @returns {Array} Array of coin IDs
 */
function getWatchlist() {
  const saved = localStorage.getItem("cryptomarket_watchlist");
  return saved ? JSON.parse(saved) : [];
}

/**
 * Save watchlist to localStorage
 * @param {Array} watchlist - Array of coin IDs
 */
function saveWatchlist(watchlist) {
  localStorage.setItem("cryptomarket_watchlist", JSON.stringify(watchlist));
}

/**
 * Toggle coin in watchlist
 * @param {string} coinId - Coin ID to toggle
 */
function toggleCoinInWatchlist(coinId) {
  const watchlist = getWatchlist();
  const index = watchlist.indexOf(coinId);

  if (index > -1) {
    // Remove from watchlist
    watchlist.splice(index, 1);
    saveWatchlist(watchlist);
    return false;
  } else {
    // Add to watchlist
    watchlist.push(coinId);
    saveWatchlist(watchlist);
    return true;
  }
}

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
  } catch (error) {
    showToast("Failed to load dashboard data. Please try again later.", "error");
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
    showToast("Failed to load cryptocurrency data. Please try again later.", "error");
    console.error("Error fetching crypto data:", error);
    showLoading(elements.tableBody, false);
  }
}

/**
 * Fetch chart data for a coin
 * @param {String} coinId - Cryptocurrency ID
 */

async function fetchChartData(coinId) {
  try {
    renderChartOverlay();
    const overlayContainer = document.querySelector(".canvas-container");
    showLoading(overlayContainer, true, false);

    const data = await getCoinChart(coinId);

    showLoading(overlayContainer, false);

    renderSparkline(coinId, data);
  } catch (error) {
    showToast(`Failed to load chart data for ${coinId}. Please try again later.`, "error");
    console.error("Error fetching chart data:", error);
    showLoading(overlayContainer, false);
  }
}

//-----------------------------------------
//  Rendering
//-----------------------------------------

/**
 * Update favorite button UI
 * @param {HTMLElement} btn - Favorite button element
 * @param {boolean} isFavorite - Whether the coin is favorited
 */
function updateFavoriteButtonUI(btn, isFavorite) {
  const svg = btn.querySelector("svg");
  if (svg) {
    svg.setAttribute("fill", isFavorite ? "currentColor" : "none");
  }
  btn.classList.toggle("active", isFavorite);
}

/**
 * Update all favorite buttons based on watchlist
 */
function updateAllFavoriteButtons() {
  const watchlist = getWatchlist();
  const favoriteButtons = document.querySelectorAll(".favorite-btn");

  favoriteButtons.forEach((btn) => {
    const coinId = btn.getAttribute("data-coin-id");
    const isFavorite = watchlist.includes(coinId);
    updateFavoriteButtonUI(btn, isFavorite);
  });
}

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
      <button class="btn btn-ghost chartBtn" data-coin-id="${crypto.id}">Chart</button>
    </td>
  `;

  return row;
}

/**
 * Render sparkline chart using Chart.js
 * @param {string} coinId - Cryptocurrency ID
 * @param {Array<number>} data - Price data, an array of arrays with this
 * format: [[timestamp, price], [timestamp2, price2], ...]
 */
function renderSparkline(coinId, data) {
  // Validate inputs
  if (!data || data.length === 0) return;

  const canvasContainer = document.querySelector(".canvas-container");
  if (!canvasContainer) return;
  const canvas = document.createElement("canvas");
  canvas.id = `chart-${coinId}`;
  canvasContainer.insertAdjacentElement("afterbegin", canvas);

  // Destroy existing chart if any
  if (chartInstances[coinId]) {
    chartInstances[coinId].destroy();
  }

  // Determine trend and colors
  const firstPrice = data[0][1];
  const lastPrice = data[data.length - 1][1];
  const isPositive = lastPrice >= firstPrice;
  const color = isPositive ? "#10B981" : "#EF4444";
  const gradientColor = isPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";

  // Calculate min and max safely (O(n) complexity, avoids stack overflow on large arrays)
  let min = data[0][1];
  let max = data[0][1];
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] < min) min = data[i][1];
    if (data[i][1] > max) max = data[i][1];
  }

  const chart = new window.Chart(canvas, {
    type: "line",
    data: {
      labels: [...data.map((el) => formatDateOnlyDay(el[0]))],
      datasets: [
        {
          label: `${coinId[0].toUpperCase()}${coinId.slice(1)} Price Changes In Last 7 Days`,
          data: [...data.map((el) => el[1])],
          backgroundColor: gradientColor,
          borderColor: color,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    },
    options: {
      ...sparklineBaseOptions,
      scales: {
        y: {
          min: min * 0.95,
          max: max * 1.05,
        },
      },
    },
  });

  chartInstances[coinId] = chart;
}

function renderChartOverlay() {
  // <div class="canvas-overlay">
  //   <div class="canvas-container">
  //     <div class="close-overlay">&times;</div>
  //     <canvas id="chart-${coinId}"></canvas> // this will be added later
  //   </div>
  // </div>

  const canvasOverlay = document.createElement("div");
  canvasOverlay.className = "canvas-overlay";
  document.body.insertAdjacentElement("afterbegin", canvasOverlay);

  const canvasContainer = document.createElement("div");
  canvasContainer.className = "canvas-container";
  canvasOverlay.insertAdjacentElement("afterbegin", canvasContainer);

  const closeOverlay = document.createElement("button");
  closeOverlay.classList.add("btn", "btn-ghost", "close-btn");
  closeOverlay.textContent = "×";
  canvasContainer.insertAdjacentElement("afterbegin", closeOverlay);

  // Close the chart overlay if close button or overlay is clicked (using event delegation)
  canvasOverlay.addEventListener("click", handleRemoveChartOverlay);
}

//-----------------------------------------
//  Event Handlers
//-----------------------------------------

/**
 * Handles removing chart overlay
 * @param {Event} e - Specific event listener object
 */
function handleRemoveChartOverlay(e) {
  // Check if the overlay itself is clicked
  const isOverlay = e.target.classList.contains("canvas-overlay");
  if (isOverlay) {
    this.remove();
    return;
  }

  // Check if the close button is clicked
  const closeBtn = e.target.closest(".close-btn");
  if (closeBtn) this.remove();
}

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
 * Handle favorite button click
 * @param {Event} e - Click event
 */
function handleFavoriteClick(e) {
  const btn = e.target.closest(".favorite-btn");
  if (!btn) return;

  const coinId = btn.getAttribute("data-coin-id");
  const isFavorite = toggleCoinInWatchlist(coinId);
  updateFavoriteButtonUI(btn, isFavorite);

  showToast(
    isFavorite ? "Added to watchlist!" : "Removed from watchlist",
    isFavorite ? "success" : "info",
    2000,
  );
}

/**
 * Handle chart toggle
 * @param {string} coinId - Cryptocurrency ID
 */
function handleChartToggle(coinId) {
  fetchChartData(coinId);
}

/**
 * Handle search functionality for filtering coins inside the table
 * @param {string} query - Search query
 */
function handleTableSearch(query) {
  if (query.length < 1) {
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
 * Initialize favorite functionality
 */
function initFavorite() {
  updateAllFavoriteButtons();

  document.addEventListener("click", handleFavoriteClick);

  window.addEventListener("storage", (e) => {
    if (e.key === "cryptomarket_watchlist") {
      updateAllFavoriteButtons();
    }
  });
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
  // Search
  const searchInput = document.querySelector(".table__search-input");
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        handleTableSearch(e.target.value);
      }, 1000),
    );
  }

  // Events on table body (event delegation)
  if (!elements.tableBody) return;
  elements.tableBody.addEventListener("click", (e) => {
    // Favorite buttons
    const favoriteBtn = e.target.closest(".favorite-btn");
    if (favoriteBtn) {
      const coinId = favoriteBtn.getAttribute("data-coin-id");
      handleFavoriteToggle(coinId);
    }

    // Chart buttons
    const chartBtn = e.target.closest(".chartBtn");
    if (chartBtn) {
      const coinId = chartBtn.getAttribute("data-coin-id");
      handleChartToggle(coinId);
    }
  });
}

/**
 * Initialize home page
 */
async function init() {
  // Fetch data
  await Promise.all([fetchGlobalData(), fetchCryptoData(currentPage)]);

  initEventListeners();
  initFavorite();
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
