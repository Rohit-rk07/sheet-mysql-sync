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
    console.log("🔍 readHeader called with:", {
        sheetId,
        sheetName
    });

    const res = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:ZZ1`
    });

    return res.data.values?.[0] ?? [];
}




export async function readRows(sheetId, sheetName) {
    const res = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A2:ZZ`
    });

    const rows = res.data.values || [];

    return rows.map((values, index) => ({
        sheetRowId: index + 2,
        values
    }));
}
