import { db } from "../db/mysql.js";

export async function getMapping(syncTableId, sheetRowId) {
    const [rows] = await db.query(
        `SELECT * FROM row_mapping
         WHERE sync_table_id = ? AND sheet_row_id = ?`,
        [syncTableId, sheetRowId]
    );
    return rows[0];
}

export async function getMappingByPk(syncTableId, mysqlPk) {
    const [rows] = await db.query(
        `SELECT * FROM row_mapping
         WHERE sync_table_id = ? AND mysql_pk = ?`,
        [syncTableId, mysqlPk]
    );
    return rows[0];
}

export async function upsertMapping(
    syncTableId,
    sheetRowId,
    mysqlPk,
    hash,
    source
) {
    await db.query(
        `
        INSERT INTO row_mapping
          (sync_table_id, sheet_row_id, mysql_pk, row_hash, last_updated_from)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          row_hash = VALUES(row_hash),
          last_updated_from = VALUES(last_updated_from)
        `,
        [syncTableId, sheetRowId, mysqlPk, hash, source]
    );
}
