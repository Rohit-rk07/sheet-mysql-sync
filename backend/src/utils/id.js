import { randomUUID } from "crypto";
import { v4 as uuidv4 } from "uuid";


export function ensureSyncId(row) {
    if (!row._sync_id) {
        row._sync_id = randomUUID();
    }
    return row;
}

export function generateSyncId() {
    return uuidv4();
}
