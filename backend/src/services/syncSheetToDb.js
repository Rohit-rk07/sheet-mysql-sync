import { ensureTableExists } from "./dbSchema.service.js";
import { upsertRow } from "./dbWrite.service.js";
import { getMapping, upsertMapping } from "./mapping.service.js";

export async function syncSheetToDb({
    syncTableId,
    tableName,
    header,
    processedRows
}) {
    // 1. Ensure table exists
    await ensureTableExists(tableName, header);

    for (const row of processedRows) {
        const { syncId, hash, data } = row;

        const mapping = await getMapping(syncTableId, syncId);

        // 2. Skip if unchanged or DB was source
        if (
            mapping &&
            mapping.row_hash === hash &&
            mapping.last_updated_from === "DB"
        ) {
            continue;
        }

        // 3. Write to DB
        await upsertRow(tableName, data);

        // 4. Update mapping
        await upsertMapping(
            syncTableId,
            syncId,
            hash,
            "SHEET"
        );
    }
}
