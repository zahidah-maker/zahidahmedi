// =================================
// MEDITrack HIMS - LOGIN FUNCTION
// =================================

// for academic purpose
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "123456";

// Get HTML elements
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
const showPasswordCheckbox = document.getElementById("show-password");

// Check whether login elements exist
if (loginForm && usernameInput && passwordInput) {
  // Handle login form submission
  loginForm.addEventListener("submit", function (event) {
    // Prevent page refresh
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Check login credentials
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      // Save login information for current session
      sessionStorage.setItem("himsLoggedIn", "true");
      sessionStorage.setItem("himsUsername", username);

      // Redirect to Dashboard
      window.location.href = "dashboard.html";
    } else {
      // Display error message
      if (errorMessage) {
        errorMessage.textContent =
          "Invalid username or password. Please try again.";

        errorMessage.classList.remove("d-none");
      }

      // Clear password field
      passwordInput.value = "";

      // Focus on password field
      passwordInput.focus();
    }
  });

  // Hide error message when user starts typing
  function hideError() {
    if (errorMessage) {
      errorMessage.classList.add("d-none");
    }
  }

  usernameInput.addEventListener("input", hideError);
  passwordInput.addEventListener("input", hideError);

  // Show or hide password
  if (showPasswordCheckbox) {
    showPasswordCheckbox.addEventListener("change", function () {
      passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
    });
  }
}

// Skip login page if user is already logged in
if (sessionStorage.getItem("himsLoggedIn") === "true") {
  window.location.replace("dashboard.html");
}
