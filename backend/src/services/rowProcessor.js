import { normalizeRows } from "../utils/normalize.js";
import { ensureSyncId } from "../utils/id.js";
import { hashRow } from "../utils/hash.js";

export function processSheetData(header, rows) {
    const normalized = normalizeRows(header, rows);

    return normalized.map(row => {
        ensureSyncId(row);

        return {
            data: row,
            syncId: row._sync_id,
            hash: hashRow(row)
        };
    });
}
