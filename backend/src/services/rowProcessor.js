import { normalizeRows } from "../utils/normalize.js";
import { ensureSyncId } from "../utils/id.js";
import { generateRowHash } from "../utils/hash.js";

export function processSheetData(header, rows) {
    const normalized = normalizeRows(header, rows);

    return normalized.map(row => ({
        sheetRowId: row._sheet_row_id,   // 👈 anchor identity
        data: row,
        hash: generateRowHash(row)
    }));
}
