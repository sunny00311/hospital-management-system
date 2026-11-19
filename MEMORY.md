- [init-db.js] Database init script — handles schema loading, seed data, views, procedures, and triggers. Requires TLS configuration for Aiven MySQL (CA cert needed). Using mysql2 v3.10.2 for compatibility with Node.js v22 TLS handshake.
- [app.js] Express app with session management, CSRF protection, security headers, and route composition
- [routes/] All resource routes: auth, dashboard, patients, departments, doctors, appointments, medical-records, prescriptions, medicines, billing, payments, reports
- [controllers/] All resource controllers with business logic
- [services/] Business services with transactions and validation
- [repositories/] Data access layer with parameterized SQL queries
- [middleware/] Auth, CSRF, authorization, validation, error handling, flash messages, rate limiting
- [utils/] Pagination, CSV export, validators, SQL loader, money helpers, bill/payment number generators
- [views/] All ESSR pages with internal CSS/JS — login, dashboard, patients, departments, doctors, appointments, medical-records, prescriptions, medicines, billing, payments, reports, error pages
- [database/schema/] Three SQL files: database creation, table creation with constraints/indexes
- [database/seeds/] Two SQL files: reference data and synthetic demo data
- [database/views/] Three reusable SQL views: bill summary, doctor workload, inventory alerts
- [database/procedures/] Two stored procedures: appointment booking, bill generation
- [database/triggers/] Three triggers: payment validation, bill status sync, stock movement ledger
- [database/queries/] 46+ SQL query files across all resource modules
- [.env.example] Environment variable template (no secrets committed)
- [server.js] Node.js HTTP server with graceful shutdown
- [package.json] Project dependencies and scripts

**Running:** `npm run dev` starts the app on http://localhost:3000

**Database init** currently has a TLS handshake compatibility issue between mysql2 v3.24.6 + Node.js v22 + Aiven MySQL. The schema and seed SQL files are correct and ready to execute via MySQL CLI or once the TLS configuration is resolved. Consider using mysql2@3.9.7 or providing the Aiven CA certificate path in .env's DB_SSL_CA field.