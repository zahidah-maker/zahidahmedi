// =================================
// MEDITrack HIMS - DASHBOARD
// Summary cards, charts, today's schedule
// =================================

buildShell("dashboard", "Dashboard");

const patients = getPatients();
const appointments = getAppointments();
const today = localISO(new Date());

// =================================
// 1. SUMMARY CARDS
// =================================

document.getElementById("stat-patients").textContent = patients.length;
document.getElementById("stat-doctors").textContent = DOCTORS.length;

document.getElementById("stat-today").textContent = appointments.filter(
  (a) => a.date === today,
).length;

document.getElementById("stat-pending").textContent = appointments.filter(
  (a) => a.status === "Pending",
).length;

// Link today's appointments
document.getElementById("card-today").href = "appointments.html?date=" + today;

document.getElementById("schedule-all").href =
  "appointments.html?date=" + today;

// =================================
// 2. TODAY'S SCHEDULE
// =================================

const todaysAppointments = appointments
  .filter((a) => a.date === today)
  .sort((a, b) => a.time.localeCompare(b.time));

const scheduleList = document.getElementById("schedule-list");

scheduleList.innerHTML = todaysAppointments.length
  ? todaysAppointments
      .map(
        (a) => `
        <div class="schedule-item">

            <span class="schedule-time">
                ${esc(a.time)}
            </span>

            <div class="schedule-main">
                ${patientLink(a.patientId)}

                <small>
                    with ${doctorLink(a.doctorId)}
                    &middot; ${esc(a.id)}
                </small>
            </div>

            ${statusBadge(a.status)}

        </div>
    `,
      )
      .join("")
  : `
        <div class="empty">
            No appointments today.
            <a href="appointments.html?book=1">Book one</a>.
        </div>
    `;

// =================================
// 3. RECENT ACTIVITIES
// =================================

const activities = getActivities().slice(0, 6);
const activityList = document.getElementById("activity-list");

activityList.innerHTML = activities.length
  ? activities
      .map(
        (item) => `
        <li>
            <span class="activity-dot"></span>

            <span>
                ${esc(item.text)}

                <span class="activity-time">
                    ${esc(item.time)}
                </span>
            </span>
        </li>
    `,
      )
      .join("")
  : `
        <li class="empty">
            No recent activities.
        </li>
    `;

// =================================
// 4. CHARTS
// =================================

if (typeof Chart === "undefined") {
  document.querySelectorAll(".chart-box").forEach((box) => {
    box.innerHTML = `
            <div class="empty">
                Charts could not load.
                Check your internet connection and refresh.
            </div>
        `;
  });
} else {
  Chart.defaults.font.family = "Arial, Helvetica, sans-serif";
  Chart.defaults.color = "#64748b";

  const base = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const grid = {
    color: "#e9eff4",
  };

  const legendBottom = {
    position: "bottom",
    labels: {
      usePointStyle: true,
      boxWidth: 8,
    },
  };

  // =================================
  // CHART 1: DAILY APPOINTMENTS
  // =================================

  const days = [];

  for (let o = -7; o <= 7; o++) {
    days.push(dateOffset(o));
  }

  const dayLabels = days.map((iso, i) =>
    i === 7
      ? "Today"
      : new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
        }),
  );

  new Chart(document.getElementById("dailyChart"), {
    type: "bar",

    data: {
      labels: dayLabels,

      datasets: APPOINTMENT_STATUSES.map((status) => ({
        label: status,

        data: days.map(
          (date) =>
            appointments.filter((a) => a.date === date && a.status === status)
              .length,
        ),

        backgroundColor: STATUS_COLORS[status],
        borderRadius: 3,
      })),
    },

    options: Object.assign(
      {},
      base,
      {
        plugins: {
          legend: legendBottom,
        },

        scales: {
          x: {
            stacked: true,
            grid: {
              display: false,
            },
          },

          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            grid: grid,
            title: {
              display: true,
              text: "Appointments",
            },
          },
        },
      },
      clickable(
        (datasetIndex, dataIndex) =>
          `appointments.html?date=${days[dataIndex]}&status=${encodeURIComponent(APPOINTMENT_STATUSES[datasetIndex])}`,
      ),
    ),
  });

  // =================================
  // CHART 2: APPOINTMENT STATUS
  // =================================

  new Chart(document.getElementById("statusChart"), {
    type: "doughnut",

    data: {
      labels: APPOINTMENT_STATUSES,

      datasets: [
        {
          data: APPOINTMENT_STATUSES.map(
            (status) => appointments.filter((a) => a.status === status).length,
          ),

          backgroundColor: APPOINTMENT_STATUSES.map(
            (status) => STATUS_COLORS[status],
          ),

          borderWidth: 2,
        },
      ],
    },

    options: Object.assign(
      {},
      base,
      {
        cutout: "62%",

        plugins: {
          legend: legendBottom,
        },
      },
      clickable(
        (datasetIndex, dataIndex) =>
          `appointments.html?status=${encodeURIComponent(APPOINTMENT_STATUSES[dataIndex])}`,
      ),
    ),
  });

  // =================================
  // CHART 3: PATIENT VISITS BY MONTH
  // =================================

  new Chart(document.getElementById("visitsChart"), {
    type: "bar",

    data: {
      labels: MONTHLY_VISITS.labels,

      datasets: [
        {
          type: "bar",
          label: "This year",
          data: MONTHLY_VISITS.thisYear,
          backgroundColor: "#087f8c",
          borderRadius: 5,
        },

        {
          type: "line",
          label: "Last year",
          data: MONTHLY_VISITS.lastYear,
          borderColor: "#e8a317",
          backgroundColor: "#e8a317",
          tension: 0.35,
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    },

    options: Object.assign({}, base, {
      plugins: {
        legend: legendBottom,
      },

      scales: {
        x: {
          grid: {
            display: false,
          },
        },

        y: {
          beginAtZero: true,
          grid: grid,
          title: {
            display: true,
            text: "Visits",
          },
        },
      },
    }),
  });

  // =================================
  // CHART 4: PATIENTS BY DEPARTMENT
  // =================================

  const deptPalette = [
    "#087f8c",
    "#1d4e89",
    "#2e9e66",
    "#e8a317",
    "#7a5ea8",
    "#d9534f",
  ];

  new Chart(document.getElementById("deptChart"), {
    type: "bar",

    data: {
      labels: DEPARTMENTS,

      datasets: [
        {
          label: "Patients",

          data: DEPARTMENTS.map(
            (department) =>
              patients.filter((p) => p.department === department).length,
          ),

          backgroundColor: deptPalette,
          borderRadius: 5,
        },
      ],
    },

    options: Object.assign(
      {},
      base,
      {
        indexAxis: "y",

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            grid: grid,
          },

          y: {
            grid: {
              display: false,
            },
          },
        },
      },
      clickable(
        (datasetIndex, dataIndex) =>
          "patients.html?dept=" + encodeURIComponent(DEPARTMENTS[dataIndex]),
      ),
    ),
  });

  // =================================
  // CHART 5: PATIENTS BY AGE GROUP
  // =================================

  new Chart(document.getElementById("ageChart"), {
    type: "bar",

    data: {
      labels: AGE_GROUPS.map((group) => group + " years"),

      datasets: [
        {
          label: "Patients",

          data: AGE_GROUPS.map(
            (group) => patients.filter((p) => ageGroup(p.age) === group).length,
          ),

          backgroundColor: "#1d4e89",
          borderRadius: 5,
        },
      ],
    },

    options: Object.assign(
      {},
      base,
      {
        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          x: {
            grid: {
              display: false,
            },
          },

          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            grid: grid,
          },
        },
      },
      clickable(
        (datasetIndex, dataIndex) =>
          "patients.html?age=" + encodeURIComponent(AGE_GROUPS[dataIndex]),
      ),
    ),
  });

  // =================================
  // CHART 6: PATIENTS BY GENDER
  // =================================

  const genders = ["Male", "Female"];

  new Chart(document.getElementById("genderChart"), {
    type: "doughnut",

    data: {
      labels: genders,

      datasets: [
        {
          data: genders.map(
            (gender) => patients.filter((p) => p.gender === gender).length,
          ),

          backgroundColor: ["#1d4e89", "#087f8c"],

          borderWidth: 2,
        },
      ],
    },

    options: Object.assign(
      {},
      base,
      {
        cutout: "62%",

        plugins: {
          legend: legendBottom,
        },
      },
      clickable(
        (datasetIndex, dataIndex) =>
          "patients.html?gender=" + encodeURIComponent(genders[dataIndex]),
      ),
    ),
  });
}
