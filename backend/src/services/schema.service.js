import { db } from "../db/mysql.js";

export async function getDbColumns(tableName) {
    const [rows] = await db.query(
        `SHOW COLUMNS FROM \`${tableName}\``
    );
    console.log("DB columns:", rows.map(r => r.Field));
    return rows.map(r => r.Field);
}

export async function addColumnsToDb(tableName, columns) {
    for (const col of columns) {
        await db.query(
            `ALTER TABLE \`${tableName}\`
             ADD COLUMN \`${col}\` TEXT NULL`
        );
        console.log(`🧱 DB column added: ${col}`);
    }
}

