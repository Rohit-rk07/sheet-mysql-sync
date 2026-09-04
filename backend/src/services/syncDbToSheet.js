import { readDbRows } from "./dbRead.service.js";
import { getMappingByPk, upsertMapping } from "./mapping.service.js";
import { updateSheetRow, appendSheetRow } from "./sheetWrite.service.js";
import { generateRowHash } from "../utils/hash.js";
import { dbRowToSheetRow } from "../utils/dbToSheetRow.js";
import { generateSyncId } from "../utils/id.js";
import { db } from "../db/mysql.js";
import { safeIdentifier } from "../utils/sanitize.js";
import logger from "../utils/logger.js";

export async function syncDbToSheet({
    syncTableId,
    tableName,
    header,
    sheetId,
    sheetName
}) {
    const dbRows = await readDbRows(tableName);

    for (const dbRow of dbRows) {
        let syncId = dbRow._sync_id;
        const hash = generateRowHash(dbRow);

        // If row in DB has no _sync_id, generate and save one
        if (!syncId) {
            syncId = generateSyncId();
            const safeName = safeIdentifier(tableName, "table name");
            // Find a column to identify the row if possible or update
            dbRow._sync_id = syncId;
        }

        const mapping = await getMappingByPk(syncTableId, syncId);

        if (!mapping) {
            // 🆕 New row in MySQL that does not exist in Google Sheet yet
            const sheetValues = dbRowToSheetRow(header, dbRow);
            logger.info("DB → Sheet (New Row Appending)", {
                syncId,
                values: sheetValues
            });

            const assignedRowId = await appendSheetRow(
                sheetId,
                sheetName,
                sheetValues
            );

            if (assignedRowId) {
                await upsertMapping(
                    syncTableId,
                    assignedRowId,
                    syncId,
                    hash,
                    "DB"
                );
                logger.info("DB → Sheet (Appended & Mapped)", {
                    row: assignedRowId,
                    syncId
                });
            }
            continue;
        }

        // Row already mapped — update only if hash changed
        if (hash === mapping.row_hash) {
            continue;
        }

        const sheetValues = dbRowToSheetRow(header, dbRow);
        logger.info("DB → Sheet (Update)", {
            row: mapping.sheet_row_id,
            syncId
        });

        await updateSheetRow(
            sheetId,
            sheetName,
            mapping.sheet_row_id,
            sheetValues
        );

        await upsertMapping(
            syncTableId,
            mapping.sheet_row_id,
            syncId,
            hash,
            "DB"
        );
    }
}
