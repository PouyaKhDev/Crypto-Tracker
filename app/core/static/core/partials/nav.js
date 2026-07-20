/**
 * Show mobile menu
 */
function showMobileMenu() {
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

function init() {
  showMobileMenu();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
