const { parentPort } = require("worker_threads");
const mysql = require("mysql2/promise");
require("dotenv").config(); // Load environment variables

// Load MySQL credentials from environment variables
const ROOT_USER = process.env.DB_USER || "root";
const ROOT_PASSWORD = process.env.DB_PASSWORD || "password"; // Change for security
const HOST = process.env.DB_HOST || "localhost";
const MAIN_DATABASE = process.env.DB_MAIN || "main_db";

async function handleQuery(query, username) {
    let connection;

    try {
        console.log(`🔹 Processing query for user: ${username}`);
        console.log(`🔹 Query: ${query}`);

        // Ensure user-specific database
        const userDatabase = `db_${username.replace(/[^a-zA-Z0-9_]/g, "")}`; // Sanitize DB name

        // Connect to MySQL as root
        connection = await mysql.createConnection({
            host: HOST,
            user: ROOT_USER,
            password: ROOT_PASSWORD,
            database: MAIN_DATABASE,
        });

        // Create user-specific database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${userDatabase}\`;`);
        console.log(`✅ Database ready: ${userDatabase}`);

        // Switch to user-specific database
        await connection.query(`USE \`${userDatabase}\`;`);

        // Execute user query safely
        const [rows] = await connection.query(query);
        console.log("✅ Query executed successfully");

        return { output: JSON.stringify(rows, null, 2) || "No output received!" };

    } catch (err) {
        console.error(`❌ SQL Error: ${err.message}`);
        return { error: { fullError: `SQL Error: ${err.message}` } };

    } finally {
        if (connection) {
            await connection.end();
            console.log("🔹 Connection closed");
        }
    }
}

// Listen for messages from the parent thread
parentPort.on("message", async ({ query, username }) => {
    const result = await handleQuery(query, username);
    parentPort.postMessage(result);
});
