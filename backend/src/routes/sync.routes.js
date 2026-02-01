import express from "express";
import { readHeader, readRows } from "../services/sheet.service.js";
import { processSheetData } from "../services/rowProcessor.js";
import { syncSheetToDb } from "../services/syncSheetToDb.js";
import { syncDbToSheet } from "../services/syncDbToSheet.js";
import { runFullSync } from "../services/syncOrchestrator.js";

const router = express.Router();

router.post("/sheet-to-db", async (req, res) => {
    try {
        const { sheetId, sheetName } = req.body;

        const header = await readHeader(sheetId, sheetName);
        const rows = await readRows(sheetId, sheetName);
        const processed = processSheetData(header, rows);

        await syncSheetToDb({
            syncTableId: 1,
            tableName: "sheet1_data",
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
            stack: err.stack
        });
    }
});

router.post("/db-to-sheet", async (req, res) => {
    const { sheetId, sheetName, syncTableId } = req.body;

    await syncDbToSheet({
        syncTableId,
        tableName: `${sheetName}_data`,
        header: await readHeader(sheetId, sheetName),
        sheetId,
        sheetName
    });

    res.json({ status: "DB → Sheet sync completed" });
});

router.post("/run", async (_, res) => {
    await runFullSync();
    res.json({ status: "Manual sync completed" });
});


export default router;
