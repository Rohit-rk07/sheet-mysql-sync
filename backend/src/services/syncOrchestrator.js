// src/services/syncOrchestrator.js
import { syncSchema } from "./schemaSync.service.js";
import { syncSheetToDb } from "./syncSheetToDb.js";
import { syncDbToSheet } from "./syncDbToSheet.js";
import { readHeader } from "./sheet.service.js";
import { readRows } from "./sheet.service.js";
import { processSheetData } from "./rowProcessor.js";

export async function runFullSync() {
    const SHEET_ID = process.env.SHEET_ID;
    const SHEET_NAME = process.env.SHEET_NAME;
    const TABLE = `${SHEET_NAME}_data`;

    console.log("🔁 Full sync started");

    // 1️⃣ Read sheet
    const header = await readHeader(SHEET_ID, SHEET_NAME);
    const rows = await readRows(SHEET_ID, SHEET_NAME);

    // 2️⃣ Process rows
    const processedRows = processSheetData(header, rows);

    // 3️⃣ Sync schema
    await syncSchema({
        sheetHeader: header,
        sheetId: SHEET_ID,
        sheetName: SHEET_NAME,
        tableName: TABLE
    });

    // 4️⃣ Sheet → DB
    await syncSheetToDb({
        syncTableId: 1,
        tableName: TABLE,
        header,
        processedRows
    });

    // 5️⃣ DB → Sheet
    await syncDbToSheet({
        syncTableId: 1,
        tableName: TABLE,
        header,
        sheetId: SHEET_ID,
        sheetName: SHEET_NAME
    });

    console.log("✅ Full sync finished");
}
