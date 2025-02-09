const { parentPort } = require("worker_threads");
const mysql = require("mysql2/promise");

parentPort.on("message", async ({ query, dbName }) => {
    if (!query) {
        return parentPort.postMessage({ error: "No query provided!" });
    }

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: dbName,
        port: 3306
    });

    try {
        const [rows] = await connection.execute(query);

        // Delete the temporary database after execution
        await connection.execute(`DROP DATABASE IF EXISTS ${dbName}`);

        parentPort.postMessage({ output: rows });
    } catch (err) {
        parentPort.postMessage({ error: `Query Execution Error: ${err.message}` });
    } finally {
        await connection.end();
    }
});
