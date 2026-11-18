# Hospital Management System

A database-first Hospital Management System using Node.js, Express, EJS, and cloud-hosted MySQL. The frontend is intentionally minimal; the main academic focus is relational database design, SQL, integrity, transactions, and report generation.

## Fixed technology decisions

- Server: Node.js + Express.
- Rendering: EJS server-side rendering (SSR).
- Database: MySQL 8+ on a cloud MySQL provider.
- Driver: npm package mysql2, using mysql2/promise. The package is mysql2, not sql2.
- Connection: one centralized database module and shared connection pool.
- SQL: separate .sql files under database/; do not put large SQL statements in route handlers or EJS.
- Frontend: vanilla HTML, CSS, and JavaScript. Each EJS page contains its own page-specific internal style and script blocks. No frontend framework or external page CSS/JS bundles.
- Reporting: database-backed dashboard, filters, tabular reports, and CSV export.

## Documentation

- AGENTS.md — mandatory coding-agent instructions.
- docs/PROJECT_SPEC.md — project scope and acceptance criteria.
- docs/ARCHITECTURE.md — layers, folder structure, cloud DB module.
- docs/DATABASE_DESIGN.md — normalized entities, relationships, Mermaid ERD.
- docs/SQL_CONVENTIONS.md — separate SQL file policy and execution order.
- docs/REPORTING.md — dashboard and report requirements.
- docs/DEVELOPMENT_RULES.md — setup, implementation sequence, testing.

## Main modules

1. Patient management
2. Department and doctor management
3. Appointment scheduling
4. Medical records and diagnosis
5. Prescriptions and medicine inventory
6. Billing and payments
7. Dashboard and report generation

## Setup summary

1. Create a cloud MySQL 8+ database and a least-privilege application user.
2. Copy .env.example to .env and enter provider connection details.
3. Install dependencies with npm install.
4. Execute database SQL files in the order documented in docs/SQL_CONVENTIONS.md.
5. Start the server with npm run dev.

Never commit .env, credentials, TLS private keys, or real patient data.

## Repository status

This repository starts as a project specification and implementation guide. Keep code modular and update the documentation whenever schema, routes, environment variables, or workflows change.
