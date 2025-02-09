const { parentPort } = require("worker_threads");
const mysql = require("mysql2/promise");

const ROOT_USER = "root";
const ROOT_PASSWORD = "password"; // Change this for security
const HOST = "localhost";
const MAIN_DATABASE = "main_db";

parentPort.on("message", async ({ query, username }) => {
    let connection;

    try {
        // Ensure user has a separate database
        const userDatabase = `db_${username}`;
        connection = await mysql.createConnection({
            host: HOST,
            user: ROOT_USER,
            password: ROOT_PASSWORD,
            database: MAIN_DATABASE,
        });

        // Create user-specific database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${userDatabase}\`;`);
        
        // Use the user-specific database
        await connection.query(`USE \`${userDatabase}\`;`);

        // Execute the query
        const [rows] = await connection.query(query);

        parentPort.postMessage({
            output: JSON.stringify(rows, null, 2) || "No output received!",
        });
    } catch (err) {
        parentPort.postMessage({
            error: { fullError: `SQL Error: ${err.message}` },
        });
    } finally {
        if (connection) await connection.end();
    }
});
