import express from "express";
import { readHeader, readRows } from "../services/sheet.service.js";
import { processSheetData } from "../services/rowProcessor.js";

const router = express.Router();

router.get("/preview", async (req, res) => {
    try {
        const { sheetId, sheetName } = req.query;

        if (!sheetId || !sheetName) {
            return res.status(400).json({
                error: "Missing required query parameters: sheetId, sheetName"
            });
        }

        const header = await readHeader(sheetId, sheetName);
        const rows = await readRows(sheetId, sheetName);
        const processed = processSheetData(header, rows);

        res.json({
            header,
            processedSample: processed.slice(0, 2)
        });

    } catch (err) {
        console.error("❌ Sheet preview Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
