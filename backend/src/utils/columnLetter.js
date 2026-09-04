/**
 * Converts a 1-based column number to a Sheet column letter.
 * e.g., 1 -> A, 26 -> Z, 27 -> AA, 702 -> ZZ, 703 -> AAA
 */
export function columnToLetter(colNum) {
    let letter = "";
    let num = colNum;

    while (num > 0) {
        const remainder = (num - 1) % 26;
        letter = String.fromCharCode(65 + remainder) + letter;
        num = Math.floor((num - 1) / 26);
    }

    return letter;
}

/**
 * Parses the 1-based row number from a Google Sheets range string.
 * e.g. "Sheet1!A5:F5" -> 5, "'Data'!A12" -> 12
 */
export function parseRowIdFromRange(rangeString) {
    if (!rangeString || typeof rangeString !== "string") return null;
    const match = rangeString.match(/![A-Za-z]+(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}
