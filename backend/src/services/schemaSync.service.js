import { diffColumns } from "./columnDiff.service.js";
import { getDbColumns, addColumnsToDb } from "./schema.service.js";
import { extendSheetHeader } from "./sheetWrite.service.js";
import logger from "../utils/logger.js";

export async function syncSchema({
    sheetHeader,
    sheetId,
    sheetName,
    tableName
}) {
    logger.debug("syncSchema called", { tableName });

    const dbColumns = await getDbColumns(tableName);
    logger.debug("DB columns retrieved", { columns: dbColumns });

    const { toAddInDb, toAddInSheet } =
        diffColumns(sheetHeader, dbColumns);

    if (toAddInDb.length || toAddInSheet.length) {
        logger.info("Column diff detected", { toAddInDb, toAddInSheet });
    }

    if (toAddInDb.length) {
        await addColumnsToDb(tableName, toAddInDb);
    }

    if (toAddInSheet.length) {
        logger.info("Extending sheet header", { newColumns: toAddInSheet });

        await extendSheetHeader(
            sheetId,
            sheetName,
            sheetHeader,
            toAddInSheet
        );
    }

    // Return the updated unified header for downstream sync operations in this cycle
    return [...sheetHeader, ...toAddInSheet];
}
