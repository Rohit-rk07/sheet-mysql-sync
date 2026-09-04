import { db } from "../db/mysql.js";
import { safeIdentifier } from "../utils/sanitize.js";
import logger from "../utils/logger.js";

export async function getDbColumns(tableName) {
    const safeName = safeIdentifier(tableName, "table name");

    const [rows] = await db.query(`SHOW COLUMNS FROM ${safeName}`);
    return rows.map(r => r.Field);
}

export async function addColumnsToDb(tableName, columns) {
    const safeName = safeIdentifier(tableName, "table name");

    for (const col of columns) {
        const safeCol = safeIdentifier(col, "column name");
        await db.query(`ALTER TABLE ${safeName} ADD COLUMN ${safeCol} TEXT NULL`);
        logger.info("DB column added", { table: tableName, column: col });
    }
}
