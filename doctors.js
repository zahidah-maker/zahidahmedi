// =================================
// MEDITrack HIMS - DOCTORS
// =================================

buildShell("doctors", "Doctors");

const state = {
  term: Q.get("q") || "",
  dept: DEPARTMENTS.includes(Q.get("dept")) ? Q.get("dept") : "",
};

const grid = document.getElementById("doctor-grid");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search");
const deptFilter = document.getElementById("filter-dept");
const chipsEl = document.getElementById("chips");

let chart = null;

// =================================
// DEPARTMENT FILTER
// =================================

deptFilter.insertAdjacentHTML(
  "beforeend",
  DEPARTMENTS.map((d) => `<option value="${esc(d)}">${esc(d)}</option>`).join(
    "",
  ),
);

// =================================
// SYNC FILTER CONTROLS
// =================================

function syncControls() {
  searchInput.value = state.term;
  deptFilter.value = state.dept;
}

// =================================
// DOCTOR APPOINTMENT STATISTICS
// =================================

function doctorStats(doctor, appointments) {
  const todayIso = localISO(new Date());

  const mine = appointments.filter((a) => a.doctorId === doctor.id);

  return {
    total: mine.length,

    completed: mine.filter((a) => a.status === "Completed").length,

    upcoming: mine.filter(
      (a) => a.date >= todayIso && ["Confirmed", "Pending"].includes(a.status),
    ).length,

    byStatus: APPOINTMENT_STATUSES.map(
      (status) => mine.filter((a) => a.status === status).length,
    ),
  };
}

// =================================
// RENDER DOCTORS
// =================================

function render() {
  const appointments = getAppointments();
  const patients = getPatients();

  const term = state.term.trim().toLowerCase();

  const doctors = DOCTORS.filter(
    (d) =>
      (!term || d.name.toLowerCase().includes(term)) &&
      (!state.dept || d.department === state.dept),
  );

  // FILTER CHIPS

  const chips = [];

  if (state.term) {
    chips.push({
      label: `Search: ${state.term}`,
      onRemove: () => {
        state.term = "";
        syncControls();
        render();
      },
    });
  }

  if (state.dept) {
    chips.push({
      label: state.dept,
      onRemove: () => {
        state.dept = "";
        syncControls();
        render();
      },
    });
  }

  renderChips(chipsEl, chips);

  // DOCTOR CARDS

  grid.innerHTML = doctors
    .map((d) => {
      const s = doctorStats(d, appointments);

      const pct = s.total ? Math.round((s.completed / s.total) * 100) : 0;

      const deptPatients = patients.filter(
        (p) => p.department === d.department,
      ).length;

      return `
            <article class="doctor-card" id="doc-${esc(d.id)}">

                <div class="doctor-card-header">

                    <div class="doctor-avatar">
                        ${initials(d.name)}
                    </div>

                    <div class="doctor-info">
                        <h3>${esc(d.name)}</h3>
                        <span>${esc(d.department)}</span>
                    </div>

                </div>


                <div class="doctor-patient-count">
                    <a href="patients.html?dept=${encodeURIComponent(d.department)}">
                        <i class="bi bi-people"></i>
                        ${deptPatients} Patients in Department
                    </a>
                </div>


                <div class="doctor-stats">

                    <div>
                        <strong>${s.total}</strong>
                        <span>Total Appointments</span>
                    </div>

                    <div>
                        <strong>${s.upcoming}</strong>
                        <span>Upcoming</span>
                    </div>

                    <div>
                        <strong>${s.completed}</strong>
                        <span>Completed</span>
                    </div>

                </div>


                <div class="doctor-progress">

                    <div class="doctor-progress-label">
                        <span>Completion Rate</span>
                        <strong>${pct}%</strong>
                    </div>

                    <div class="progress">
                        <div
                            class="progress-bar"
                            role="progressbar"
                            style="width: ${pct}%"
                            aria-valuenow="${pct}"
                            aria-valuemin="0"
                            aria-valuemax="100">
                        </div>
                    </div>

                </div>


                <div class="doctor-actions">

                    <a
                        href="appointments.html?doctor=${encodeURIComponent(d.id)}"
                        class="btn btn-sm btn-outline-teal">
                        <i class="bi bi-calendar-check"></i>
                        View Appointments
                    </a>

                    <a
                        href="appointments.html?book=1&doctor=${encodeURIComponent(d.id)}"
                        class="btn btn-sm btn-teal">
                        <i class="bi bi-plus-lg"></i>
                        Book Appointment
                    </a>

                </div>

            </article>
        `;
    })
    .join("");

  // EMPTY STATE

  emptyState.classList.toggle("d-none", doctors.length > 0);

  // =================================
  // DOCTOR APPOINTMENT CHART
  // =================================

  if (typeof Chart === "undefined") {
    document.querySelector(".chart-box").innerHTML = `
            <div class="empty">
                Chart could not load. Check your internet connection and refresh.
            </div>
        `;
    return;
  }

  if (chart) {
    chart.destroy();
    chart = null;
  }

  Chart.defaults.font.family = "Arial, Helvetica, sans-serif";

  Chart.defaults.color = "#64748b";

  const canvas = document.getElementById("doctorChart");

  if (!canvas) return;

  chart = new Chart(canvas, {
    type: "bar",

    data: {
      labels: doctors.map((d) => d.name),

      datasets: APPOINTMENT_STATUSES.map((status, i) => ({
        label: status,

        data: doctors.map((d) => doctorStats(d, appointments).byStatus[i]),

        backgroundColor: STATUS_COLORS[status],
        borderRadius: 3,
      })),
    },

    options: Object.assign(
      {
        responsive: true,
        maintainAspectRatio: false,

        indexAxis: "y",

        plugins: {
          legend: {
            position: "bottom",

            labels: {
              usePointStyle: true,
              boxWidth: 8,
            },
          },
        },

        scales: {
          x: {
            stacked: true,
            beginAtZero: true,

            ticks: {
              stepSize: 1,
            },

            grid: {
              color: "#e9eff4",
            },

            title: {
              display: true,
              text: "Appointments",
            },
          },

          y: {
            stacked: true,

            grid: {
              display: false,
            },
          },
        },
      },

      clickable((datasetIndex, dataIndex) => {
        const doctor = doctors[dataIndex];
        const status = APPOINTMENT_STATUSES[datasetIndex];

        if (!doctor || !status) return null;

        return `appointments.html?doctor=${encodeURIComponent(doctor.id)}&status=${encodeURIComponent(status)}`;
      }),
    ),
  });
}

// =================================
// SEARCH EVENT
// =================================

searchInput.addEventListener("input", () => {
  state.term = searchInput.value;
  render();
});

// =================================
// DEPARTMENT FILTER EVENT
// =================================

deptFilter.addEventListener("change", () => {
  state.dept = deptFilter.value;
  render();
});

// =================================
// INITIAL RENDER
// =================================

syncControls();
render();

// =================================
// HIGHLIGHT SELECTED DOCTOR
// =================================

const doctorId = Q.get("id");

if (doctorId) {
  const highlighted = document.getElementById(`doc-${doctorId}`);

  if (highlighted) {
    highlighted.classList.add("highlight");

    highlighted.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}
