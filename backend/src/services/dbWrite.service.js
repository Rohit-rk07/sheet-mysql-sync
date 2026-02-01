import { db } from "../db/mysql.js";

export async function upsertRow(tableName, row) {
    const columns = Object.keys(row);
    const values = Object.values(row);

    const placeholders = columns.map(() => "?").join(", ");
    const updates = columns
        .filter(c => c !== "_sync_id")
        .map(c => `\`${c}\` = VALUES(\`${c}\`)`)
        .join(", ");

    const query = `
    INSERT INTO \`${tableName}\` (${columns.join(", ")})
    VALUES (${placeholders})
    ON DUPLICATE KEY UPDATE ${updates}
  `;

    await db.query(query, values);
}
