import { db } from "../db/mysql.js";
import { safeIdentifier } from "../utils/sanitize.js";

export async function upsertRow(tableName, row) {
    const safeName = safeIdentifier(tableName, "table name");

    const columns = Object.keys(row);
    const values = Object.values(row);

    const columnList = columns.map(c => safeIdentifier(c, "column name")).join(", ");
    const placeholders = columns.map(() => "?").join(", ");
    const updates = columns
        .filter(c => c !== "_sync_id")
        .map(c => `${safeIdentifier(c, "column name")} = VALUES(${safeIdentifier(c, "column name")})`)
        .join(", ");

    const query = `
    INSERT INTO ${safeName} (${columnList})
    VALUES (${placeholders})
    ON DUPLICATE KEY UPDATE ${updates}
  `;

    await db.query(query, values);
}
