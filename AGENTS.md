# Mandatory repository instructions

Follow these rules for every implementation and modification.

## Technology
- Use Node.js and Express.
- Use EJS for server-side rendered pages.
- Use MySQL 8+ hosted on a cloud MySQL provider.
- Use npm package mysql2 through mysql2/promise. The package is mysql2, not sql2.
- Use vanilla browser JavaScript only. Do not add React, Vue, Angular, jQuery, or a CSS framework unless explicitly requested.
- Put page-specific CSS inside an internal <style> block in each EJS page.
- Put page-specific browser JavaScript inside an internal <script> block in each EJS page.
- Do not create external CSS or JS files for page styling or page behavior. Shared EJS markup partials are allowed.

## Database-first rules
- MySQL is the source of truth for relational data and integrity.
- Every schema, seed, view, trigger, stored procedure, migration, and reusable query must be a separate .sql file under database/.
- Do not create one monolithic SQL file. Do not embed long SQL statements in route handlers or EJS templates.
- Use primary keys, foreign keys, UNIQUE, NOT NULL, CHECK constraints where supported, and appropriate indexes.
- Use InnoDB and DECIMAL for monetary values.
- Use parameterized SQL. Never concatenate request input into SQL.
- For transactions, acquire one connection from the shared pool, run begin/commit/rollback on that same connection, and release it in finally.
- Preserve clinical and financial history; prefer status transitions or archival over destructive deletes.

## Database module
- Create src/config/db.js and export one shared mysql2/promise pool.
- Configure host, port, database, user, password, pool size, and TLS from environment variables.
- Never create a pool per request.
- Routes/controllers use the pool through services/repositories. EJS views never access the database.
- Follow the selected cloud provider's TLS certificate instructions. Do not disable certificate verification to bypass errors.

## SQL layout
- database/schema/ — database, tables, constraints, indexes
- database/seeds/ — reference and synthetic demo data
- database/views/ — reusable report views
- database/procedures/ — stored procedures
- database/triggers/ — triggers
- database/queries/patients/
- database/queries/doctors/
- database/queries/appointments/
- database/queries/billing/
- database/queries/reports/

Use descriptive filenames and numeric prefixes for ordered scripts. Document execution order. Never expose an endpoint that accepts arbitrary SQL or a SQL filename from the browser.

## Express and EJS
- Keep route -> controller -> service/repository -> database separation.
- Validate all request input on the server.
- Use escaped EJS output for user-controlled values.
- Do not expose SQL errors, stack traces, or credentials to users.
- Add CSRF protection for state-changing session-based forms.
- Views render data only; no database access or business rules.

## Dashboard and reporting
- Dashboard KPIs must come from SQL, never hardcoded values.
- Store report SQL under database/queries/reports/.
- Use SQL joins, aggregation, views, and validated date filters.
- Bound large reports with pagination or date ranges.
- Generate CSV/PDF server-side from validated report filters.
- Escape CSV values beginning with =, +, -, or @ to mitigate spreadsheet formula injection.

## Security
- Commit .env.example, never .env.
- Use a least-privilege MySQL application account.
- Add authentication and role-based authorization before exposing patient, clinical, or financial data.
- Use synthetic data for development and documentation.
- Never log credentials or unnecessary patient information.

## Quality
- Test against the target MySQL version, not SQLite.
- Verify foreign keys, constraints, transaction rollback, trigger behavior, and report totals.
- Update documentation when schema, routes, environment variables, or workflows change.
- Do not claim a feature is implemented unless its code and SQL files exist.
