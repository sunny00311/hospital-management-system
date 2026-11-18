# Express.js Routes and Backend Specification

## 1. Purpose and scope

This document defines the Express.js backend route contract for the Hospital Management System.

The application uses:

- Node.js and Express.
- EJS server-side rendering (SSR).
- MySQL 8+ hosted by a cloud MySQL provider.
- `mysql2/promise` through one centralized connection pool.
- Vanilla browser JavaScript, with page-specific CSS and JavaScript kept inside each EJS page.
- Separate SQL files under `database/`.

This is an SSR application. Browser requests normally receive rendered HTML pages or redirect responses after form submissions. Do not introduce a separate JSON REST API unless a future requirement explicitly needs one.

**Implementation status:** These routes are the target contract. A route is not implemented merely because it is documented here.

## 2. Backend request architecture

All requests must follow this direction:

```text
Browser
  -> Express middleware
  -> Route
  -> Authentication / authorization middleware
  -> Controller
  -> Service (business rules and transactions)
  -> Repository (parameterized SQL)
  -> Central mysql2/promise pool
  -> Cloud MySQL
  -> Controller
  -> EJS view or redirect
```

Responsibilities:

| Layer | Responsibility | Must not do |
|---|---|---|
| Route | Declare URL, HTTP method, middleware, controller | Contain SQL or business workflows |
| Middleware | Authentication, authorization, CSRF, request validation helpers | Render database-driven business logic |
| Controller | Read request data, call service, choose view/redirect | Contain long SQL or transaction workflows |
| Service | Enforce business rules and coordinate transactions | Render EJS |
| Repository | Execute parameterized SQL and map database results | Read Express request/response objects |
| DB module | Export the shared MySQL pool | Create a new pool per request |
| EJS view | Render supplied data and forms | Query MySQL or implement business rules |

Use one controller per functional module and service/repository modules for data operations. Routes should remain thin.

## 3. Route conventions

- Use the `/login` and `/logout` endpoints for session authentication.
- Use plural, lowercase resource names: `/patients`, `/doctors`, `/appointments`.
- Use `:id` for resource identifiers. Validate that IDs are positive integers before querying.
- Use GET for pages and read-only operations.
- Use POST for HTML form submissions and state-changing actions. This avoids requiring method-override for native HTML forms.
- After a successful POST, use the Post/Redirect/Get (PRG) pattern: redirect to the resulting page and show a one-time success message.
- Do not mutate state through GET routes.
- Use query parameters only for validated filters, pagination, and sorting.
- Use a consistent error response strategy; do not expose SQL errors or stack traces.
- Route names and form field names must remain consistent with the physical schema once the schema is implemented.

### Common response behavior

| Situation | Expected behavior |
|---|---|
| Successful create | Redirect to the created resource or list page with a success flash message |
| Successful update | Redirect to the resource detail page |
| Successful state transition | Redirect to the relevant list/detail page |
| Invalid form input | Re-render the form with validation errors and safe submitted values |
| Unauthenticated request | Redirect to `/login` |
| Authenticated but unauthorized | Render a 403 page |
| Missing resource | Render a 404 page |
| Duplicate or business-rule conflict | Re-render with a useful conflict message or return 409 for future JSON clients |
| Unexpected server/database failure | Log a sanitized server-side error and render a generic 500 page |

## 4. Route inventory

Authentication and authorization are required before exposing patient, clinical, or financial information. The role names below are a proposed initial policy; adjust them to the actual users and schema during implementation.

### 4.1 Authentication

| Method | Path | Middleware | Controller action | Description |
|---|---|---|---|---|
| GET | `/login` | guestOnly | auth.showLogin | Render login page |
| POST | `/login` | guestOnly, csrf, validateLogin | auth.login | Verify credentials and create session |
| POST | `/logout` | requireAuth, csrf | auth.logout | Destroy session and clear cookie |

Rules:

- Store password hashes, never plaintext passwords.
- Use a password hashing library such as bcrypt or Argon2; do not implement password hashing manually.
- Regenerate the session ID after successful login.
- Configure secure, HTTP-only, same-site session cookies. Set `secure` in production behind correctly configured HTTPS.
- Do not reveal whether a username or password was incorrect.
- Apply login rate limiting.
- Protect all state-changing forms with CSRF tokens.
- Do not allow GET logout.

### 4.2 Dashboard

| Method | Path | Middleware | Controller action | Description |
|---|---|---|---|---|
| GET | `/` | requireAuth | dashboard.index | Redirect to `/dashboard` |
| GET | `/dashboard` | requireAuth, authorizeDashboard | dashboard.index | Render dashboard KPIs and operational panels |

Dashboard data must be queried from MySQL. It includes the documented KPIs:

- Total registered patients.
- Today's appointments and completed appointments.
- Appointments awaiting action.
- Revenue collected for the selected period.
- Outstanding bill balance.
- Today's appointment list, appointment status counts, doctor workload, department totals, low-stock alerts, and recent payments.

Optional validated query filters: `from`, `to`, `department_id`, `doctor_id`, and `status`. Use the same date-range convention as reporting: inclusive start and exclusive end.

### 4.3 Patients

| Method | Path | Middleware | Controller action | Description |
|---|---|---|---|---|
| GET | `/patients` | requireAuth, authorizePatientsRead | patients.index | Search and list patients |
| GET | `/patients/new` | requireAuth, authorizePatientsWrite | patients.createForm | Render registration form |
| POST | `/patients` | requireAuth, authorizePatientsWrite, csrf, validatePatient | patients.create | Register patient |
| GET | `/patients/:id` | requireAuth, authorizePatientsRead, validateId | patients.show | Patient profile and permitted history |
| GET | `/patients/:id/edit` | requireAuth, authorizePatientsWrite, validateId | patients.editForm | Render edit form |
| POST | `/patients/:id/update` | requireAuth, authorizePatientsWrite, csrf, validateId, validatePatient | patients.update | Update patient details |

List filters: `q` (name, phone, or patient identifier), `from`, `to`, `page`, and `limit`.

Patient profile may show appointment and billing history only when the logged-in user's role permits access. Do not include clinical notes in general patient search results.

Do not provide a hard-delete route for patients. Preserve linked medical and financial history. If deactivation is later required, implement an explicit status transition and document its schema field.

### 4.4 Departments and doctors

Departments are maintained as reference/master data. The project specification requires department and doctor management; department write operations may be restricted to administrators.

| Method | Path | Middleware | Controller action | Description |
|---|---|---|---|---|
| GET | `/departments` | requireAuth | departments.index | List departments |
| GET | `/departments/new` | requireAuth, authorizeAdmin | departments.createForm | Render department form |
| POST | `/departments` | requireAuth, authorizeAdmin, csrf, validateDepartment | departments.create | Create department |
| GET | `/doctors` | requireAuth | doctors.index | Search and list doctors |
| GET | `/doctors/new` | requireAuth, authorizeDoctorWrite | doctors.createForm | Render doctor form |
| POST | `/doctors` | requireAuth, authorizeDoctorWrite, csrf, validateDoctor | doctors.create | Create doctor |
| GET | `/doctors/:id` | requireAuth, validateId | doctors.show | Doctor details and workload summary |
| GET | `/doctors/:id/edit` | requireAuth, authorizeDoctorWrite, validateId | doctors.editForm | Render edit form |
| POST | `/doctors/:id/update` | requireAuth, authorizeDoctorWrite, csrf, validateId, validateDoctor | doctors.update | Update doctor |
| POST | `/doctors/:id/status` | requireAuth, authorizeDoctorWrite, csrf, validateId | doctors.updateStatus | Activate/deactivate doctor |

Doctor filters: `q`, `department_id`, `status`, `page`, and `limit`.

Validate that a selected department exists and is active. Consultation fees must be non-negative decimal values. Use a status transition instead of deleting a doctor referenced by appointments.

### 4.5 Appointments

| Method | Path | Middleware | Controller action | Description |
|---|---|---|---|---|
| GET | `/appointments` | requireAuth, authorizeAppointmentsRead | appointments.index | List and filter appointments |
| GET | `/appointments/new` | requireAuth, authorizeAppointmentsWrite | appointments.createForm | Render booking form |
| POST | `/appointments` | requireAuth, authorizeAppointmentsWrite, csrf, validateAppointment | appointments.create | Book appointment |
| GET | `/appointments/:id` | requireAuth, authorizeAppointmentsRead, validateId | appointments.show | Appointment details |
| POST | `/appointments/:id/status` | requireAuth, authorizeAppointmentsWrite, csrf, validateId, validateAppointmentStatus | appointments.updateStatus | Complete, cancel, or mark no-show |

List filters: `from`, `to`, `patient_id`, `doctor_id`, `department_id`, `status`, `page`, and `limit`.

Allowed statuses from the project specification: `Scheduled`, `Completed`, `Cancelled`, and `No-show`. Enforce allowed transitions in the service layer.

Booking workflow requirements:

1. Validate patient, doctor, date/time, and any required duration.
2. Confirm patient and doctor exist and are eligible for booking.
3. Prevent duplicate or overlapping doctor bookings.
4. Perform conflict checking and insertion transactionally. Use an appropriate locking strategy for the selected MySQL schema; a simple pre-check followed by an insert is not sufficient under concurrency.
5. Handle duplicate-key or scheduling conflicts as a user-facing booking conflict.
6. Commit only after all booking checks and writes succeed.

The current logical ERD notes that a unique doctor/start-time key does not prevent overlapping appointment durations. Implement duration-aware conflict handling when the physical schema supports appointment duration.

Do not expose an endpoint that lets a browser execute arbitrary SQL or call a stored procedure by name.

### 4.6 Medical records

Clinical data must have stricter authorization than general patient demographic data.

| Method | Path | Middleware | Controller action | Description |
|---|---|---|---|---|
| GET | `/appointments/:appointmentId/medical-record` | requireAuth, authorizeClinicalRead, validateId | medicalRecords.showForAppointment | View the record for an appointment |
| GET | `/appointments/:appointmentId/medical-record/new` | requireAuth, authorizeClinicalWrite, validateId | medicalRecords.createForm | Render record form |
| POST | `/appointments/:appointmentId/medical-record` | requireAuth, authorizeClinicalWrite, csrf, validateId, validateMedicalRecord | medicalRecords.create | Create diagnosis/treatment record |
| GET | `/medical-records/:id` | requireAuth, authorizeClinicalRead, validateId | medicalRecords.show | View a medical record |
| GET | `/medical-records/:id/edit` | requireAuth, authorizeClinicalWrite, validateId | medicalRecords.editForm | Render record edit form |
| POST | `/medical-records/:id/update` | requireAuth, authorizeClinicalWrite, csrf, validateId, validateMedicalRecord | medicalRecords.update | Update a record when policy permits |

The database design currently models an optional one-to-one relationship between appointments and medical records using a unique appointment foreign key. Enforce that relationship in the database and service layer.

Do not expose clinical notes in dashboard summaries, general search, CSV exports, or logs. Record access should be restricted and auditable in a production-oriented implementation.

### 4.7 Prescriptions and medicines

| Method | Path | Middleware | Controller action | Description |
|---|---|---|---|---|
| GET | `/medical-records/:recordId/prescriptions/new` | requireAuth, authorizePrescriptionWrite, validateId | prescriptions.createForm | Render prescription form |
| POST | `/medical-records/:recordId/prescriptions` | requireAuth, authorizePrescriptionWrite, csrf, validateId, validatePrescription | prescriptions.create | Create prescription and line items |
| GET | `/prescriptions/:id` | requireAuth, authorizeClinicalRead, validateId | prescriptions.show | View prescription |
| GET | `/medicines` | requireAuth, authorizeInventoryRead | medicines.index | Search medicine catalogue and stock |
| GET | `/medicines/new` | requireAuth, authorizeInventoryWrite | medicines.createForm | Render medicine form |
| POST | `/medicines` | requireAuth, authorizeInventoryWrite, csrf, validateMedicine | medicines.create | Add medicine |
| GET | `/medicines/:id/edit` | requireAuth, authorizeInventoryWrite, validateId | medicines.editForm | Render medicine edit form |
| POST | `/medicines/:id/update` | requireAuth, authorizeInventoryWrite, csrf, validateId, validateMedicine | medicines.update | Update medicine catalogue data |
| POST | `/medicines/:id/stock-adjustment` | requireAuth, authorizeInventoryWrite, csrf, validateId, validateStockAdjustment | medicines.adjustStock | Record an authorized stock adjustment |

Prescription creation must validate each medicine, dosage, frequency, duration, and quantity. Persist the prescription header and all line items atomically.

Stock deduction/dispensing must occur in a transaction using row locking (for example, `SELECT ... FOR UPDATE`), validate available quantity, and prevent negative stock. Do not silently decrement stock when merely rendering a prescription form.

The exact dispensing workflow and stock movement schema must be finalized alongside the physical database schema. Do not invent a stock ledger table without updating the ERD and SQL design.

### 4.8 Billing and payments

| Method | Path | Middleware | Controller action | Description |
|---|---|---|---|---|
| GET | `/billing` | requireAuth, authorizeBillingRead | billing.index | Billing overview and filters |
| GET | `/bills/new` | requireAuth, authorizeBillingWrite | bills.createForm | Render bill form |
| POST | `/bills` | requireAuth, authorizeBillingWrite, csrf, validateBill | bills.create | Generate bill and line items |
| GET | `/bills/:id` | requireAuth, authorizeBillingRead, validateId | bills.show | Bill details, totals, and payment history |
| GET | `/bills/:id/edit` | requireAuth, authorizeBillingWrite, validateId | bills.editForm | Render editable bill form where allowed |
| POST | `/bills/:id/update` | requireAuth, authorizeBillingWrite, csrf, validateId, validateBill | bills.update | Update bill before payment/finalization, subject to policy |
| POST | `/bills/:id/payments` | requireAuth, authorizePaymentWrite, csrf, validateId, validatePayment | payments.create | Record a full or partial payment |
| GET | `/payments` | requireAuth, authorizeBillingRead | payments.index | Payment history and filters |
| GET | `/payments/:id` | requireAuth, authorizeBillingRead, validateId | payments.show | Payment details/receipt |

Billing rules:

- Store bill headers, bill items, and payments separately as specified by the ERD.
- Snapshot the charged unit price in each bill item. Do not recalculate historical bills from the current medicine or service catalogue price.
- Use `DECIMAL` for all monetary values.
- Calculate bill totals and outstanding balances from trusted database values, not client-submitted totals.
- Support multiple partial payments.
- Reject zero/negative payments and overpayments.
- Prevent concurrent payment requests from overpaying a bill. Lock the bill row or use an equivalent transaction-safe strategy, calculate the current balance inside the transaction, insert the payment, and update/derive bill status consistently.
- Preserve payment history. Do not provide a hard-delete payment endpoint.
- Any bill-editing policy after payment must be explicit; do not silently rewrite a paid financial record.

### 4.9 Reports and exports

| Method | Path | Middleware | Controller action | Description |
|---|---|---|---|---|
| GET | `/reports` | requireAuth, authorizeReportsRead | reports.index | Render report catalogue/summary |
| GET | `/reports/patients` | requireAuth, authorizeReportsRead | reports.patients | Patient register |
| GET | `/reports/appointments` | requireAuth, authorizeReportsRead | reports.appointments | Daily/period appointment report |
| GET | `/reports/doctors` | requireAuth, authorizeReportsRead | reports.doctorWorkload | Doctor workload |
| GET | `/reports/departments` | requireAuth, authorizeReportsRead | reports.departments | Department summary |
| GET | `/reports/revenue` | requireAuth, authorizeFinancialReports | reports.revenue | Monthly/period revenue |
| GET | `/reports/outstanding-bills` | requireAuth, authorizeFinancialReports | reports.outstandingBills | Outstanding balances |
| GET | `/reports/payments` | requireAuth, authorizeFinancialReports | reports.payments | Payment history |
| GET | `/reports/medicine-stock` | requireAuth, authorizeInventoryRead | reports.medicineStock | Medicine stock and low-stock alerts |
| GET | `/reports/prescriptions` | requireAuth, authorizeClinicalReports | reports.prescriptions | Prescription summary, limited to authorized users |
| GET | `/reports/:reportKey/export.csv` | requireAuth, authorizeReportExport | reports.exportCsv | Export an allowlisted report as CSV |

All report SQL belongs in `database/queries/reports/`. Use parameterized values and strict allowlists for report keys, sort columns, and sort direction. Never accept SQL text, table names, or a SQL file path from the request.

Common filters: `from`, `to`, `department_id`, `doctor_id`, `status`, `payment_method`, `page`, and `limit`, as appropriate for each report.

Reporting requirements:

- Use half-open date ranges: `timestamp >= from` and `timestamp < to`.
- Validate date formats, date ordering, maximum range, IDs, pagination, and allowed sort values server-side.
- Bound large reports with pagination or date filters.
- CSV export must use the same validated filters as the visible report.
- Escape CSV fields beginning with `=`, `+`, `-`, or `@` to mitigate spreadsheet formula injection.
- Do not export clinical notes or unnecessary sensitive patient information.
- PDF export is optional and should be added only when a server-side PDF requirement is approved.

## 5. Suggested route and source structure

Keep the route files grouped by business module:

```text
src/
├── app.js
├── config/
│   └── db.js
├── routes/
│   ├── index.routes.js
│   ├── auth.routes.js
│   ├── dashboard.routes.js
│   ├── patients.routes.js
│   ├── departments.routes.js
│   ├── doctors.routes.js
│   ├── appointments.routes.js
│   ├── medical-records.routes.js
│   ├── prescriptions.routes.js
│   ├── medicines.routes.js
│   ├── billing.routes.js
│   ├── bills.routes.js
│   ├── payments.routes.js
│   └── reports.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── dashboard.controller.js
│   ├── patients.controller.js
│   ├── departments.controller.js
│   ├── doctors.controller.js
│   ├── appointments.controller.js
│   ├── medical-records.controller.js
│   ├── prescriptions.controller.js
│   ├── medicines.controller.js
│   ├── bills.controller.js
│   ├── payments.controller.js
│   └── reports.controller.js
├── services/
├── repositories/
├── middleware/
│   ├── require-auth.js
│   ├── authorize.js
│   ├── csrf.js
│   ├── validate-request.js
│   └── error-handler.js
└── utils/
    ├── async-handler.js
    └── pagination.js
```

The structure is a recommendation for implementation. Keep names consistent if the actual source tree adopts a different naming convention.

## 6. Route mounting example

Mount routers centrally in `src/app.js`. This example shows composition only; it does not imply that the handlers or middleware already exist.

```js
const express = require('express');

const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const patientRoutes = require('./routes/patients.routes');
const departmentRoutes = require('./routes/departments.routes');
const doctorRoutes = require('./routes/doctors.routes');
const appointmentRoutes = require('./routes/appointments.routes');
const medicalRecordRoutes = require('./routes/medical-records.routes');
const prescriptionRoutes = require('./routes/prescriptions.routes');
const medicineRoutes = require('./routes/medicines.routes');
const billingRoutes = require('./routes/billing.routes');
const billRoutes = require('./routes/bills.routes');
const paymentRoutes = require('./routes/payments.routes');
const reportRoutes = require('./routes/reports.routes');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/patients', patientRoutes);
app.use('/departments', departmentRoutes);
app.use('/doctors', doctorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/', medicalRecordRoutes);
app.use('/', prescriptionRoutes);
app.use('/medicines', medicineRoutes);
app.use('/', billingRoutes);
app.use('/bills', billRoutes);
app.use('/payments', paymentRoutes);
app.use('/reports', reportRoutes);

// Register not-found and centralized error middleware after all routes.

module.exports = app;
```

Configure session middleware, CSRF middleware, security headers, request parsing, and static assets before protected routes. Configure the centralized error handler last. The actual order must ensure session parsing runs before authentication and CSRF checks.

## 7. Middleware contract

| Middleware | Contract |
|---|---|
| `requireAuth` | Require an authenticated session; redirect to login otherwise |
| `guestOnly` | Redirect authenticated users away from login |
| `authorize...` | Check permission for the requested module/action; deny by default |
| `csrf` | Validate CSRF token for every state-changing browser form |
| `validateId` | Validate route IDs as positive integers |
| `validate...` | Validate and normalize form/query input before controller execution |
| `asyncHandler` | Forward rejected async controller promises to the error handler |
| `errorHandler` | Map known validation, not-found, conflict, and unexpected errors to safe responses |

Do not rely on hiding buttons in EJS as authorization. Enforce permissions on the server for every protected route.

### Suggested initial role policy

The project specification requires role-based access but does not prescribe exact role names. The following is a starting policy to review before implementation:

| Capability | Admin | Receptionist | Doctor | Pharmacist | Accountant |
|---|---:|---:|---:|---:|---:|
| Dashboard | Yes | Limited | Limited | Limited | Limited |
| Patient demographics | Yes | Yes | Assigned/authorized patients | No by default | Billing-required fields only |
| Departments/doctors | Manage | Read | Read | Read | Read |
| Appointment booking/status | Yes | Yes | Assigned appointments | No | Read |
| Medical records | Yes, audited | No | Authorized clinical records | Prescription data as needed | No |
| Prescriptions | Yes, audited | No | Create/read authorized | Read/dispense as authorized | No |
| Medicine inventory | Yes | No | Read as needed | Manage | No |
| Bills/payments | Yes | Create/view as assigned | Read only if required | No | Manage |
| Financial reports | Yes | No | No | No | Yes |
| Clinical reports | Authorized only | No | Authorized only | Limited | No |

This table is a proposed access policy, not a claim that these roles or permissions already exist in the database. Implement permissions using explicit server-side checks, not role-name comparisons scattered across controllers.

## 8. Validation and security requirements

### Request validation

- Validate all body, path, and query input on the server.
- Normalize whitespace and validate maximum string lengths.
- Validate phone/email formats according to the selected schema rules.
- Validate date/time values and reject invalid or ambiguous values.
- Validate enum/status values against server-side allowlists.
- Validate foreign-key IDs by checking referenced records.
- Validate numeric values and ranges; use decimal-safe handling for money.
- Allowlist pagination limits and sorting columns.
- Never trust hidden form fields for ownership, role, price, total, payment status, or stock balance.

### SQL and database access

- Use the centralized pool exported by `src/config/db.js`.
- Use `pool.execute(sql, values)` or repository methods with bound parameters.
- Keep SQL statements in separate `.sql` files under the documented `database/` hierarchy.
- Do not concatenate user input into SQL.
- Do not let the browser choose a SQL file or stored procedure.
- For transactions, acquire one connection from the pool and run every statement on that connection; commit/rollback and release in `finally`.
- Do not run schema or seed scripts during normal application startup.

### Sessions and browser security

- Use a persistent production session store; do not use Express MemoryStore in production.
- Set HTTP-only, same-site cookies and secure cookies over HTTPS.
- Regenerate session IDs on login and destroy sessions on logout.
- Use CSRF protection for POST routes.
- Use Helmet or equivalent secure HTTP headers.
- Apply rate limits to login and other abuse-prone endpoints.
- Use EJS escaped output (`<%=`) for user-controlled content. Avoid unescaped output (`<%-`) unless rendering trusted, reviewed template partials.
- Do not expose stack traces, raw database errors, credentials, or internal file paths to clients.

### Privacy and auditability

- Restrict clinical and financial routes by role and, where applicable, record-level access.
- Do not put patient diagnosis, treatment notes, passwords, or session tokens in application logs.
- Log security-relevant events without unnecessary patient data.
- Preserve medical and financial history; do not add destructive delete routes for referenced records.

## 9. EJS view mapping

Suggested view mapping; adapt to the actual view tree while keeping each page's CSS and browser JavaScript internal to that EJS page.

```text
views/
├── layouts/                 # Optional shared layout
├── partials/                # Shared navigation, messages, footer
├── auth/
│   └── login.ejs
├── dashboard/
│   └── index.ejs
├── patients/
│   ├── index.ejs
│   ├── form.ejs
│   └── show.ejs
├── departments/
│   ├── index.ejs
│   └── form.ejs
├── doctors/
│   ├── index.ejs
│   ├── form.ejs
│   └── show.ejs
├── appointments/
│   ├── index.ejs
│   ├── form.ejs
│   └── show.ejs
├── medical-records/
│   ├── form.ejs
│   └── show.ejs
├── prescriptions/
│   ├── form.ejs
│   └── show.ejs
├── medicines/
│   ├── index.ejs
│   └── form.ejs
├── billing/
│   └── index.ejs
├── bills/
│   ├── form.ejs
│   └── show.ejs
├── payments/
│   ├── index.ejs
│   └── show.ejs
├── reports/
│   ├── index.ejs
│   └── *.ejs
└── errors/
    ├── 403.ejs
    ├── 404.ejs
    └── 500.ejs
```

Each EJS page must contain its page-specific internal `<style>` and `<script>` blocks. Shared markup partials are allowed. Do not move page styling or page behavior into external CSS/JS files.

## 10. Error handling and status mapping

Use a centralized error handler and typed application errors. Suggested mappings:

| Error category | HTTP status | SSR behavior |
|---|---:|---|
| Validation error | 400 | Re-render form with field errors |
| Unauthenticated | 302 | Redirect to login |
| Forbidden | 403 | Render forbidden page |
| Not found | 404 | Render not-found page |
| Duplicate/conflict | 409 | Re-render with conflict message |
| Unexpected error | 500 | Render generic error page |

For form validation errors, preserve only safe input values. Never echo passwords, CSRF tokens, or sensitive clinical content into a generic error page.

## 11. Implementation and verification checklist

Implement in this order:

1. Create the Express app, environment configuration, and centralized MySQL pool.
2. Add session, authentication, CSRF, security headers, and error middleware.
3. Implement login/logout and role/permission checks.
4. Implement patient and department/doctor routes.
5. Implement appointment booking with transaction-safe conflict handling.
6. Implement medical records and prescriptions with clinical access restrictions.
7. Implement inventory and transactional stock adjustment/dispensing.
8. Implement bills, line items, and transaction-safe partial payments.
9. Implement dashboard queries and report routes.
10. Implement validated CSV export.
11. Add route, service, and repository tests against the target MySQL version.
12. Update this file and the ERD whenever routes, permissions, or data workflows change.

Verification requirements:

- Unauthenticated users cannot access protected routes.
- A user without permission receives 403 even when directly requesting a URL.
- POST routes reject missing/invalid CSRF tokens.
- Invalid IDs and query filters are rejected safely.
- Every mutation uses server-side validation and parameterized SQL.
- Appointment conflicts are safe under concurrent booking attempts.
- Payment logic prevents overpayment under concurrent requests.
- Failed multi-step operations roll back completely.
- EJS escapes untrusted values.
- Reports and CSV exports enforce permissions and validated filters.
- No route executes arbitrary SQL or accepts a client-selected SQL filename.

## 12. Related project documentation

Keep this route contract consistent with:

- `AGENTS.md` — mandatory implementation and security rules.
- `docs/PROJECT_SPEC.md` — functional scope and acceptance criteria.
- `docs/ARCHITECTURE.md` — request flow, folder structure, and DB module.
- `docs/DATABASE_DESIGN.md` — entities, relationships, and ERD.
- `docs/SQL_CONVENTIONS.md` — SQL file layout and parameterization.
- `docs/REPORTING.md` — dashboard metrics, report filters, and exports.
- `docs/DEVELOPMENT_RULES.md` — implementation order and testing.

If the physical schema or implemented behavior differs from this specification, update the relevant documentation rather than silently allowing the documents to drift.
