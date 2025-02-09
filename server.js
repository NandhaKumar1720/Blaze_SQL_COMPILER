const express = require("express");
const bodyParser = require("body-parser");
const { Worker } = require("worker_threads");
const mysql = require("mysql2/promise");
const cors = require("cors");
const os = require("os");

const app = express();
const port = 3000;
const maxWorkers = os.cpus().length;
const workerPool = [];

// MySQL Root Credentials
const ROOT_USER = "root";
const ROOT_PASSWORD = "rootpassword";  // Change as needed
const HOST = "localhost";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create separate database for each user
async function getUserDatabase(userId) {
    const connection = await mysql.createConnection({
        host: HOST,
        user: ROOT_USER,
        password: ROOT_PASSWORD,
    });

    const databaseName = `userdb_${userId}`;
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    await connection.end();
    return databaseName;
}

// Reuse workers
function getWorker() {
    return workerPool.length ? workerPool.pop() : new Worker("./mysql-worker.js");
}

// SQL execution endpoint
app.post("/", async (req, res) => {
    const { userId, query } = req.body;
    if (!userId || !query) {
        return res.status(400).json({ error: { fullError: "User ID and query required!" } });
    }

    const database = await getUserDatabase(userId);
    const worker = getWorker();
    worker.postMessage({ database, query });

    worker.once("message", (result) => {
        res.json(result);
        workerPool.push(worker);
    });

    worker.once("error", (err) => {
        res.status(500).json({ error: { fullError: `Worker error: ${err.message}` } });
    });

    worker.once("exit", (code) => {
        if (code !== 0) console.error(`Worker exited with code ${code}`);
    });
});

// Health check
app.get("/health", (req, res) => res.status(200).json({ status: "Server is healthy!" }));

// Start server
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
