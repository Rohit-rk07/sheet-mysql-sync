import { sheetsClient } from "../config/google.js";

/**
 * Reads raw values from a sheet
 */
export async function readSheetValues(sheetId, range) {
    const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range
    });

    return response.data.values || [];
}
export async function readHeader(sheetId, sheetName) {
    const [header] = await readSheetValues(sheetId, `${sheetName}!1:1`);
    return header;
}

export async function readRows(sheetId, sheetName) {
    return await readSheetValues(sheetId, `${sheetName}!2:1000`);
}
