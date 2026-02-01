export function normalizeRows(header, rows) {
    return rows
        .filter(row => row.length > 0) // remove completely empty rows
        .map(row => {
            const obj = {};

            header.forEach((col, index) => {
                obj[col] = row[index] ?? "";
            });

            return obj;
        });
}
