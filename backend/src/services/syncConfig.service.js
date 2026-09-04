import { db } from "../db/mysql.js";

export async function getActiveSyncTables() {
    const [rows] = await db.query(`
        SELECT * FROM sync_tables
    `);
    return rows;
}

export async function updateLastSyncedAt(id) {
    await db.query(
        `UPDATE sync_tables SET last_synced_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [id]
    );
}
