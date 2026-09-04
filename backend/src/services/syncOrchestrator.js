import { syncSchema } from "./schemaSync.service.js";
import { syncSheetToDb } from "./syncSheetToDb.js";
import { syncDbToSheet } from "./syncDbToSheet.js";
import { readHeader, readRows } from "./sheet.service.js";
import { processSheetData } from "./rowProcessor.js";
import { getActiveSyncTables, updateLastSyncedAt } from "./syncConfig.service.js";
import { recordSyncLog } from "./syncLog.service.js";
import logger from "../utils/logger.js";

/**
 * Synchronizes a single Sheet ↔ MySQL table pair.
 */
export async function syncTable({
    syncTableId,
    sheetId,
    sheetName,
    tableName
}) {
    logger.info("Syncing table", { syncTableId, sheetName, tableName });

    try {
        // 1️⃣ Read current sheet header and rows
        const header = await readHeader(sheetId, sheetName);
        const rows = await readRows(sheetId, sheetName);

        // 2️⃣ Normalize and hash sheet rows
        const processedRows = processSheetData(header, rows);

        // 3️⃣ Sync schema and obtain the fresh unified header
        const freshHeader = await syncSchema({
            sheetHeader: header,
            sheetId,
            sheetName,
            tableName
        });

        // 4️⃣ Sheet → DB (using fresh header)
        await syncSheetToDb({
            syncTableId,
            tableName,
            header: freshHeader,
            processedRows
        });

        // 5️⃣ DB → Sheet (using fresh header)
        await syncDbToSheet({
            syncTableId,
            tableName,
            header: freshHeader,
            sheetId,
            sheetName
        });

        // 6️⃣ Update last_synced_at if table is registered in sync_tables
        if (syncTableId) {
            await updateLastSyncedAt(syncTableId).catch(() => {});
        }

        // 7️⃣ Record successful audit log
        await recordSyncLog({
            syncTableId,
            tableName,
            direction: "FULL_SYNC",
            rowsProcessed: processedRows.length,
            status: "SUCCESS"
        });

        logger.info("Table sync completed", {
            tableName,
            rowsProcessed: processedRows.length
        });

        return { success: true, rowsProcessed: processedRows.length };

    } catch (err) {
        logger.error("Table sync failed", { tableName, error: err.message });

        await recordSyncLog({
            syncTableId,
            tableName,
            direction: "FULL_SYNC",
            rowsProcessed: 0,
            status: "FAILED",
            errorMessage: err.message
        });

        throw err;
    }
}

/**
 * Main orchestrator: Syncs all active tables from sync_tables,
 * or falls back to .env configuration if no tables are registered.
 */
export async function runFullSync() {
    let activeTables = [];
    try {
        activeTables = await getActiveSyncTables();
    } catch (err) {
        logger.warn("Could not query sync_tables, using env fallback", { error: err.message });
    }

    if (activeTables.length > 0) {
        // Multi-table mode
        logger.info(`Running multi-table sync for ${activeTables.length} table(s)`);
        for (const table of activeTables) {
            await syncTable({
                syncTableId: table.id,
                sheetId: table.sheet_id,
                sheetName: table.sheet_name,
                tableName: table.mysql_table
            });
        }
    } else {
        // Single-table fallback via .env
        const SHEET_ID = process.env.SHEET_ID;
        const SHEET_NAME = process.env.SHEET_NAME;

        if (!SHEET_ID || !SHEET_NAME) {
            throw new Error("Missing SHEET_ID or SHEET_NAME in environment variables");
        }

        const TABLE = `${SHEET_NAME}_data`;

        await syncTable({
            syncTableId: 1,
            sheetId: SHEET_ID,
            sheetName: SHEET_NAME,
            tableName: TABLE
        });
    }
}
