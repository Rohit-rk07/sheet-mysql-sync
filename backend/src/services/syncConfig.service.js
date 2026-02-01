import { db } from "../db/mysql.js";

export async function getActiveSyncTables() {
    const [rows] = await db.query(`
        SELECT * FROM sync_tables
    `);
    return rows;
}
