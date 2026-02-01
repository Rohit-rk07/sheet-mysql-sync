import crypto from "crypto";


export function generateRowHash(rowObj) {
    return crypto
        .createHash("sha256")
        .update(JSON.stringify(rowObj))
        .digest("hex");
}


