import { describe, it, expect } from "vitest";
import { normalizeRows } from "../src/utils/normalize.js";

describe("normalizeRows", () => {
    it("maps values to header columns", () => {
        const header = ["name", "age"];
        const rows = [{ sheetRowId: 2, values: ["Alice", "30"] }];

        const result = normalizeRows(header, rows);

        expect(result).toEqual([
            { _sheet_row_id: 2, name: "Alice", age: "30" }
        ]);
    });

    it("sets missing values to null", () => {
        const header = ["name", "age", "email"];
        const rows = [{ sheetRowId: 2, values: ["Alice"] }];

        const result = normalizeRows(header, rows);

        expect(result[0].age).toBeNull();
        expect(result[0].email).toBeNull();
    });

    it("handles empty rows array", () => {
        const result = normalizeRows(["name"], []);
        expect(result).toEqual([]);
    });

    it("handles multiple rows", () => {
        const header = ["name"];
        const rows = [
            { sheetRowId: 2, values: ["Alice"] },
            { sheetRowId: 3, values: ["Bob"] }
        ];

        const result = normalizeRows(header, rows);

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("Alice");
        expect(result[1].name).toBe("Bob");
        expect(result[1]._sheet_row_id).toBe(3);
    });
});
