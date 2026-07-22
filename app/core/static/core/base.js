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
 * Get the value of a cookie
 * @param {String} name - Cookie name
 * @returns Value of the requested cookie
 */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

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
    notation: "compact",
    compactDisplay: "short",
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
    sparkline: false,
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
 * @param {boolean} removeChildren - Whether remove the elements' children or not
 *    (only when show is true)
 */
function showLoading(element, show = true, removeChildren = true) {
  // Detect if there are any table-related element
  const isTableContext = ["TABLE", "TBODY", "THEAD", "TFOOT"].includes(element.tagName);
  const spinnerSelector = isTableContext ? ".spinner-row" : ".spinner-container";

  let spinnerWrapper = element.querySelector(spinnerSelector);

  if (show && !spinnerWrapper) {
    if (removeChildren) element.innerHTML = "";

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
 * Show a Toast Notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'warning', or 'info'
 * @param {number} duration - Time in ms before auto-dismiss (0 = no auto-dismiss)
 */
function showToast(message, type = "info", duration = 5000) {
  // Ensure container exists
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  // Icons for different types
  const icons = {
    success:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    error:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    warning:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
  };

  const titles = {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Information",
  };

  // Creating toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${titles[type] || "Notification"}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close notification">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;

  container.appendChild(toast);

  // Close button event
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => closeToast(toast));

  // Auto dismiss
  if (duration > 0) {
    setTimeout(() => closeToast(toast), duration);
  }
}

/**
 * Close a Toast Notification with animation
 */
function closeToast(toast) {
  if (toast.classList.contains("hiding")) return;
  toast.classList.add("hiding");
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300); // Match CSS animation duration
}
