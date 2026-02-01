import { readDbRows } from "./dbRead.service.js";
import { getMappingByPk, upsertMapping } from "./mapping.service.js";
import { updateSheetRow } from "./sheetWrite.service.js";
import { generateRowHash } from "../utils/hash.js";
import { dbRowToSheetRow } from "../utils/dbToSheetRow.js";

export async function syncDbToSheet({
    syncTableId,
    tableName,
    header,
    sheetId,
    sheetName
}) {
    const dbRows = await readDbRows(tableName);

    for (const dbRow of dbRows) {
        const syncId = dbRow._sync_id;

        const mapping = await getMappingByPk(syncTableId, syncId);

        if (!mapping) {
            continue;
        }

        const hash = generateRowHash(dbRow);

        if (hash === mapping.row_hash) {
            continue;
        }

        const sheetValues = dbRowToSheetRow(header, dbRow);
        console.log(
            "DB → Sheet:",
            "row", mapping.sheet_row_id,
            "values", sheetValues
        );

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
            "SHEET"
        );
    }
}
