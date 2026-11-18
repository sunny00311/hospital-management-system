# Development and implementation guide

## Setup

Install Node.js LTS and create a cloud MySQL 8+ database with a least-privilege application user. Obtain hostname, port, database name, credentials, and TLS instructions from the provider.

Example .env.example:

~~~dotenv
PORT=3000
NODE_ENV=development
DB_HOST=
DB_PORT=3306
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_CONNECTION_LIMIT=10
DB_SSL_CA=
SESSION_SECRET=
~~~

Copy to .env locally and populate it. Add .env to .gitignore. Never commit secrets.

Install:

~~~bash
npm install express ejs mysql2 dotenv
npm install --save-dev nodemon
~~~

Suggested scripts:

~~~json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
~~~

## Implementation order

1. Project skeleton, Express app, environment config, shared DB pool.
2. Verify cloud connectivity with SELECT 1.
3. Implement schema SQL and ERD.
4. Add reference and synthetic demo data.
5. Implement patient and doctor CRUD.
6. Implement appointment booking and conflict handling.
7. Implement medical records, prescriptions, and inventory.
8. Implement billing, payments, and financial integrity.
9. Implement views, triggers, stored procedures, and report SQL files.
10. Build EJS dashboard and report pages with internal CSS/JS.
11. Add CSV export and tests.
12. Review security and documentation.

## Transaction pattern

~~~js
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  // Execute every statement on this connection.
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
~~~

Never mix pool.execute() with connection.execute() inside one transaction.

## Testing checklist

Database:
- Fresh schema creation succeeds in dependency order.
- Seed scripts load correctly.
- Foreign keys reject invalid references.
- UNIQUE constraints reject duplicates and duplicate doctor slots.
- CHECK constraints reject invalid prices, quantities, and stock.
- Forced transaction failure rolls back all changes.
- Triggers and procedures work on the target MySQL version.

Application:
- Cloud DB pool connects using provider TLS requirements.
- CRUD validates inputs and uses bound parameters.
- Appointment booking handles conflicts.
- Payment logic prevents overpayment under concurrent requests.
- EJS escapes user-provided values.
- Dashboard values match direct SQL verification.
- Report filters and CSV exports are validated and bounded.

## Academic demonstration

1. ER diagram and relationships.
2. Normalization to 3NF.
3. DDL, keys, constraints, and indexes.
4. CRUD operations.
5. INNER, LEFT, and RIGHT joins where appropriate.
6. GROUP BY, HAVING, subqueries, and window functions.
7. Views, procedures, and triggers.
8. COMMIT, ROLLBACK, and SAVEPOINT.
9. Dashboard and report generation.
10. Indexing and transaction safety.
