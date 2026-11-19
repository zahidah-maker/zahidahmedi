// =================================
// MEDITrack HIMS - PATIENT MANAGEMENT
// Search, filter, add, edit, delete and patient detail
// Linked to Appointments and Doctors.
// =================================

// Build shared application layout
buildShell("patients", "Patients");

// Load patient records
let patients = getPatients();

// =================================
// 1. FILTER SETTINGS
// =================================

const state = {
  term: Q.get("q") || "",
  dept: DEPARTMENTS.includes(Q.get("dept")) ? Q.get("dept") : "",
  gender: ["Male", "Female"].includes(Q.get("gender")) ? Q.get("gender") : "",
  age:
    typeof AGE_GROUPS !== "undefined" && AGE_GROUPS.includes(Q.get("age"))
      ? Q.get("age")
      : "",
};

// =================================
// 2. GET HTML ELEMENTS
// =================================

const tableBody = document.getElementById("table-body");
const emptyState = document.getElementById("empty-state");

const searchInput = document.getElementById("search");
const deptFilter = document.getElementById("filter-dept");
const genderFilter = document.getElementById("filter-gender");

const chipsEl = document.getElementById("chips");
const miniStats = document.getElementById("mini-stats");

const form = document.getElementById("patient-form");

const patientIdInput = document.getElementById("patient-id");
const patientNameInput = document.getElementById("patient-name");
const patientGenderInput = document.getElementById("patient-gender");
const patientAgeInput = document.getElementById("patient-age");
const patientDeptInput = document.getElementById("patient-dept");

const addButton = document.getElementById("add-btn");

// Bootstrap modal instances
const formModal = new bootstrap.Modal(document.getElementById("patient-modal"));

const detailModal = new bootstrap.Modal(
  document.getElementById("detail-modal"),
);

// =================================
// 3. DEPARTMENT DROPDOWNS
// =================================

// Add department options to filter
const deptOptions = DEPARTMENTS.map(
  (department) => `
    <option value="${esc(department)}">
        ${esc(department)}
    </option>
`,
).join("");

deptFilter.insertAdjacentHTML("beforeend", deptOptions);

// Add department options to patient form
patientDeptInput.insertAdjacentHTML("beforeend", deptOptions);

// =================================
// 4. FILTER CONTROLS
// =================================

function syncControls() {
  searchInput.value = state.term;
  deptFilter.value = state.dept;
  genderFilter.value = state.gender;
}

// Clear all active filters
function clearAll() {
  state.term = "";
  state.dept = "";
  state.gender = "";
  state.age = "";

  syncControls();
  render();
}

// =================================
// 5. AGE GROUP HELPER
// =================================

function getPatientAgeGroup(age) {
  if (typeof ageGroup === "function") {
    return ageGroup(Number(age));
  }

  return "";
}

// =================================
// 6. RENDER PATIENT TABLE
// =================================

function render() {
  const appointments = getAppointments();

  const term = state.term.trim().toLowerCase();

  // Apply patient filters
  const rows = patients.filter((patient) => {
    const name = String(patient.name || "").toLowerCase();
    const id = String(patient.id || "").toLowerCase();

    return (
      (!term || name.includes(term) || id.includes(term)) &&
      (!state.dept || patient.department === state.dept) &&
      (!state.gender || patient.gender === state.gender) &&
      (!state.age || getPatientAgeGroup(patient.age) === state.age)
    );
  });

  // =================================
  // FILTER CHIPS
  // =================================

  const chips = [];

  function addChip(label, key) {
    chips.push({
      label: label,

      onRemove: () => {
        state[key] = "";

        syncControls();
        render();
      },
    });
  }

  if (state.term) {
    addChip("Search: " + state.term, "term");
  }

  if (state.dept) {
    addChip("Department: " + state.dept, "dept");
  }

  if (state.gender) {
    addChip("Gender: " + state.gender, "gender");
  }

  if (state.age) {
    addChip("Age: " + state.age, "age");
  }

  renderChips(chipsEl, chips, clearAll);

  // =================================
  // SUMMARY STATISTICS
  // =================================

  const avgAge = rows.length
    ? Math.round(
        rows.reduce((sum, patient) => sum + Number(patient.age || 0), 0) /
          rows.length,
      )
    : 0;

  const deptCount = {};

  rows.forEach((patient) => {
    const department = patient.department || "Unknown";

    deptCount[department] = (deptCount[department] || 0) + 1;
  });

  const topDept =
    Object.keys(deptCount).sort((a, b) => deptCount[b] - deptCount[a])[0] ||
    "-";

  miniStats.innerHTML = `

        <span>
            Showing <b>${rows.length}</b> of ${patients.length} patients
        </span>

        <span>
            Average age <b>${avgAge || "-"}</b>
        </span>

        <span>
            Largest department <b>${esc(topDept)}</b>
        </span>

    `;

  // =================================
  // PATIENT TABLE
  // =================================

  tableBody.innerHTML = rows
    .map((patient) => {
      const appointmentCount = appointments.filter(
        (appointment) => appointment.patientId === patient.id,
      ).length;

      return `

            <tr>

                <td>${esc(patient.id)}</td>

                <td>

                    <button
                        type="button"
                        class="cell-link"
                        data-action="view"
                        data-id="${esc(patient.id)}"
                    >
                        ${esc(patient.name)}
                    </button>

                </td>

                <td>${esc(patient.gender)}</td>

                <td>${esc(patient.age)}</td>

                <td>

                    <a
                        class="cell-link"
                        href="doctors.html?dept=${encodeURIComponent(patient.department || "")}"
                        title="See ${esc(patient.department || "department")} doctors"
                    >
                        ${esc(patient.department || "-")}
                    </a>

                </td>

                <td>

                    <a
                        class="count-pill"
                        href="appointments.html?patient=${encodeURIComponent(patient.id)}"
                        title="View appointments"
                    >
                        ${appointmentCount}
                    </a>

                </td>

                <td>

                    <div class="row-actions">

                        <button
                            type="button"
                            class="icon-btn"
                            data-action="view"
                            data-id="${esc(patient.id)}"
                            aria-label="View ${esc(patient.name)}"
                        >
                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="icon-btn"
                            data-action="edit"
                            data-id="${esc(patient.id)}"
                            aria-label="Edit ${esc(patient.name)}"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button
                            type="button"
                            class="icon-btn danger"
                            data-action="delete"
                            data-id="${esc(patient.id)}"
                            aria-label="Delete ${esc(patient.name)}"
                        >
                            <i class="bi bi-trash"></i>
                        </button>

                    </div>

                </td>

            </tr>

        `;
    })
    .join("");

  // =================================
  // EMPTY STATE
  // =================================

  const noPatients = rows.length === 0;

  emptyState.hidden = !noPatients;
  emptyState.classList.toggle("d-none", !noPatients);
}

// =================================
// 7. SEARCH AND FILTER EVENTS
// =================================

searchInput.addEventListener("input", () => {
  state.term = searchInput.value;

  render();
});

deptFilter.addEventListener("change", () => {
  state.dept = deptFilter.value;

  render();
});

genderFilter.addEventListener("change", () => {
  state.gender = genderFilter.value;

  render();
});

// =================================
// 8. PATIENT DETAIL
// Linked appointment history
// =================================

function showDetail(id) {
  const patient = patients.find((item) => item.id === id);

  if (!patient) return;

  // Get patient's appointments
  const list = getAppointments()
    .filter((appointment) => appointment.patientId === id)
    .sort((a, b) => {
      const dateA = String(a.date || "") + String(a.time || "");
      const dateB = String(b.date || "") + String(b.time || "");

      return dateB.localeCompare(dateA);
    });

  // Get today's date in YYYY-MM-DD format
  const today = new Date();

  const todayIso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // Appointment statistics
  const upcoming = list.filter(
    (appointment) =>
      appointment.date >= todayIso &&
      (appointment.status === "Confirmed" || appointment.status === "Pending"),
  ).length;

  const completed = list.filter(
    (appointment) => appointment.status === "Completed",
  ).length;

  // Modal title
  document.getElementById("detail-title").textContent = "Patient " + patient.id;

  // Patient information and appointment history
  document.getElementById("detail-body").innerHTML = `

        <div class="detail-head">

            <span class="avatar big">
                ${esc(initials(patient.name))}
            </span>

            <div>

                <h4>${esc(patient.name)}</h4>

                <small>
                    ${esc(patient.gender)}, ${esc(patient.age)} years
                </small>

            </div>

        </div>

        <div class="detail-grid">

            <div>

                Department

                <b>

                    <a
                        class="cell-link"
                        href="doctors.html?dept=${encodeURIComponent(patient.department || "")}"
                    >
                        ${esc(patient.department || "-")}
                    </a>

                </b>

            </div>

            <div>

                Appointments

                <b>${list.length}</b>

            </div>

            <div>

                Completed / Upcoming

                <b>${completed} / ${upcoming}</b>

            </div>

        </div>

        <h6 class="panel-title">
            Appointment History
        </h6>

        ${
          list.length
            ? `

                <div class="table-responsive">

                    <table class="table app-table">

                        <thead>

                            <tr>
                                <th>ID</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>

                        </thead>

                        <tbody>

                            ${list
                              .slice(0, 6)
                              .map(
                                (appointment) => `

                                <tr>

                                    <td>${esc(appointment.id)}</td>

                                    <td>${doctorLink(appointment.doctorId)}</td>

                                    <td>${fmtDate(appointment.date)}</td>

                                    <td>${esc(appointment.time)}</td>

                                    <td>${statusBadge(appointment.status)}</td>

                                </tr>

                            `,
                              )
                              .join("")}

                        </tbody>

                    </table>

                </div>

            `
            : `

                <div class="empty">
                    No appointments yet for this patient.
                </div>

            `
        }

        <div class="doctor-actions mt-3">

            <a
                class="btn btn-sm btn-teal"
                href="appointments.html?book=1&patient=${encodeURIComponent(patient.id)}"
            >
                <i class="bi bi-plus-lg"></i>
                Book Appointment
            </a>

            <a
                class="btn btn-sm btn-outline-teal"
                href="appointments.html?patient=${encodeURIComponent(patient.id)}"
            >
                View All Appointments
            </a>

            <button
                type="button"
                class="btn btn-sm btn-outline-teal"
                id="detail-edit"
            >
                <i class="bi bi-pencil"></i>
                Edit Patient
            </button>

        </div>

    `;

  // Edit patient from detail modal
  document.getElementById("detail-edit").addEventListener("click", () => {
    detailModal.hide();

    openEdit(patient);
  });

  detailModal.show();
}

// =================================
// 9. ADD / EDIT PATIENT
// =================================

// Open edit modal
function openEdit(patient) {
  if (!patient) return;

  form.reset();

  form.classList.remove("was-validated");

  patientIdInput.value = patient.id;
  patientNameInput.value = patient.name;
  patientGenderInput.value = patient.gender;
  patientAgeInput.value = patient.age;
  patientDeptInput.value = patient.department;

  document.getElementById("modal-title").textContent =
    "Edit Patient " + patient.id;

  formModal.show();
}

// =================================
// ADD PATIENT BUTTON
// =================================

addButton.addEventListener("click", () => {
  form.reset();

  form.classList.remove("was-validated");

  patientIdInput.value = "";

  document.getElementById("modal-title").textContent = "Add Patient";

  formModal.show();
});

// =================================
// 10. TABLE ACTIONS
// View, Edit and Delete
// =================================

tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const patient = patients.find((item) => item.id === button.dataset.id);

  if (!patient) return;

  // View patient
  if (button.dataset.action === "view") {
    showDetail(patient.id);

    return;
  }

  // Edit patient
  if (button.dataset.action === "edit") {
    openEdit(patient);

    return;
  }

  // Delete patient
  if (button.dataset.action === "delete") {
    const linkedAppointments = getAppointments().filter(
      (appointment) => appointment.patientId === patient.id,
    );

    const note = linkedAppointments.length
      ? `\n\nThis will also delete ${linkedAppointments.length} linked appointment(s).`
      : "";

    const confirmed = confirm(`Delete ${patient.name} (${patient.id})?${note}`);

    if (!confirmed) return;

    // Remove patient
    patients = patients.filter((item) => item.id !== patient.id);

    Store.set(KEYS.patients, patients);

    // Remove linked appointments
    if (linkedAppointments.length > 0) {
      const remainingAppointments = getAppointments().filter(
        (appointment) => appointment.patientId !== patient.id,
      );

      Store.set(KEYS.appointments, remainingAppointments);
    }

    // Record activity
    logActivity(`Patient ${patient.id} (${patient.name}) deleted`);

    render();
  }
});

// =================================
// 11. SAVE PATIENT
// Add new patient or update existing
// =================================

form.addEventListener("submit", (event) => {
  event.preventDefault();

  event.stopPropagation();

  form.classList.add("was-validated");

  // Validate form
  if (!form.checkValidity()) return;

  const id = patientIdInput.value;

  const name = patientNameInput.value.trim();

  const gender = patientGenderInput.value;

  const age = Number(patientAgeInput.value);

  const department = patientDeptInput.value;

  // Additional validation
  if (
    !name ||
    !["Male", "Female"].includes(gender) ||
    !Number.isInteger(age) ||
    age < 1 ||
    age > 120 ||
    !DEPARTMENTS.includes(department)
  ) {
    alert("Please check all patient information and try again.");

    return;
  }

  const data = {
    name: name,
    gender: gender,
    age: age,
    department: department,
  };

  // =================================
  // UPDATE EXISTING PATIENT
  // =================================

  if (id) {
    const index = patients.findIndex((patient) => patient.id === id);

    if (index === -1) {
      alert("Patient record not found. Please refresh and try again.");

      return;
    }

    patients[index] = {
      id: id,
      ...data,
    };

    logActivity(`Patient ${id} (${name}) updated`);
  }

  // =================================
  // REGISTER NEW PATIENT
  // =================================
  else {
    const newId = nextId(patients, "P");

    patients.push({
      id: newId,
      ...data,
    });

    logActivity(`New patient ${newId} (${name}) registered`);
  }

  // =================================
  // SAVE CHANGES
  // =================================

  Store.set(KEYS.patients, patients);

  // Close modal
  formModal.hide();

  // Reset form
  form.reset();

  form.classList.remove("was-validated");

  // Refresh patient table
  render();
});

// =================================
// 12. INITIALIZE PAGE
// =================================

syncControls();

render();

// Open patient detail from URL
// Example: patients.html?id=P001

const patientIdFromURL = Q.get("id");

if (patientIdFromURL) {
  showDetail(patientIdFromURL);
}
