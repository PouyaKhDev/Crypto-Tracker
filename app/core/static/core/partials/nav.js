//-----------------------------------------
//  DOM Elements
//-----------------------------------------

const mobileMenuElements = {
  mobileMenuToggle: document.querySelector(".mobile-menu-toggle"),
  mobileMenuDrawer: document.getElementById("mobile-menu-drawer"),
  mobileMenuOverlay: document.getElementById("mobile-menu-overlay"),
  mobileMenuClose: document.getElementById("mobile-menu-close"),
};

//-----------------------------------------
//  Event Handlers
//-----------------------------------------

/**
 * Open mobile menu
 */
function openMobileMenu() {
  if (mobileMenuElements.mobileMenuDrawer && mobileMenuElements.mobileMenuOverlay) {
    mobileMenuElements.mobileMenuDrawer.setAttribute("aria-hidden", "false");
    mobileMenuElements.mobileMenuOverlay.setAttribute("aria-hidden", "false");

    mobileMenuElements.mobileMenuDrawer.classList.add("active");
    mobileMenuElements.mobileMenuOverlay.classList.add("active");

    if (mobileMenuElements.mobileMenuToggle) {
      mobileMenuElements.mobileMenuToggle.setAttribute("aria-expanded", "true");
    }
  }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
  if (mobileMenuElements.mobileMenuDrawer && mobileMenuElements.mobileMenuOverlay) {
    mobileMenuElements.mobileMenuDrawer.classList.remove("active");
    mobileMenuElements.mobileMenuOverlay.classList.remove("active");

    if (mobileMenuElements.mobileMenuToggle) {
      mobileMenuElements.mobileMenuToggle.focus();
      mobileMenuElements.mobileMenuToggle.setAttribute("aria-expanded", "false");
    }

    mobileMenuElements.mobileMenuDrawer.setAttribute("aria-hidden", "true");
    mobileMenuElements.mobileMenuOverlay.setAttribute("aria-hidden", "true");
  }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  const isOpen = mobileMenuElements.mobileMenuDrawer?.classList.contains("active");
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

//-----------------------------------------
//  Initialization
//-----------------------------------------

/**
 * Initialize mobile menu event listeners
 */
function initMobileMenu() {
  // Toggle button
  if (mobileMenuElements.mobileMenuToggle) {
    mobileMenuElements.mobileMenuToggle.addEventListener("click", toggleMobileMenu);
  }

  // Close button
  if (mobileMenuElements.mobileMenuClose) {
    mobileMenuElements.mobileMenuClose.addEventListener("click", closeMobileMenu);
  }

  // Overlay click
  if (mobileMenuElements.mobileMenuOverlay) {
    mobileMenuElements.mobileMenuOverlay.addEventListener("click", closeMobileMenu);
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMobileMenu);
} else {
  initMobileMenu();
}
