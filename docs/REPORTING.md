# Dashboard and report generation

## Dashboard objective

The dashboard is the landing page after login. All KPIs and report values must come from MySQL. Do not hardcode metrics or use browser calculations as authoritative financial totals.

## Dashboard sections

### KPI cards
- Total registered patients
- Today's appointments
- Completed appointments today
- Appointments awaiting action
- Revenue collected in selected period
- Outstanding bill balance

### Operational panels
- Today's appointment list
- Appointment count by status
- Doctor workload summary
- Department-wise appointment count
- Low-stock medicine alerts
- Recent payments

### Filters
From date, to date, department, doctor, appointment status, and payment method where relevant. Validate filters server-side and use pagination and sensible maximum date ranges.

## Reports

| Report | Data |
|---|---|
| Patient register | Patient ID, name, phone, registration date |
| Daily appointments | Time, patient, doctor, department, status |
| Doctor workload | Doctor, department, total/completed/cancelled appointments |
| Department summary | Department, doctor count, appointment count |
| Monthly revenue | Month, payment count, collected amount |
| Outstanding bills | Bill, patient, total, paid, outstanding |
| Payment history | Date, bill, patient, amount, method, reference |
| Medicine stock | Medicine, stock, reorder level, low-stock flag |
| Prescription summary | Patient, doctor, date, medicine, dosage, quantity |

## SQL-first reporting

Store every report query under database/queries/reports/. Use views for stable reusable joins and separate query files for report-specific filters and aggregation.

Example dashboard KPI query:

~~~sql
SELECT
  (SELECT COUNT(*) FROM patients) AS total_patients,
  (SELECT COUNT(*) FROM appointments
   WHERE appointment_at >= CURRENT_DATE
     AND appointment_at < CURRENT_DATE + INTERVAL 1 DAY) AS appointments_today,
  (SELECT COUNT(*) FROM appointments
   WHERE status = 'Completed'
     AND appointment_at >= CURRENT_DATE
     AND appointment_at < CURRENT_DATE + INTERVAL 1 DAY) AS completed_today;
~~~

Example monthly revenue query:

~~~sql
SELECT DATE_FORMAT(paid_at, '%Y-%m') AS revenue_month,
       COUNT(*) AS payment_count,
       SUM(amount) AS collected_amount
FROM payments
WHERE paid_at >= ? AND paid_at < ?
GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
ORDER BY revenue_month;
~~~

Use half-open date ranges: start inclusive, end exclusive.

## Report flow

~~~text
EJS dashboard/report
 -> Express route
 -> Controller validates filters
 -> Report service/repository
 -> Parameterized SQL in database/queries/reports/
 -> Cloud MySQL
 -> EJS renders KPI cards and tables
 -> Optional server-side CSV/PDF export
~~~

## Export requirements

CSV must use the same validated filters as the visible report. Escape cells beginning with =, +, -, or @ to mitigate spreadsheet formula injection. PDF is optional and must be generated server-side. Include report title, generation timestamp, filters, and headings. Do not export clinical notes or sensitive fields unless necessary and authorized.

## Frontend requirements

Use EJS SSR. Keep CSS and vanilla JS internal to each EJS page. Browser JS may improve filter interactions or render charts, but it is never the source of truth for report calculations.
