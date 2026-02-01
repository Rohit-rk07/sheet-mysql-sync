import express from "express";
import { readHeader, readRows } from "../services/sheet.service.js";
import { processSheetData } from "../services/rowProcessor.js";


const router = express.Router();

router.get("/preview", async (req, res) => {
    try {
        const { sheetId, sheetName } = req.query;

        const header = await readHeader(sheetId, sheetName);
        const rows = await readRows(sheetId, sheetName);
        const processed = processSheetData(header, rows);

        res.json({
            header,
            processedSample: processed.slice(0, 2)
        });


    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
