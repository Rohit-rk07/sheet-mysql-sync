import { db } from "../db/mysql.js";

export async function getMapping(syncTableId, syncId) {
    const [rows] = await db.query(
        `SELECT * FROM row_mapping WHERE sync_table_id=? AND mysql_pk=?`,
        [syncTableId, syncId]
    );
    return rows[0];
}

export async function upsertMapping(
    syncTableId,
    syncId,
    hash,
    source
) {
    await db.query(
        `
    INSERT INTO row_mapping
      (sync_table_id, mysql_pk, row_hash, last_updated_from)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      row_hash=VALUES(row_hash),
      last_updated_from=VALUES(last_updated_from)
    `,
        [syncTableId, syncId, hash, source]
    );
}
