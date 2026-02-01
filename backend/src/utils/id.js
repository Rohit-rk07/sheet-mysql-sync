import { randomUUID } from "crypto";

export function ensureSyncId(row) {
    if (!row._sync_id) {
        row._sync_id = randomUUID();
    }
    return row;
}
