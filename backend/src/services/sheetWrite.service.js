import { sheetsClient } from "../config/google.js";

export async function updateSheetRow(
    sheetId,
    sheetName,
    sheetRowId,
    values
) {
    const range = `${sheetName}!A${sheetRowId}`;

    await sheetsClient.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range,
        valueInputOption: "RAW",
        requestBody: {
            values: [values]
        }
    });
}

export async function extendSheetHeader(
    sheetId,
    sheetName,
    existingHeader,
    newColumns
) {
    if (!newColumns.length) return;

    const updatedHeader = [...existingHeader, ...newColumns];

    await sheetsClient.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:${String.fromCharCode(64 + updatedHeader.length)}1`,
        valueInputOption: "RAW",
        requestBody: {
            values: [updatedHeader]
        }
    });

    console.log("📄 Sheet header extended:", newColumns);
}
