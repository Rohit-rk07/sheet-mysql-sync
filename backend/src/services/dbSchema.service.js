import { db } from "../db/mysql.js";
import { safeIdentifier } from "../utils/sanitize.js";

export async function ensureTableExists(tableName, header) {
    const safeName = safeIdentifier(tableName, "table name");

    const filteredColumns = header.filter(col => col !== "_sync_id");

    const columnDefs = filteredColumns
        .map(col => `${safeIdentifier(col, "column name")} TEXT`)
        .join(", ");

    const query = `
    CREATE TABLE IF NOT EXISTS ${safeName} (
      _sync_id VARCHAR(36) PRIMARY KEY,
      ${columnDefs},
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    )
  `;

    await db.query(query);
}
