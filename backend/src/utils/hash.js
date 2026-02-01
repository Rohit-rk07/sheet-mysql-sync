import crypto from "crypto";

export function hashRow(row) {
    return crypto
        .createHash("sha256")
        .update(JSON.stringify(row))
        .digest("hex");
}
