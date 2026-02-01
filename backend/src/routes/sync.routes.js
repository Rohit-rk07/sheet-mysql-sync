import express from "express";
import { readHeader, readRows } from "../services/sheet.service.js";
import { processSheetData } from "../services/rowProcessor.js";
import { syncSheetToDb } from "../services/syncSheetToDb.js";

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
        res.status(500).json({ error: err.message });
    }
});

export default router;
