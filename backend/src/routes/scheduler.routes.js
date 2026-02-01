import express from "express";
import {
    startSyncScheduler,
    stopSyncScheduler,
    getSchedulerStatus
} from "../jobs/sync.scheduler.js";

const router = express.Router();

router.post("/start", (req, res) => {
    startSyncScheduler();
    res.json({ status: "Scheduler started" });
});

router.post("/stop", (req, res) => {
    stopSyncScheduler();
    res.json({ status: "Scheduler stopped" });
});

router.get("/status", (req, res) => {
    res.json(getSchedulerStatus());
});

export default router;
