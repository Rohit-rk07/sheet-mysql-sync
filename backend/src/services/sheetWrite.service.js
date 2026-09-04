import { sheetsClient } from "../config/google.js";
import logger from "../utils/logger.js";

import { columnToLetter, parseRowIdFromRange } from "../utils/columnLetter.js";

export { columnToLetter, parseRowIdFromRange };

/**
 * Appends a new row to the Google Sheet and returns the assigned 1-based row number.
 */
export async function appendSheetRow(sheetId, sheetName, values) {
    const range = `${sheetName}!A:A`;

    const res = await sheetsClient.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
            values: [values]
        }
    });

    const updatedRange = res.data.updates?.updatedRange;
    const sheetRowId = parseRowIdFromRange(updatedRange);

    logger.info("Sheet row appended", { range: updatedRange, sheetRowId });
    return sheetRowId;
}

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
    const endCol = columnToLetter(updatedHeader.length);

    await sheetsClient.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:${endCol}1`,
        valueInputOption: "RAW",
        requestBody: {
            values: [updatedHeader]
        }
    });

    logger.info("Sheet header extended", { newColumns });
}
