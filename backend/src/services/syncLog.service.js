import { db } from "../db/mysql.js";
import logger from "../utils/logger.js";

let tableEnsured = false;

export async function ensureSyncLogsTableExists() {
    if (tableEnsured) return;

    await db.query(`
        CREATE TABLE IF NOT EXISTS sync_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sync_table_id INT NULL,
            table_name VARCHAR(100) NOT NULL,
            direction VARCHAR(30) NOT NULL,
            rows_processed INT DEFAULT 0,
            status VARCHAR(20) NOT NULL,
            error_message TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    tableEnsured = true;
}

export async function recordSyncLog({
    syncTableId = null,
    tableName,
    direction,
    rowsProcessed = 0,
    status = "SUCCESS",
    errorMessage = null
}) {
    try {
        await ensureSyncLogsTableExists();

        await db.query(
            `INSERT INTO sync_logs 
                (sync_table_id, table_name, direction, rows_processed, status, error_message)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [syncTableId, tableName, direction, rowsProcessed, status, errorMessage]
        );
    } catch (err) {
        logger.error("Failed to write sync log", { error: err.message });
    }
}

export async function getRecentSyncLogs(limit = 20) {
    await ensureSyncLogsTableExists();

    const [rows] = await db.query(
        `SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT ?`,
        [Number(limit)]
    );

    return rows;
}
