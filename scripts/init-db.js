'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DB_DIR = path.join(__dirname, '..', 'database');

async function createConnectionWithRetry(maxRetries = 2) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Build SSL config based on environment
            const sslConfig = {};

            if (process.env.DB_SSL_CA) {
                const caPath = path.resolve(process.env.DB_SSL_CA);
                if (fs.existsSync(caPath)) {
                    sslConfig.ca = fs.readFileSync(caPath, 'utf8');
                }
            }
            // If no DB_SSL_CA or cert not found, proceed without SSL config
            // (rejectUnauthorized:false would go here but the mysql2 v3.24.6+
            //  + Node.js v22 has a TLS handshake bug, so we skip SSL entirely)

            let sslOption;
            if (Object.keys(sslConfig).length > 0) {
                sslOption = sslConfig;
            } else {
                sslOption = undefined;
            }

            const conn = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT || 3306),
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                ssl: sslOption,
                multipleStatements: true
            });

            return conn;
        } catch (err) {
            lastError = err;
            // If this is the TLS offset error, retry without SSL
            if (attempt < maxRetries &&
                err.code === 'ERR_OUT_OF_RANGE' &&
                err.message?.includes('offset') &&
                err.message?.includes('must be >= 0 and <= 5')) {
                console.log(`TLS handshake attempt ${attempt + 1} failed with offset error, retrying without SSL...`);
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }
            throw err;
        }
    }

    throw lastError;
}

async function run() {
    const conn = await createConnectionWithRetry();

    const files = [
        'schema/001_create_database.sql',
        'schema/002_create_tables.sql',
        'schema/003_constraints_and_indexes.sql',
        'seeds/001_reference_data.sql',
        'seeds/002_demo_data.sql',
        ...['views', 'procedures', 'triggers'].flatMap(dir =>
            fs.readdirSync(path.join(DB_DIR, dir))
                .filter(file => file.endsWith('.sql'))
                .sort()
                .map(file => `${dir}/${file}`)
        )
    ];

    for (const file of files) {
        const sql = fs.readFileSync(path.join(DB_DIR, file), 'utf8');
        await conn.query(sql);
        console.log(`Executed: ${file}`);
    }

    await conn.end();
    console.log('Database initialized successfully.');
}

run();