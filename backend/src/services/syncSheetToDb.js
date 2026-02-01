import { ensureTableExists } from "./dbSchema.service.js";
import { upsertRow } from "./dbWrite.service.js";
import { getMapping, upsertMapping } from "./mapping.service.js";
import { generateSyncId } from "../utils/id.js";

export async function syncSheetToDb({
    syncTableId,
    tableName,
    header,
    processedRows
}) {
    await ensureTableExists(tableName, header);

    for (const row of processedRows) {
        const { sheetRowId, hash, data } = row;

        // 1️⃣ lookup by SHEET ROW ID
        const mapping = await getMapping(syncTableId, sheetRowId);

        // ❗ remove internal-only field
        const cleanData = { ...data };
        delete cleanData._sheet_row_id;

        let syncId;

        if (!mapping) {
            // 🆕 NEW ROW
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

        } else {
            syncId = mapping.mysql_pk;

            // 🔁 UPDATE ONLY IF CHANGED
            if (mapping.row_hash !== hash) {
                cleanData._sync_id = syncId;

                await upsertRow(tableName, cleanData);

                await upsertMapping(
                    syncTableId,
                    sheetRowId,
                    syncId,
                    hash,
                    "SHEET"
                );
            }
        }
    }
}
