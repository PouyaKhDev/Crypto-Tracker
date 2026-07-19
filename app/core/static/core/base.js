//-----------------------------------------
//  API Configuration
//-----------------------------------------

// CoinGecko API Key
// const API_KEY = "";
const API_KEY = "CG-FiFwM78rDbqWSGhHo5xobDjw";

// API Base URL
const API_BASE_URL = "https://api.coingecko.com/api/v3";

// Rate limiting configuration
const RATE_LIMIT = {
  callsPerMinute: 100,
  callsPerSecond: 10,
};

//-----------------------------------------
//  Global Utility Functions
//-----------------------------------------

/**
 * Format currency values
 * @param {number} value - The value to format
 * @param {string} currency - Currency code (default: USD)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, currency = "USD", decimals = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format large numbers with K, M, B, T suffixes
 * @param {number} value - The value to format
 * @returns {string} Formatted number string
 */
function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage values
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 2) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format date/time
 * @param {string|Date} date - The date to format
 * @param {string} locale - Locale string
 * @returns {string} Formatted date string
 */
function formatDateTime(date, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Format date/time
 * @param {string|Date} date - The date to format
 * @param {string} locale - Locale string
 * @returns {string} Formatted date string containing only day
 */
function formatDateOnlyDay(date, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Debounce function
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - The function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 1000) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

//-----------------------------------------
//  API Helper Functions
//-----------------------------------------

/**
 * Fetch data from CoinGecko API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response data
 */
async function fetchFromCoinGecko(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (API_KEY) {
    params.x_cg_demo_api_key = API_KEY;
  }

  // Add parameters to URL
  Object.keys(params).forEach((key) => {
    url.searchParams.append(key, params[key]);
  });

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching from CoinGecko:", error);
    throw error;
  }
}

/**
 * Get cryptocurrency market data
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Cryptocurrency data
 */
async function getCryptoMarketData(options = {}) {
  const defaultOptions = {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: 100,
    page: 1,
    sparkline: true,
  };

  const params = { ...defaultOptions, ...options };
  return await fetchFromCoinGecko("/coins/markets", params);
}

/**
 * Get global cryptocurrency data
 * @returns {Promise<Object>} Global market data
 */
async function getGlobalCryptoData() {
  return await fetchFromCoinGecko("/global");
}

/**
 * Get global defi data
 * @returns {Promise<Object>} Global defi data
 */
async function getGlobalDefiData() {
  const defiData = await fetchFromCoinGecko("/global/decentralized_finance_defi");
  return defiData.data;
}

/**
 * Get chart data for a coin
 * @param {String} coinId - Cryptocurrency ID
 * @returns {Promise<Object>} Global market data
 */
async function getCoinChart(coinId) {
  const coinChartData = await fetchFromCoinGecko(`/coins/${coinId}/market_chart`, {
    vs_currency: "usd",
    days: "7",
    interval: "daily",
  });
  return coinChartData.prices;
}

/**
 * Get cryptocurrency by ID
 * @param {string} id - Coin ID (e.g., 'bitcoin')
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Coin data
 */
async function getCoinById(id, options = {}) {
  const defaultOptions = {
    localization: false,
    tickers: false,
    market_data: true,
    community_data: false,
    developer_data: false,
  };

  const params = { ...defaultOptions, ...options };
  return await fetchFromCoinGecko(`/coins/${id}`, params);
}

//-----------------------------------------
//  UI Helper Functions
//-----------------------------------------

/**
 * Toggle dropdown menu
 * @param {HTMLElement} dropdown - The dropdown element
 */
function toggleDropdown(dropdown) {
  const menu = dropdown.querySelector(".dropdown-menu");
  const toggle = dropdown.querySelector(".dropdown-toggle");
  const isOpen = menu.classList.contains("show");

  // Close all other dropdowns
  document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
    menu.classList.remove("show");
    menu.setAttribute("aria-hidden", "true");
  });

  document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "false");
  });

  // Toggle current dropdown
  if (!isOpen) {
    menu.classList.add("show");
    menu.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
  }
}

/**
 * Create the spinner element
 */
function createSpinner() {
  // The resulting spinner element:
  // <div class="spinner-container">
  //   <div class="spinner"></div>
  // </div>
  const spinnerContainerEl = document.createElement("div");
  spinnerContainerEl.classList.add("spinner-container");
  spinnerContainerEl.insertAdjacentHTML("afterbegin", '<div class="spinner"></div>');
  return spinnerContainerEl;
}

/**
 * Show loading state
 * @param {HTMLElement} element - The element to show loading state
 * @param {boolean} show - Whether to show or hide loading state
 */
function showLoading(element, show = true) {
  // Detect if there are any table-related element
  const isTableContext = ["TABLE", "TBODY", "THEAD", "TFOOT"].includes(element.tagName);
  const spinnerSelector = isTableContext ? ".spinner-row" : ".spinner-container";

  let spinnerWrapper = element.querySelector(spinnerSelector);

  if (show && !spinnerWrapper) {
    if (isTableContext) {
      const tr = document.createElement("tr");
      tr.classList.add("spinner-row");

      const td = document.createElement("td");
      td.classList.add("spinner-cell");

      // Dynamically calculate colspan based on the table's header or first row
      let colSpan = 1;
      const table = element.tagName === "TABLE" ? element : element.closest("table");

      if (table) {
        // Check thead first
        if (table.tHead && table.tHead.rows.length > 0) {
          colSpan = table.tHead.rows[0].cells.length;
        } else if (table.rows.length > 0) {
          colSpan = table.rows[0].cells.length;
        }
      }
      td.colSpan = colSpan;

      // Create the spinner and add it to the table cell
      const spinnerContainer = createSpinner();
      td.appendChild(spinnerContainer);
      tr.appendChild(td);

      // Determine where to append the row.
      // If the element is a <table>, we must append to its <tbody>.
      let targetParent = element;
      if (element.tagName === "TABLE") {
        targetParent = element.tBodies[0] || element.createTBody();
      }

      targetParent.appendChild(tr);
    } else {
      const spinnerContainer = createSpinner();
      element.insertAdjacentElement("afterbegin", spinnerContainer);
    }

    element.setAttribute("aria-busy", "true");
  } else if (!show && spinnerWrapper) {
    spinnerWrapper.remove();
    element.setAttribute("aria-busy", "false");
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 * @param {HTMLElement} container - Container to show error in
 */
function showError(message, container) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.setAttribute("role", "alert");
  errorDiv.textContent = message;

  container.innerHTML = "";
  container.appendChild(errorDiv);
}

//-----------------------------------------
//  Event Listeners & Initialization
//-----------------------------------------

/**
 * Initialize dropdown functionality
 */
function initDropdowns() {
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    const toggle = dropdown.querySelector(".dropdown-toggle");

    if (toggle) {
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown(dropdown);
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
        menu.classList.remove("show");
        menu.setAttribute("aria-hidden", "true");
      });
      document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach((toggle) => {
        toggle.setAttribute("aria-expanded", "false");
      });
    }
  });
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const menu = document.querySelector(".navbar-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !isExpanded);
      menu.classList.toggle("mobile-open");
    });
  }
}

/**
 * Initialize search functionality
 */
function initSearch() {
  const searchInput = document.querySelector(".search-input");

  if (searchInput) {
    const handleSearch = debounce((value) => {
      if (value.length > 2) {
        // search logic
        console.log("Searching for:", value);
      }
    }, 300);

    searchInput.addEventListener("input", (e) => {
      handleSearch(e.target.value);
    });
  }
}

/**
 * Initialize all components
 */
function init() {
  initDropdowns();
  initMobileMenu();
  initSearch();
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
