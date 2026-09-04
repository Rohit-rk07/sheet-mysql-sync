import { describe, it, expect } from "vitest";
import { dbRowToSheetRow } from "../src/utils/dbToSheetRow.js";

describe("dbRowToSheetRow", () => {
    it("maps DB row to sheet values in header order", () => {
        const header = ["name", "age"];
        const dbRow = { name: "Alice", age: "30", _sync_id: "abc" };

        const result = dbRowToSheetRow(header, dbRow);

        expect(result).toEqual(["Alice", "30"]);
    });

    it("returns empty string for missing columns", () => {
        const header = ["name", "age", "email"];
        const dbRow = { name: "Alice" };

        const result = dbRowToSheetRow(header, dbRow);

        expect(result).toEqual(["Alice", "", ""]);
    });

    it("handles null values", () => {
        const header = ["name", "age"];
        const dbRow = { name: "Alice", age: null };

        const result = dbRowToSheetRow(header, dbRow);

        expect(result).toEqual(["Alice", ""]);
    });
});
