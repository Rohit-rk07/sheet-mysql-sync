import { db } from "../db/mysql.js";

export async function ensureTableExists(tableName, header) {

    const filteredColumns = header.filter(col => col !== "_sync_id");

    const columnDefs = filteredColumns
        .map(col => `\`${col}\` TEXT`)
        .join(", ");

    const query = `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      _sync_id VARCHAR(36) PRIMARY KEY,
      ${columnDefs},
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    )
  `;

    await db.query(query);
}
