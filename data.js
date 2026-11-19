// =================================
// MEDITrack HIMS - SAMPLE DATA
// All names are fictional (demo only).
// =================================

// Format a Date as YYYY-MM-DD using local time
function localISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Date relative to today, so the dashboard always has "today" data
function dateOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return localISO(d);
}

const DEPARTMENTS = [
    "Cardiology", "Pediatrics", "Orthopedics",
    "Neurology", "Dermatology", "General Medicine"
];

const APPOINTMENT_STATUSES = ["Confirmed", "Pending", "Completed", "Cancelled"];

// One colour per status, used by every chart and badge
const STATUS_COLORS = {
    Confirmed: "#087f8c",
    Pending:   "#e8a317",
    Completed: "#2e9e66",
    Cancelled: "#d9534f"
};

const DOCTORS = [
    { id: "D01", name: "Dr. Sarah Lim",    department: "Cardiology" },
    { id: "D02", name: "Dr. Amir Hakim",   department: "Pediatrics" },
    { id: "D03", name: "Dr. Lisa Tan",     department: "Orthopedics" },
    { id: "D04", name: "Dr. Kumar Raj",    department: "Neurology" },
    { id: "D05", name: "Dr. Nur Aisyah",   department: "Dermatology" },
    { id: "D06", name: "Dr. Daniel Wong",  department: "General Medicine" },
    { id: "D07", name: "Dr. Farah Ismail", department: "Cardiology" },
    { id: "D08", name: "Dr. Joseph Lee",   department: "Pediatrics" }
];

const SEED_PATIENTS = [
    { id: "P001", name: "Ahmad Faiz",      gender: "Male",   age: 35, department: "Cardiology" },
    { id: "P002", name: "Aina Sofea",      gender: "Female", age: 24, department: "Pediatrics" },
    { id: "P003", name: "Daniel Chong",    gender: "Male",   age: 42, department: "Orthopedics" },
    { id: "P004", name: "Siti Nurhaliza",  gender: "Female", age: 51, department: "Neurology" },
    { id: "P005", name: "Ravi Chandran",   gender: "Male",   age: 29, department: "General Medicine" },
    { id: "P006", name: "Mei Ling Tan",    gender: "Female", age: 8,  department: "Pediatrics" },
    { id: "P007", name: "Hafiz Rahman",    gender: "Male",   age: 63, department: "Cardiology" },
    { id: "P008", name: "Nadia Karim",     gender: "Female", age: 33, department: "Dermatology" },
    { id: "P009", name: "Jason Lim",       gender: "Male",   age: 47, department: "Orthopedics" },
    { id: "P010", name: "Priya Nair",      gender: "Female", age: 38, department: "General Medicine" },
    { id: "P011", name: "Zulkifli Ahmad",  gender: "Male",   age: 70, department: "Neurology" },
    { id: "P012", name: "Elyana Hassan",   gender: "Female", age: 19, department: "Dermatology" },
    { id: "P013", name: "Hannah Yusuf",    gender: "Female", age: 27, department: "Cardiology" },
    { id: "P014", name: "Marcus Lee",      gender: "Male",   age: 55, department: "General Medicine" },
    { id: "P015", name: "Sarah Abdullah",  gender: "Female", age: 12, department: "Pediatrics" },
    { id: "P016", name: "Ibrahim Salleh",  gender: "Male",   age: 66, department: "Orthopedics" }
];

const SEED_APPOINTMENTS = [
    { id: "A001", patientId: "P001", doctorId: "D01", date: dateOffset(0),  time: "09:00", status: "Confirmed" },
    { id: "A002", patientId: "P002", doctorId: "D02", date: dateOffset(0),  time: "10:30", status: "Pending" },
    { id: "A003", patientId: "P003", doctorId: "D03", date: dateOffset(0),  time: "11:15", status: "Confirmed" },
    { id: "A004", patientId: "P004", doctorId: "D04", date: dateOffset(1),  time: "09:45", status: "Pending" },
    { id: "A005", patientId: "P005", doctorId: "D06", date: dateOffset(1),  time: "14:00", status: "Confirmed" },
    { id: "A006", patientId: "P006", doctorId: "D08", date: dateOffset(2),  time: "10:00", status: "Pending" },
    { id: "A007", patientId: "P007", doctorId: "D07", date: dateOffset(-1), time: "08:30", status: "Completed" },
    { id: "A008", patientId: "P008", doctorId: "D05", date: dateOffset(-1), time: "13:30", status: "Completed" },
    { id: "A009", patientId: "P009", doctorId: "D03", date: dateOffset(-2), time: "15:00", status: "Completed" },
    { id: "A010", patientId: "P010", doctorId: "D06", date: dateOffset(-3), time: "09:15", status: "Cancelled" },
    { id: "A011", patientId: "P011", doctorId: "D04", date: dateOffset(3),  time: "11:00", status: "Confirmed" },
    { id: "A012", patientId: "P012", doctorId: "D05", date: dateOffset(4),  time: "16:00", status: "Pending" },
    { id: "A013", patientId: "P013", doctorId: "D07", date: dateOffset(0),  time: "14:30", status: "Confirmed" },
    { id: "A014", patientId: "P014", doctorId: "D06", date: dateOffset(-2), time: "10:45", status: "Completed" },
    { id: "A015", patientId: "P015", doctorId: "D08", date: dateOffset(-4), time: "09:00", status: "Completed" },
    { id: "A016", patientId: "P016", doctorId: "D03", date: dateOffset(5),  time: "10:15", status: "Confirmed" },
    { id: "A017", patientId: "P001", doctorId: "D01", date: dateOffset(-5), time: "11:00", status: "Completed" },
    { id: "A018", patientId: "P007", doctorId: "D07", date: dateOffset(-6), time: "09:30", status: "Completed" },
    { id: "A019", patientId: "P004", doctorId: "D04", date: dateOffset(-4), time: "14:15", status: "Cancelled" },
    { id: "A020", patientId: "P002", doctorId: "D02", date: dateOffset(6),  time: "15:30", status: "Pending" },
    { id: "A021", patientId: "P009", doctorId: "D03", date: dateOffset(2),  time: "13:45", status: "Confirmed" },
    { id: "A022", patientId: "P011", doctorId: "D04", date: dateOffset(-1), time: "10:00", status: "Completed" },
    { id: "A023", patientId: "P010", doctorId: "D06", date: dateOffset(1),  time: "11:30", status: "Confirmed" },
    { id: "A024", patientId: "P012", doctorId: "D05", date: dateOffset(-3), time: "14:45", status: "Completed" },
    { id: "A025", patientId: "P016", doctorId: "D03", date: dateOffset(-7), time: "09:00", status: "Completed" },
    { id: "A026", patientId: "P013", doctorId: "D01", date: dateOffset(7),  time: "10:00", status: "Pending" }
];

const SEED_ACTIVITIES = [
    { text: "Appointment A007 marked as Completed",       time: "Yesterday" },
    { text: "New patient P016 registered",                time: "2 days ago" },
    { text: "Appointment A010 cancelled by patient",      time: "3 days ago" },
    { text: "Dr. Lisa Tan updated Orthopedics schedule",  time: "4 days ago" }
];

// Patient visits per month: this year (null = not yet happened) and last year
const MONTHLY_VISITS = {
    labels:   ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    thisYear: [180, 165, 210, 195, 230, 245, 220, 260, 240, 275, 150, null],
    lastYear: [150, 140, 175, 170, 190, 205, 195, 215, 210, 230, 225, 240]
};

// Age bands used by the dashboard chart and the Patients filter
const AGE_GROUPS = ["0-17", "18-35", "36-55", "56+"];
function ageGroup(age) {
    return age <= 17 ? "0-17" : age <= 35 ? "18-35" : age <= 55 ? "36-55" : "56+";
}
