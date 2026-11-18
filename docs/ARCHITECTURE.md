# Application architecture

## Request flow

~~~text
Browser -> Express routes -> Controllers -> Services / repositories
       -> Central DB module (mysql2/promise pool)
       -> Cloud MySQL 8+ (tables, constraints, views, routines, triggers)
Controller -> EJS template -> HTML response -> Browser
~~~

The browser never connects directly to MySQL. Credentials remain on the server.

## Folder structure

~~~text
database/
  schema/ seeds/ views/ procedures/ triggers/
  queries/
    patients/ doctors/ appointments/ billing/ reports/
src/
  config/db.js
  routes/
  controllers/
  services/
  repositories/
  middleware/
  utils/
  app.js
views/
  partials/
  patients/
  doctors/
  appointments/
  billing/
  reports/
  dashboard.ejs
docs/
server.js
.env.example
.gitignore
package.json
~~~

EJS partials may share markup such as navigation. Do not create external CSS or browser JS bundles for page-specific styling or behavior. Each page keeps its own internal style and script blocks.

## Layer responsibilities

| Layer | Responsibility |
|---|---|
| Routes | URL and HTTP method mapping |
| Controllers | Request validation and response selection |
| Services | Business workflows and transactions |
| Repositories | SQL execution and result mapping |
| DB module | Shared MySQL pool |
| EJS views | Render data only |
| SQL files | Schema, reusable queries, views, routines, triggers |

## Central database module

Create src/config/db.js using mysql2/promise:

~~~js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  enableKeepAlive: true,
  ssl: process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : undefined
});

module.exports = pool;
~~~

This is a starting configuration. Follow the cloud provider's TLS and CA certificate instructions; never disable certificate verification to bypass connection errors.

Use pool.execute(sql, values) with bound parameters. For transactions, acquire one connection and use it for every statement:

~~~js
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  await connection.execute(sql1, values1);
  await connection.execute(sql2, values2);
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
~~~

## Environment variables

DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_CONNECTION_LIMIT, DB_SSL_CA, PORT, and SESSION_SECRET belong in the local .env file. Commit only .env.example. Use provider allowlists or private networking for database access.
