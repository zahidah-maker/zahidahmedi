// =================================
// MEDITrack HIMS - APPOINTMENT MANAGEMENT
// Search, filter, add, edit and delete.
// Linked to Patients and Doctors.
// =================================

buildShell("appointments", "Appointments");

let appointments = getAppointments();

const booking = Q.has("book");

// =================================
// FILTER STATE
// =================================

const state = {
  term: Q.get("q") || "",

  status: APPOINTMENT_STATUSES.includes(Q.get("status")) ? Q.get("status") : "",

  date: /^\d{4}-\d{2}-\d{2}$/.test(Q.get("date") || "") ? Q.get("date") : "",

  doctor:
    !booking && DOCTORS.some((d) => d.id === Q.get("doctor"))
      ? Q.get("doctor")
      : "",

  patient:
    !booking && getPatients().some((p) => p.id === Q.get("patient"))
      ? Q.get("patient")
      : "",
};

// =================================
// DOM ELEMENTS
// =================================

const tableBody = document.getElementById("table-body");
const emptyState = document.getElementById("empty-state");

const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("filter-status");
const dateFilter = document.getElementById("filter-date");

const chipsEl = document.getElementById("chips");
const countEl = document.getElementById("count");
const statusCards = document.getElementById("status-cards");

const form = document.getElementById("appt-form");

const modalElement = document.getElementById("appt-modal");
const modal = new bootstrap.Modal(modalElement);

// =================================
// FILL DROPDOWNS
// =================================

// Appointment status dropdown

const statusOptions = APPOINTMENT_STATUSES.map(
  (status) => `<option value="${esc(status)}">${esc(status)}</option>`,
).join("");

statusFilter.insertAdjacentHTML("beforeend", statusOptions);

document.getElementById("appt-status").innerHTML = statusOptions;

// Doctor dropdown

document.getElementById("appt-doctor").insertAdjacentHTML(
  "beforeend",

  DOCTORS.map(
    (doctor) =>
      `<option value="${esc(doctor.id)}">
            ${esc(doctor.name)} (${esc(doctor.department)})
        </option>`,
  ).join(""),
);

// Patient dropdown

function fillPatientDropdown() {
  document.getElementById("appt-patient").innerHTML =
    '<option value="">Select</option>' +
    getPatients()
      .map(
        (patient) =>
          `<option value="${esc(patient.id)}">
                ${esc(patient.name)} (${esc(patient.id)})
            </option>`,
      )
      .join("");
}

// =================================
// SYNC FILTER CONTROLS
// =================================

function syncControls() {
  searchInput.value = state.term;
  statusFilter.value = state.status;
  dateFilter.value = state.date;
}

// =================================
// CLEAR ALL FILTERS
// =================================

function clearAll() {
  state.term = "";
  state.status = "";
  state.date = "";
  state.doctor = "";
  state.patient = "";

  syncControls();
  render();
}

// =================================
// RENDER APPOINTMENTS
// =================================

function render() {
  const term = state.term.trim().toLowerCase();

  const rows = appointments

    .filter((a) => {
      const haystack = `
                ${a.id}
                ${patientName(a.patientId)}
                ${doctorName(a.doctorId)}
            `.toLowerCase();

      return (
        (!term || haystack.includes(term)) &&
        (!state.status || a.status === state.status) &&
        (!state.date || a.date === state.date) &&
        (!state.doctor || a.doctorId === state.doctor) &&
        (!state.patient || a.patientId === state.patient)
      );
    })

    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  // =================================
  // STATUS SUMMARY CARDS
  // =================================

  const cardHtml = (label, value, count, color) => `
        <div class="col-6 col-md">

            <button
                type="button"
                class="status-card ${state.status === value ? "active" : ""}"
                style="--c:${color}"
                data-status="${esc(value)}"
                aria-pressed="${state.status === value}">

                <b>${count}</b>

                <span>${esc(label)}</span>

            </button>

        </div>
    `;

  statusCards.innerHTML =
    cardHtml("All appointments", "", appointments.length, "#123047") +
    APPOINTMENT_STATUSES.map((status) =>
      cardHtml(
        status,
        status,
        appointments.filter((a) => a.status === status).length,
        STATUS_COLORS[status],
      ),
    ).join("");

  // =================================
  // FILTER CHIPS
  // =================================

  const chips = [];

  const addChip = (label, key) => {
    chips.push({
      label: label,

      onRemove: () => {
        state[key] = "";

        syncControls();
        render();
      },
    });
  };

  if (state.term) {
    addChip("Search: " + state.term, "term");
  }

  if (state.status) {
    addChip("Status: " + state.status, "status");
  }

  if (state.date) {
    addChip("Date: " + fmtDate(state.date), "date");
  }

  if (state.doctor) {
    addChip("Doctor: " + doctorName(state.doctor), "doctor");
  }

  if (state.patient) {
    addChip("Patient: " + patientName(state.patient), "patient");
  }

  renderChips(chipsEl, chips, clearAll);

  // =================================
  // APPOINTMENT COUNT
  // =================================

  countEl.innerHTML = `
        <span>
            Showing <b>${rows.length}</b> of
            ${appointments.length} appointments
        </span>
    `;

  // =================================
  // APPOINTMENT TABLE
  // =================================

  tableBody.innerHTML = rows
    .map(
      (a) => `

        <tr>

            <td>${esc(a.id)}</td>

            <td>${patientLink(a.patientId)}</td>

            <td>${doctorLink(a.doctorId)}</td>

            <td>${fmtDate(a.date)}</td>

            <td>${esc(a.time)}</td>

            <td>${statusBadge(a.status)}</td>

            <td>

                <div class="row-actions">

                    <button
                        type="button"
                        class="icon-btn"
                        data-action="edit"
                        data-id="${esc(a.id)}"
                        aria-label="Edit appointment ${esc(a.id)}">

                        <i class="bi bi-pencil"></i>

                    </button>


                    <button
                        type="button"
                        class="icon-btn danger"
                        data-action="delete"
                        data-id="${esc(a.id)}"
                        aria-label="Delete appointment ${esc(a.id)}">

                        <i class="bi bi-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

    `,
    )
    .join("");

  // =================================
  // EMPTY STATE
  // =================================

  emptyState.classList.toggle("d-none", rows.length > 0);
}

// =================================
// SEARCH EVENT
// =================================

searchInput.addEventListener("input", () => {
  state.term = searchInput.value;

  render();
});

// =================================
// STATUS FILTER EVENT
// =================================

statusFilter.addEventListener("change", () => {
  state.status = statusFilter.value;

  render();
});

// =================================
// DATE FILTER EVENT
// =================================

dateFilter.addEventListener("change", () => {
  state.date = dateFilter.value;

  render();
});

// =================================
// STATUS CARD CLICK EVENT
// =================================

statusCards.addEventListener("click", (event) => {
  const card = event.target.closest("button[data-status]");

  if (!card) return;

  const value = card.dataset.status;

  state.status = state.status === value ? "" : value;

  syncControls();
  render();
});

// =================================
// ADD APPOINTMENT
// =================================

function openAdd(presetPatient = "", presetDoctor = "") {
  form.reset();

  form.classList.remove("was-validated");

  fillPatientDropdown();

  document.getElementById("appt-id").value = "";

  document.getElementById("appt-patient").value = presetPatient || "";

  document.getElementById("appt-doctor").value = presetDoctor || "";

  document.getElementById("appt-date").value = localISO(new Date());

  document.getElementById("appt-status").value = "Pending";

  document.getElementById("modal-title").textContent = "Add appointment";

  modal.show();
}

// Add button

document.getElementById("add-btn").addEventListener("click", () => {
  openAdd();
});

// =================================
// EDIT AND DELETE APPOINTMENTS
// =================================

tableBody.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action]");

  if (!btn) return;

  const appt = appointments.find((a) => a.id === btn.dataset.id);

  if (!appt) return;

  // =================================
  // EDIT APPOINTMENT
  // =================================

  if (btn.dataset.action === "edit") {
    form.classList.remove("was-validated");

    fillPatientDropdown();

    document.getElementById("appt-id").value = appt.id;

    document.getElementById("appt-patient").value = appt.patientId;

    document.getElementById("appt-doctor").value = appt.doctorId;

    document.getElementById("appt-date").value = appt.date;

    document.getElementById("appt-time").value = appt.time;

    document.getElementById("appt-status").value = appt.status;

    document.getElementById("modal-title").textContent =
      "Edit appointment " + appt.id;

    modal.show();
  }

  // =================================
  // DELETE APPOINTMENT
  // =================================

  if (btn.dataset.action === "delete") {
    if (confirm(`Delete appointment ${appt.id}? This cannot be undone.`)) {
      appointments = appointments.filter((a) => a.id !== appt.id);

      Store.set(KEYS.appointments, appointments);

      logActivity(`Appointment ${appt.id} deleted`);

      render();
    }
  }
});

// =================================
// SAVE APPOINTMENT
// ADD OR EDIT
// =================================

form.addEventListener("submit", (event) => {
  event.preventDefault();

  form.classList.add("was-validated");

  if (!form.checkValidity()) return;

  // Get form values

  const id = document.getElementById("appt-id").value;

  const data = {
    patientId: document.getElementById("appt-patient").value,

    doctorId: document.getElementById("appt-doctor").value,

    date: document.getElementById("appt-date").value,

    time: document.getElementById("appt-time").value,

    status: document.getElementById("appt-status").value,
  };

  // =================================
  // VALIDATE PATIENT AND DOCTOR
  // =================================

  const patientExists = getPatients().some((p) => p.id === data.patientId);

  const doctorExists = DOCTORS.some((d) => d.id === data.doctorId);

  if (!patientExists || !doctorExists) {
    alert("Please select a valid patient and doctor.");

    return;
  }

  // =================================
  // VALIDATE APPOINTMENT STATUS
  // =================================

  if (!APPOINTMENT_STATUSES.includes(data.status)) {
    alert("Please select a valid appointment status.");

    return;
  }

  // =================================
  // UPDATE EXISTING APPOINTMENT
  // =================================

  if (id) {
    const index = appointments.findIndex((a) => a.id === id);

    if (index === -1) {
      alert("Appointment could not be found.");

      return;
    }

    appointments[index] = {
      id: id,
      ...data,
    };

    logActivity(`Appointment ${id} updated (${data.status})`);
  }

  // =================================
  // ADD NEW APPOINTMENT
  // =================================
  else {
    const newId = nextId(appointments, "A");

    appointments.push({
      id: newId,

      ...data,
    });

    logActivity(
      `Appointment ${newId} booked for ${patientName(data.patientId)}`,
    );
  }

  // =================================
  // SAVE TO LOCAL STORAGE
  // =================================

  Store.set(KEYS.appointments, appointments);

  // Close modal and refresh table

  modal.hide();

  render();
});

// =================================
// INITIAL RENDER
// =================================

fillPatientDropdown();

syncControls();

render();

// =================================
// OPEN BOOKING FROM PATIENTS / DOCTORS
// =================================

// Example:
// appointments.html?book=1&patient=P001&doctor=D01

if (booking) {
  const presetPatient = Q.get("patient") || "";
  const presetDoctor = Q.get("doctor") || "";

  openAdd(presetPatient, presetDoctor);
}
