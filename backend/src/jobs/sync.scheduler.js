import cron from "node-cron";
import { runFullSync } from "../services/syncOrchestrator.js";
import logger from "../utils/logger.js";

let task = null;
let isSyncing = false;

export function startSyncScheduler() {
    if (task) {
        logger.warn("Scheduler already running");
        return;
    }

    task = cron.schedule("*/5 * * * * *", async () => {
        if (isSyncing) {
            logger.debug("Sync still in progress, skipping tick");
            return;
        }

        isSyncing = true;
        logger.debug("Scheduler tick");

        try {
            await runFullSync();
        } catch (err) {
            logger.error("Scheduler error", { error: err.message });
        } finally {
            isSyncing = false;
        }
    });

    logger.info("Scheduler started");
}

export function stopSyncScheduler() {
    if (!task) {
        logger.warn("Scheduler not running");
        return;
    }

    task.stop();
    task = null;
    logger.info("Scheduler stopped");
}

export function getSchedulerStatus() {
    return { running: !!task, syncing: isSyncing };
}
