import { db } from "../db/mysql.js";
import { safeIdentifier } from "../utils/sanitize.js";

export async function readDbRows(tableName) {
    const safeName = safeIdentifier(tableName, "table name");

    const [rows] = await db.query(`SELECT * FROM ${safeName}`);
    return rows;
}
