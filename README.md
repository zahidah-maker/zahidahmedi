MediTrack HIMS

Hospital Information Management System

MediTrack HIMS is a web-based Hospital Information Management System developed as an academic project for IMS566. This system demonstrates basic hospital management processes through a simple and user-friendly interface.

1. Project Overview

MediTrack HIMS provides a centralized interface for managing basic hospital information, including patients, doctors, and appointments.

The system is developed using HTML, CSS, JavaScript, Bootstrap, and browser storage.

2. Demo Login

Use the following credentials to access the system:

Field| Details
Username| "admin"
Password| "123456"

Note: This is a demonstration login for academic purposes only.

3. System Modules

The system consists of the following modules:

- Dashboard – Displays an overview of hospital information and summary statistics.
- Patients – Allows users to view, search, add, edit, and delete patient records.
- Doctors – Displays doctor information and related details.
- Appointments – Allows users to manage appointments, including adding, editing, deleting, searching, and filtering records.

4. Main Features

- User login and logout.
- Dashboard with summary information and charts.
- Patient record management.
- Doctor information display.
- Appointment management.
- Search and filter functions.
- Status indicators for records and appointments.
- Activity log to display recent system activities.
- Navigation links between related records.
- Responsive interface for different screen sizes.
- Data storage using browser "localStorage" and "sessionStorage".
- Reset demo data functionality.
- Dark mode theme support.

5. Recent Improvements and Fixes

The following improvements and corrections have been made during system development:

1. Patients Page Structure
   - Corrected the HTML layout to match the shared application structure.
   - Added the required sidebar, topbar, main content area, and footer elements.

2. Patients Empty State
   - Improved the empty-state display when no patient records are available.
   - Synchronized the "hidden" attribute and Bootstrap "d-none" class.

3. Shared Application Functions
   - Organized common functions in "app.js".
   - Improved shared navigation, layout generation, storage functions, and activity logging.

4. Appointments Module
   - Improved appointment management functionality.
   - Connected appointment records with patient and doctor information.

5. Code Organization
   - Organized the HTML, CSS, and JavaScript files within the project repository.
   - Improved file references and navigation between pages.

6. Login and Theme
   - Added staff login functionality using demonstration credentials.
   - Added password visibility control.
   - Added dark mode support for the login interface.

7. Technologies Used

Technology| Purpose
HTML5| Structures the web pages
CSS3| Styles the system interface
JavaScript| Handles system functionality
Bootstrap 5| Provides responsive layouts and components
Bootstrap Icons| Displays interface icons
Chart.js| Creates dashboard charts
LocalStorage| Stores demo records in the browser
SessionStorage| Maintains the demo login session

7. Data Storage

MediTrack HIMS uses browser storage to manage demonstration data.

- localStorage – Stores patient records, appointment records, and activity logs.
- sessionStorage – Stores the current login session and username.

The data is stored locally in the user's browser and is not connected to an online database.

8. Project Folder Structure

The project files are stored directly in the main repository directory.

MediTrack-HIMS/
│
├── README.md
│
├── index.html
├── dashboard.html
├── patients.html
├── doctors.html
├── appointments.html
│
├── style.css
├── app.css
│
├── auth.js
├── app.js
├── data.js
├── theme.js
├── dashboard.js
├── patients.js
├── doctors.js
└── appointments.js

9. How to Run the System

Local Development

1. Download or clone the MediTrack HIMS project.
2. Open the project folder in Visual Studio Code.
3. Make sure all HTML, CSS, and JavaScript files are available in the project folder.
4. Open "index.html".
5. Run "index.html" using the Live Server extension.
6. Enter the demo login credentials:
   - Username: "admin"
   - Password: "123456"
7. Explore the available system modules.

GitHub Pages

The system can also be accessed through GitHub Pages for demonstration purposes.

The deployed website is available at:

"https://zahidah-maker.github.io/zahidahmedi/"

10. System Limitations

- This system is developed for academic demonstration purposes.
- No real patient information should be entered.
- The system does not use a backend server or online database.
- Data is stored locally in the browser.
- Login authentication is for demonstration purposes only.
- Data is not synchronized between different devices or browsers.
- The system is not intended for actual hospital or clinical use.

11. Deployment

MediTrack HIMS is deployed using GitHub Pages for academic demonstration purposes.

Since the system uses browser-based storage, each user's browser maintains its own local demonstration data.

The system does not require a backend server or external database to run the demonstration features.

---

Developed for IMS566 – Academic Project

MediTrack HIMS | Hospital Information Management System
