const INTERNAL_COLUMNS = new Set([
    "_sync_id",
    "updated_at"
]);

export function diffColumns(sheetHeader, dbColumns) {
    const sheetCols = sheetHeader.filter(
        c => !INTERNAL_COLUMNS.has(c)
    );

    const dbCols = dbColumns.filter(
        c => !INTERNAL_COLUMNS.has(c)
    );

    return {
        toAddInDb: sheetCols.filter(c => !dbCols.includes(c)),
        toAddInSheet: dbCols.filter(c => !sheetCols.includes(c))
    };
}
