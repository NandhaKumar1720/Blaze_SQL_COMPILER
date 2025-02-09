const { parentPort } = require("worker_threads");
const mysql = require("mysql2/promise");

// MySQL root credentials
const ROOT_USER = "root";
const ROOT_PASSWORD = "rootpassword";  // Change this as needed
const HOST = "localhost";

parentPort.on("message", async ({ database, query }) => {
    let connection;
    try {
        // Connect to MySQL
        connection = await mysql.createConnection({
            host: HOST,
            user: ROOT_USER,
            password: ROOT_PASSWORD,
            database,
        });

        // Execute SQL query
        const [results] = await connection.execute(query);
        
        // Send result back
        parentPort.postMessage({ output: JSON.stringify(results, null, 2) });
    } catch (err) {
        parentPort.postMessage({ error: { fullError: `SQL Error: ${err.message}` } });
    } finally {
        if (connection) await connection.end();
    }
});
