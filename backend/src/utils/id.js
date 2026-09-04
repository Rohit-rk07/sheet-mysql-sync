import { randomUUID } from "crypto";

export function generateSyncId() {
    return randomUUID();
}
