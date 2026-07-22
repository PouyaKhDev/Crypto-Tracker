//-----------------------------------------
//  DOM Elements
//-----------------------------------------

const elements = {
  totalMarketCap: document.getElementById("totalMarketCap"),
  activeCryptocurrencies: document.getElementById("activeCryptocurrencies"),
  totalVolume: document.getElementById("totalVolume"),
  marketsStatsGrid: document.querySelector(".market-stats-grid"),
};

//-----------------------------------------
//  Fetching Data
//-----------------------------------------

async function fetchStats() {
  try {
    const data = await getGlobalCryptoData();
    const global = data.data;

    if (elements.totalMarketCap) {
      elements.totalMarketCap.textContent = formatCurrency(global.total_market_cap.usd);
    }
    if (elements.activeCryptocurrencies) {
      elements.activeCryptocurrencies.textContent = formatCompactNumber(
        global.active_cryptocurrencies,
      );
    }
    if (elements.totalVolume) {
      elements.totalVolume.textContent = formatCurrency(global.total_volume.usd);
    }
  } catch (error) {
    showToast("Failed to load cryptocurrency stats data. Please try again later.", "error");
    console.log("Error fetching the stats data", error);
  }
}

async function fetchCryptoMarketData() {
  try {
    showLoading(elements.marketsStatsGrid, true);
    const data = await getCryptoMarketData({ per_page: 4, page: 1 });

    showLoading(elements.marketsStatsGrid, false);
    renderCryptoMarketStats(data);
  } catch (error) {
    showToast("Failed to load crypto market data. Please try again later.", "error");
    console.log("Error fetching the crypto market data", error);
  }
}

//-----------------------------------------
//  Rendering
//-----------------------------------------
function renderCryptoMarketStats(dataList) {
  dataList.forEach((crypto) => {
    const change24h = crypto.price_change_percentage_24h || 0;
    const htmlTemplate = `
        <div class="market-stat-card" id="crypto-${crypto.id}">
          <div class="market-stat-header">
            <span class="market-stat-label">-</span>
            <span class="market-stat-symbol">-</span>
          </div>

          <div class="market-stat-value">-</div>

          <div class="market-stat-change ${change24h >= 0 ? "text-positive" : "text-negative"}">-</div>
        </div>
    `;

    elements.marketsStatsGrid.insertAdjacentHTML("beforeend", htmlTemplate);

    const cryptoCard = document.getElementById(`crypto-${crypto.id}`);
    cryptoCard.querySelector(".market-stat-label").textContent = crypto.name;
    cryptoCard.querySelector(".market-stat-symbol").textContent = crypto.symbol;
    cryptoCard.querySelector(".market-stat-value").textContent = formatCurrency(
      crypto.current_price,
    );
    cryptoCard.querySelector(".market-stat-change").textContent = formatPercentage(
      crypto.price_change_percentage_24h,
    );
  });
}

//-----------------------------------------
//  Smooth Scrolling
//-----------------------------------------

/**
 * Initialize smooth scrolling for links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#") {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });
}

// //-----------------------------------------
// //  Scroll Animation
// //-----------------------------------------

// /**
//  * Initialize scroll animations using Intersection Observer API
//  */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document
    .querySelectorAll(".feature-card, .step-card, .testimonial-card, .market-stat-card")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(2rem)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });
}

// Add animation class styles
const style = document.createElement("style");
style.textContent = `
  .animate-in {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

//-----------------------------------------
//  Initialization
//-----------------------------------------

function init() {
  fetchStats();
  fetchCryptoMarketData();

  initSmoothScroll();
  initScrollAnimations();
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
