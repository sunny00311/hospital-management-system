# Project specification

## Objective

Build a lightweight Hospital Management System that demonstrates practical DBMS concepts through a relational MySQL database and a minimal SSR web interface. The academic emphasis is on schema design, normalization, SQL, integrity, transactions, and reporting rather than frontend complexity.

## Functional modules

### Patients
- Register, update, search, and view patient details.
- View appointment and billing history.

### Departments and doctors
- Maintain departments and doctors.
- Associate each doctor with one department.
- Store specialization, contact details, consultation fee, and active status.

### Appointments
- Book appointments for patients with doctors.
- Track Scheduled, Completed, Cancelled, and No-show states.
- Prevent duplicate doctor slots at the database level.
- Search by patient, doctor, date, and status.

### Medical records
- Store diagnosis, treatment, notes, and record timestamp for an appointment.
- Restrict access to clinical data by role in a production implementation.

### Prescriptions and medicines
- Store prescription headers against medical records.
- Model prescription-to-medicine as many-to-many using prescription line items.
- Track medicine prices, stock, and reorder levels.
- Deduct stock transactionally with row locking when dispensing.

### Billing and payments
- Generate patient bills and optional appointment-linked bills.
- Store bill line items with historical unit-price snapshots.
- Support multiple partial payments.
- Prevent overpayment and preserve financial history.
- Derive or consistently maintain bill payment status.

### Dashboard and reports
- Display total patients, today's appointments, completed appointments, outstanding balance, and collected revenue.
- Provide date, department, doctor, and status filters.
- Provide doctor, department, appointment, billing, payment, and inventory reports.
- Support server-side CSV export; PDF is an optional extension.

## Non-functional requirements

- MySQL 8+ with InnoDB.
- Node.js + Express server.
- EJS server-side rendering.
- Vanilla JavaScript.
- Internal page-specific CSS and JS in every EJS page.
- Centralized mysql2/promise connection pool to cloud MySQL.
- All SQL artifacts stored as separate files under database/.
- Parameterized queries, server-side validation, and safe EJS escaping.
- Authentication and authorization before real patient data is used.

## Out of scope

Real clinical deployment, insurance integrations, laboratory integrations, multi-hospital tenancy, and medical-device integrations.

## Acceptance criteria

1. SQL scripts create the database and tables in dependency order.
2. Seed data loads without foreign-key errors.
3. Patient, doctor, and appointment CRUD workflows work.
4. Appointment booking handles duplicate slots safely.
5. Billing supports partial payments and rejects overpayment.
6. COMMIT, ROLLBACK, and SAVEPOINT can be demonstrated.
7. Views, triggers, and stored procedures execute and can be explained.
8. Dashboard KPIs are queried from MySQL.
9. Reports support validated filters and export.
10. ERD and normalization documentation match the implemented schema.
