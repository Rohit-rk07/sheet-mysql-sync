import { ensureTableExists } from "./dbSchema.service.js";
import { upsertRow } from "./dbWrite.service.js";
import {
    getMapping,
    getAllMappings,
    upsertMapping,
    updateMappingSheetRowId
} from "./mapping.service.js";
import { generateSyncId } from "../utils/id.js";
import { db } from "../db/mysql.js";
import { safeIdentifier } from "../utils/sanitize.js";
import logger from "../utils/logger.js";

export async function syncSheetToDb({
    syncTableId,
    tableName,
    header,
    processedRows
}) {
    await ensureTableExists(tableName, header);

    const safeName = safeIdentifier(tableName, "table name");
    const existingMappings = await getAllMappings(syncTableId);

    // Index mappings for fast lookup
    const mappingByRow = new Map(existingMappings.map(m => [String(m.sheet_row_id), m]));
    const mappingByPk = new Map(existingMappings.map(m => [m.mysql_pk, m]));
    const mappingByHash = new Map(existingMappings.map(m => [m.row_hash, m]));

    // Check if header contains a likely business primary key column
    const idColumn = header.find(c => /^(user_?id|id|_sync_id|code)$/i.test(c));

    for (const row of processedRows) {
        const { sheetRowId, hash, data } = row;

        const cleanData = { ...data };
        delete cleanData._sheet_row_id;

        let syncId = null;
        let isExistingRow = false;

        // Tier 1: Check if content hash already exists at another row index (Row Shift / Sort detection)
        const hashMatch = mappingByHash.get(hash);
        if (hashMatch) {
            syncId = hashMatch.mysql_pk;
            isExistingRow = true;

            // If physical row position changed due to sorting/insertion, re-anchor mapping
            if (String(hashMatch.sheet_row_id) !== String(sheetRowId)) {
                await updateMappingSheetRowId(syncTableId, syncId, sheetRowId);
                logger.debug("Row repositioned in Sheet", {
                    syncId,
                    oldRow: hashMatch.sheet_row_id,
                    newRow: sheetRowId
                });
            }
            continue; // Hash matches exactly, no DB write needed!
        }

        // Tier 2: Check if business primary key exists in DB (e.g. user_id)
        if (idColumn && cleanData[idColumn]) {
            try {
                const safeCol = safeIdentifier(idColumn, "column name");
                const [existingRows] = await db.query(
                    `SELECT _sync_id FROM ${safeName} WHERE ${safeCol} = ? LIMIT 1`,
                    [cleanData[idColumn]]
                );

                if (existingRows.length > 0 && existingRows[0]._sync_id) {
                    syncId = existingRows[0]._sync_id;
                    isExistingRow = true;
                }
            } catch (err) {
                logger.warn("ID column lookup failed", { error: err.message });
            }
        }

        // Tier 3: Lookup by physical sheet row ID
        if (!syncId) {
            const rowMapping = mappingByRow.get(String(sheetRowId));
            if (rowMapping) {
                syncId = rowMapping.mysql_pk;
                isExistingRow = true;
            }
        }

        // Tier 4: New Row
        if (!isExistingRow || !syncId) {
            syncId = generateSyncId();
            cleanData._sync_id = syncId;

            await upsertRow(tableName, cleanData);
            await upsertMapping(
                syncTableId,
                sheetRowId,
                syncId,
                hash,
                "SHEET"
            );

            logger.info("Sheet → DB (New Row)", { sheetRowId, syncId });
        } else {
            // Existing row updated
            cleanData._sync_id = syncId;
            await upsertRow(tableName, cleanData);
            await upsertMapping(
                syncTableId,
                sheetRowId,
                syncId,
                hash,
                "SHEET"
            );

            logger.info("Sheet → DB (Updated)", { sheetRowId, syncId });
        }
    }
}
