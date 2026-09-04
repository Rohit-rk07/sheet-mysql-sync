import express from "express";
import { readHeader, readRows } from "../services/sheet.service.js";
import { processSheetData } from "../services/rowProcessor.js";
import { syncSheetToDb } from "../services/syncSheetToDb.js";
import { syncDbToSheet } from "../services/syncDbToSheet.js";
import { runFullSync } from "../services/syncOrchestrator.js";
import { getRecentSyncLogs } from "../services/syncLog.service.js";

const router = express.Router();

/**
 * Validates required fields in the request body.
 * Returns an error message string if validation fails, or null if OK.
 */
function validateSyncBody(body, requiredFields) {
    for (const field of requiredFields) {
        if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
            return `Missing or invalid field: "${field}"`;
        }
    }
    return null;
}

router.post("/sheet-to-db", async (req, res) => {
    try {
        const error = validateSyncBody(req.body, ["sheetId", "sheetName"]);
        if (error) {
            return res.status(400).json({ error });
        }

        const { sheetId, sheetName } = req.body;
        const tableName = `${sheetName}_data`;

        const header = await readHeader(sheetId, sheetName);
        const rows = await readRows(sheetId, sheetName);
        const processed = processSheetData(header, rows);

        await syncSheetToDb({
            syncTableId: 1,
            tableName,
            header,
            processedRows: processed
        });

        res.json({
            status: "Sheet → DB sync completed",
            rowsProcessed: processed.length
        });

    } catch (err) {
        console.error("❌ Sheet-to-DB Error:", err);
        res.status(500).json({
            error: err.message,
            ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
        });
    }
});

router.post("/db-to-sheet", async (req, res) => {
    try {
        const error = validateSyncBody(req.body, ["sheetId", "sheetName"]);
        if (error) {
            return res.status(400).json({ error });
        }

        const { sheetId, sheetName, syncTableId } = req.body;

        await syncDbToSheet({
            syncTableId: syncTableId || 1,
            tableName: `${sheetName}_data`,
            header: await readHeader(sheetId, sheetName),
            sheetId,
            sheetName
        });

        res.json({ status: "DB → Sheet sync completed" });
    } catch (err) {
        console.error("❌ DB-to-Sheet Error:", err);
        res.status(500).json({
            error: err.message,
            ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
        });
    }
});

router.post("/run", async (_, res) => {
    try {
        await runFullSync();
        res.json({ status: "Manual sync completed" });
    } catch (err) {
        console.error("❌ Manual sync Error:", err);
        res.status(500).json({
            error: err.message,
            ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
        });
    }
});

router.get("/logs", async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const logs = await getRecentSyncLogs(limit);
        res.json({ logs });
    } catch (err) {
        console.error("❌ Sync logs error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
