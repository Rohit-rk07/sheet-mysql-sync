import { diffColumns } from "./columnDiff.service.js";
import { getDbColumns, addColumnsToDb } from "./schema.service.js";
import { extendSheetHeader } from "./sheetWrite.service.js";

export async function syncSchema({
    sheetHeader,
    sheetId,
    sheetName,
    tableName
}) {
    console.log("🚨 syncSchema CALLED", { tableName });

    const dbColumns = await getDbColumns(tableName);
    console.log("🧱 DB columns:", dbColumns);

    const { toAddInDb, toAddInSheet } =
        diffColumns(sheetHeader, dbColumns);

    console.log("🔍 Column diff:", {
        toAddInDb,
        toAddInSheet
    });

    if (toAddInDb.length) {
        await addColumnsToDb(tableName, toAddInDb);
    }

    if (toAddInSheet.length) {
        console.log("📄 Will add columns to sheet:", toAddInSheet);

        await extendSheetHeader(
            sheetId,
            sheetName,
            sheetHeader,
            toAddInSheet
        );
    }
}
