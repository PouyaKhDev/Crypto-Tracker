//-----------------------------------------
//  Password Visibility Toggle
//-----------------------------------------

function initPasswordToggles() {
  const toggles = document.querySelectorAll(".input-toggle");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const input = this.parentElement.querySelector("input");
      if (input.type === "password") {
        input.type = "text";
        // Change icon to 'eye-off' (simplified for brevity)
        this.innerHTML =
          '<svg class="icon-eye" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
      } else {
        input.type = "password";
        // Change icon back to 'eye'
        this.innerHTML =
          '<svg class="icon-eye" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      }
    });
  });
}

//-----------------------------------------
//  Password Strength
//-----------------------------------------

function initPasswordStrength() {
  // Django's UserCreationForm uses 'id_password1'
  const passwordInput = document.getElementById("id_password1");
  const strengthBars = document.querySelectorAll(".strength-bar");

  if (!passwordInput) return;

  passwordInput.addEventListener("input", function () {
    const password = this.value;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    strengthBars.forEach((bar, index) => {
      bar.className = "strength-bar"; // Reset classes
      if (index < strength) {
        if (strength <= 1) bar.classList.add("weak");
        else if (strength <= 2) bar.classList.add("medium");
        else bar.classList.add("strong");
      }
    });
  });
}

//-----------------------------------------
//  Initialize
//-----------------------------------------

function initAuth() {
  initPasswordToggles();
  initPasswordStrength();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuth);
} else {
  initAuth();
}
