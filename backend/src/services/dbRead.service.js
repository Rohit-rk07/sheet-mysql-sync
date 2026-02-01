import { db } from "../db/mysql.js";

export async function readDbRows(tableName) {
    const [rows] = await db.query(
        `SELECT * FROM \`${tableName}\``
    );
    return rows;
}
