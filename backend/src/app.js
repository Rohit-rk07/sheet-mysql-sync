import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import sheetRoutes from "./routes/sheet.routes.js";
import syncRoutes from "./routes/sync.routes.js";
import schedulerRoutes from "./routes/scheduler.routes.js";
import { db } from "./db/mysql.js";
import { stopSyncScheduler } from "./jobs/sync.scheduler.js";
import logger from "./utils/logger.js";

const app = express();
app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({
    origin: corsOrigin
}));

// Deep health check — verifies DB connectivity
app.get("/health", async (_, res) => {
    try {
        await db.query("SELECT 1");
        res.json({ status: "ok", db: "connected" });
    } catch (err) {
        res.status(503).json({
            status: "unhealthy",
            db: "disconnected",
            error: err.message
        });
    }
});

app.use("/sheet", sheetRoutes);
app.use("/sync", syncRoutes);
app.use("/scheduler", schedulerRoutes);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    logger.info(`Backend running on port ${PORT}`);
});

// Graceful shutdown
function shutdown(signal) {
    logger.info(`${signal} received — shutting down gracefully`);

    // 1. Stop accepting new requests
    server.close(() => {
        logger.info("HTTP server closed");
    });

    // 2. Stop the scheduler
    stopSyncScheduler();

    // 3. Close DB pool
    db.end()
        .then(() => {
            logger.info("DB pool closed");
            process.exit(0);
        })
        .catch((err) => {
            logger.error("Error closing DB pool", { error: err.message });
            process.exit(1);
        });

    // Force exit after 10s if graceful shutdown stalls
    setTimeout(() => {
        logger.error("Forced exit after timeout");
        process.exit(1);
    }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
