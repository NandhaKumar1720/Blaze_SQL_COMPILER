const express = require("express");
const bodyParser = require("body-parser");
const { Worker } = require("worker_threads");
const cors = require("cors");
const os = require("os");

const app = express();
const port = 3000;
const maxWorkers = os.cpus().length;
const workerPool = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Reuse workers to avoid frequent creation
function getWorker() {
    return workerPool.length ? workerPool.pop() : new Worker("./sql-worker.js");
}

app.post("/", (req, res) => {
    const { query, username } = req.body;
    if (!query || !username) return res.status(400).json({ error: { fullError: "Query and username are required!" } });

    const worker = getWorker();
    worker.postMessage({ query, username });

    worker.once("message", (result) => {
        res.json(result);
        workerPool.push(worker); // Reuse worker
    });

    worker.once("error", (err) => {
        res.status(500).json({ error: { fullError: `Worker error: ${err.message}` } });
    });

    worker.once("exit", (code) => {
        if (code !== 0) console.error(`Worker exited with code ${code}`);
    });
});

app.get("/health", (req, res) => res.status(200).json({ status: "Server is healthy!" }));

app.listen(port, () => console.log(`SQL Compiler Server is running on http://localhost:${port}`));
