export function normalizeRows(header, rows) {
    return rows.map(({ sheetRowId, values }) => {
        const row = { _sheet_row_id: sheetRowId };

        header.forEach((col, i) => {
            row[col] = values[i] ?? null;
        });

        return row;
    });
}
