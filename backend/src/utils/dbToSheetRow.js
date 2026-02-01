export function dbRowToSheetRow(header, dbRow) {
    return header.map(col => dbRow[col] ?? "");
}
