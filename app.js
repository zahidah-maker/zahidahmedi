// =================================
// MEDITrack HIMS - SHARED FUNCTIONS
// Layout (sidebar, top bar, footer), storage, links and helpers
// =================================

const KEYS = {
  patients: "hims_patients",
  appointments: "hims_appointments",
  activities: "hims_activities",
};

// URL query parameters (used for links between pages, e.g. ?status=Pending)
const Q = new URLSearchParams(window.location.search);

// ---------- Storage (localStorage, falls back to sample data) ----------
const Store = {
  get(key, seed) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* storage unavailable - use sample data */
    }
    const copy = JSON.parse(JSON.stringify(seed));
    Store.set(key, copy);
    return copy;
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* ignore */
    }
  },
};

function getPatients() {
  return Store.get(KEYS.patients, SEED_PATIENTS);
}
function getAppointments() {
  return Store.get(KEYS.appointments, SEED_APPOINTMENTS);
}
function getActivities() {
  return Store.get(KEYS.activities, SEED_ACTIVITIES);
}

function logActivity(text) {
  const list = getActivities();
  list.unshift({ text: text, time: "Just now" });
  Store.set(KEYS.activities, list.slice(0, 8));
}

// ---------- Helpers ----------
function esc(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function fmtDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function nextId(list, prefix) {
  const max = list.reduce(
    (m, item) => Math.max(m, parseInt(item.id.slice(1), 10) || 0),
    0,
  );
  return prefix + String(max + 1).padStart(3, "0");
}

function patientName(id) {
  const p = getPatients().find((x) => x.id === id);
  return p ? p.name : "Deleted patient";
}

function doctorName(id) {
  const d = DOCTORS.find((x) => x.id === id);
  return d ? d.name : "Unknown doctor";
}

function initials(name) {
  return name
    .replace("Dr. ", "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusBadge(status) {
  return `<span class="status-badge status-${esc(status.toLowerCase())}">${esc(status)}</span>`;
}

// Links between pages: patient name -> patient detail, doctor name -> doctor card
function patientLink(id) {
  const exists = getPatients().some((p) => p.id === id);
  return exists
    ? `<a class="cell-link" href="patients.html?id=${encodeURIComponent(id)}">${esc(patientName(id))}</a>`
    : esc(patientName(id));
}

function doctorLink(id) {
  const exists = DOCTORS.some((d) => d.id === id);
  return exists
    ? `<a class="cell-link" href="doctors.html?id=${encodeURIComponent(id)}">${esc(doctorName(id))}</a>`
    : esc(doctorName(id));
}

// Filter "chips" shown above tables, each removable
function renderChips(el, chips, onClearAll) {
  if (!chips.length) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML =
    chips
      .map(
        (c, i) =>
          `<span class="chip">${esc(c.label)}<button type="button" data-i="${i}" aria-label="Remove filter ${esc(c.label)}">&times;</button></span>`,
      )
      .join("") + '<button type="button" class="chip-clear">Clear all</button>';
  el.querySelectorAll("button[data-i]").forEach((b) =>
    b.addEventListener("click", () => chips[b.dataset.i].onRemove()),
  );
  el.querySelector(".chip-clear").addEventListener("click", onClearAll);
}

// Make a Chart.js chart clickable: urlFor(datasetIndex, index) returns the page to open
function clickable(urlFor) {
  return {
    onClick: (event, elements) => {
      if (!elements.length) return;
      const url = urlFor(elements[0].datasetIndex, elements[0].index);
      if (url) window.location.href = url;
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length
        ? "pointer"
        : "default";
    },
  };
}

// ---------- Layout ----------
const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "dashboard.html",
    icon: "bi-grid-1x2-fill",
  },
  {
    key: "patients",
    label: "Patients",
    href: "patients.html",
    icon: "bi-people-fill",
  },
  {
    key: "doctors",
    label: "Doctors",
    href: "doctors.html",
    icon: "bi-person-badge-fill",
  },
  {
    key: "appointments",
    label: "Appointments",
    href: "appointments.html",
    icon: "bi-calendar2-check-fill",
  },
];

function buildShell(active, title) {
  const username = sessionStorage.getItem("himsUsername") || "admin";

  const links = NAV_ITEMS.map(
    (item) => `
        <a class="nav-link-app ${item.key === active ? "active" : ""}" href="${item.href}"
           ${item.key === active ? 'aria-current="page"' : ""}>
            <i class="bi ${item.icon}"></i><span>${item.label}</span>
        </a>`,
  ).join("");

  document.getElementById("sidebar").innerHTML = `
        <div class="brand"><span class="brand-icon">✚</span><span>MediTrack</span></div>
        <nav class="side-nav" aria-label="Main navigation">${links}</nav>
        <div class="side-bottom">
            <button type="button" class="side-btn" id="reset-demo">
                <i class="bi bi-arrow-counterclockwise"></i><span>Reset demo data</span>
            </button>
            <button type="button" class="side-btn" id="logout-btn">
                <i class="bi bi-box-arrow-left"></i><span>Logout</span>
            </button>
        </div>`;

  document.getElementById("topbar").innerHTML = `
        <button type="button" class="menu-toggle" id="menu-toggle" aria-label="Open menu" aria-expanded="false">
            <i class="bi bi-list"></i>
        </button>
        <h1 class="topbar-title">${esc(title)}</h1>
        <a class="btn-quick" href="appointments.html?book=1">
    <i class="bi bi-plus-lg"></i>
    <span>New appointment</span>
</a>

<button
    type="button"
    class="theme-toggle"
    data-theme-toggle
    aria-label="Switch theme"
>
    ☾ Dark Mode
</button>

<div class="user-chip">
            <span class="avatar">${esc(username.charAt(0).toUpperCase())}</span>
            <span class="user-name">${esc(username)}</span>
        </div>`;

  document.getElementById("footer").innerHTML = `
        <div>
            <strong>MediTrack General Hospital</strong><br>
            Jalan Hospital 1, Shah Alam, Selangor<br>
            +60 3-1234 5678 &middot; info@meditrack.example
        </div>
        <div class="footer-links">
            <strong>Quick links</strong>
            ${NAV_ITEMS.map((i) => `<a href="${i.href}">${i.label}</a>`).join("")}
        </div>
        <div class="footer-right">
            &copy; 2026 MediTrack HIMS<br>
            Academic prototype. All data is fictional.
        </div>`;

  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("himsLoggedIn");
    sessionStorage.removeItem("himsUsername");
    window.location.href = "index.html";
  });

  document.getElementById("reset-demo").addEventListener("click", () => {
    if (
      confirm(
        "Reset all patients, appointments and activities to the original sample data?",
      )
    ) {
      Object.values(KEYS).forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch (e) {
          /* ignore */
        }
      });
      window.location.href = window.location.pathname;
    }
  });

  // Mobile sidebar toggle
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const toggle = document.getElementById("menu-toggle");
  const setOpen = (open) => {
    sidebar.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
    toggle.setAttribute("aria-expanded", open);
  };
  toggle.addEventListener("click", () =>
    setOpen(!sidebar.classList.contains("open")),
  );
  overlay.addEventListener("click", () => setOpen(false));
}
