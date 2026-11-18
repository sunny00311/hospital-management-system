# SQL file organization and execution

## Mandatory rule

Every schema definition, seed, view, trigger, stored procedure, migration, and reusable query must live in its own .sql file under database/. Do not put long SQL strings in Express route handlers or EJS templates. Do not combine the entire project into one SQL file.

## Directory layout

~~~text
database/
├── schema/
│   ├── 001_create_database.sql
│   ├── 002_create_tables.sql
│   └── 003_constraints_and_indexes.sql
├── seeds/
│   ├── 001_reference_data.sql
│   └── 002_demo_data.sql
├── views/
│   ├── 001_v_bill_summary.sql
│   ├── 002_v_doctor_workload.sql
│   └── 003_v_inventory_alerts.sql
├── procedures/
│   ├── 001_book_appointment.sql
│   └── 002_generate_bill.sql
├── triggers/
│   ├── 001_validate_payment.sql
│   └── 002_sync_bill_status.sql
└── queries/
    ├── patients/
    ├── doctors/
    ├── appointments/
    ├── billing/
    └── reports/
~~~

Prefer one logical query or database object per file. Use numbered filenames where execution order matters.

## Query parameters

mysql2 uses positional placeholders and bound values:

~~~js
const [rows] = await pool.execute(
  'SELECT patient_id, full_name FROM patients WHERE phone = ?',
  [phone]
);
~~~

Never interpolate request values into SQL. Table names, column names, and sort directions cannot be bound as values; choose them only from a strict server-side allowlist.

If SQL text is loaded from a file, pass values separately to execute(sql, values). Never expose an endpoint that accepts arbitrary SQL or a filename from the browser. Never execute schema or seed scripts on every server startup.

## File responsibilities

- schema/: database, tables, constraints, and indexes.
- seeds/: reference data and synthetic demo data.
- views/: CREATE OR REPLACE VIEW definitions.
- procedures/: stored procedures.
- triggers/: database event triggers.
- queries/: application and demonstration SQL statements.

## Execution order

1. Create/select database.
2. Create tables in dependency order.
3. Add constraints and indexes not declared inline.
4. Insert reference data.
5. Insert synthetic demo data.
6. Create views.
7. Create stored procedures.
8. Create triggers.
9. Run verification and report queries.

Execute scripts with MySQL Workbench, MySQL CLI, or a migration runner. Do not rely on alphabetical ordering unless filenames are numbered.

## SQL quality

Use explicit INSERT column lists, snake_case names, table aliases, DECIMAL for money, temporal data types for dates, and documented timezone assumptions. Prefer set-based queries. Use EXPLAIN for expensive reports. Bound large reports with date filters and pagination. Use transactions for atomic multi-statement workflows.
