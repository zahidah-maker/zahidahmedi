// =================================
// MEDITrack HIMS - THEME MANAGEMENT
// Dark Mode / Bright Mode
// =================================

(function () {
  const THEME_KEY = "himsTheme";

  // Get saved theme
  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch (error) {
      return "light";
    }
  }

  // Apply selected theme
  function applyTheme(theme) {
    const selectedTheme = theme === "dark" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", selectedTheme);

    try {
      localStorage.setItem(THEME_KEY, selectedTheme);
    } catch (error) {
      // Continue even if storage is unavailable
    }

    updateButtons(selectedTheme);
  }

  // Update all theme buttons
  function updateButtons(theme) {
    const buttons = document.querySelectorAll("[data-theme-toggle]");

    buttons.forEach(function (button) {
      if (theme === "dark") {
        button.innerHTML = '<span aria-hidden="true">☀</span> Bright Mode';
        button.setAttribute("aria-label", "Switch to bright mode");
        button.setAttribute("title", "Switch to bright mode");
      } else {
        button.innerHTML = '<span aria-hidden="true">☾</span> Dark Mode';
        button.setAttribute("aria-label", "Switch to dark mode");
        button.setAttribute("title", "Switch to dark mode");
      }
    });
  }

  // Toggle theme
  function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(newTheme);
  }

  // Apply theme immediately before page styling
  applyTheme(getTheme());

  // Make theme functions available to other scripts
  window.MediTrackTheme = {
    apply: applyTheme,
    toggle: toggleTheme,
    get: getTheme,
    updateButtons: updateButtons,
  };

  // Attach click events to theme buttons
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.addEventListener("click", toggleTheme);
    });

    updateButtons(getTheme());
  });
})();
