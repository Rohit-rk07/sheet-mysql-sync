import cron from "node-cron";
import { runFullSync } from "../services/syncOrchestrator.js";

let task = null;

export function startSyncScheduler() {
    if (task) {
        console.log("⚠️ Scheduler already running");
        return;
    }

    task = cron.schedule("*/5 * * * * *", async () => {
        console.log("⏱️ Scheduler tick");

        try {
            await runFullSync();
        } catch (err) {
            console.error("❌ Scheduler error:", err.message);
        }
    });

    console.log("🚀 Scheduler started");
}

export function stopSyncScheduler() {
    if (!task) {
        console.log("⚠️ Scheduler not running");
        return;
    }

    task.stop();
    task = null;
    console.log("⏹️ Scheduler stopped");
}

export function getSchedulerStatus() {
    return { running: !!task };
}
