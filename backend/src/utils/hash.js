import crypto from "crypto";

// Internal fields that must be excluded from hashing so that
// Sheet-originated rows and DB-originated rows produce the same
// hash for identical user data.
const INTERNAL_FIELDS = new Set([
    "_sheet_row_id",
    "_sync_id",
    "updated_at"
]);

/**
 * Normalizes a cell/field value to eliminate type discrepancies
 * between Google Sheets (always strings, empty string) and MySQL
 * (numbers, null, dates, trimmed strings).
 */
export function normalizeValue(val) {
    if (val === null || val === undefined) {
        return "";
    }
    if (val instanceof Date) {
        return val.toISOString();
    }
    return String(val).trim();
}

/**
 * Generates a SHA-256 hash of only the user-data columns of a row.
 * Internal/system fields are stripped and primitive values are normalized
 * before hashing to ensure Sheet→DB and DB→Sheet hashes are comparable.
 */
export function generateRowHash(rowObj) {
    const sortedKeys = Object.keys(rowObj)
        .filter((key) => !INTERNAL_FIELDS.has(key))
        .sort();

    const filtered = {};
    for (const key of sortedKeys) {
        filtered[key] = normalizeValue(rowObj[key]);
    }

    return crypto
        .createHash("sha256")
        .update(JSON.stringify(filtered))
        .digest("hex");
}
