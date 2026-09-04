import { describe, it, expect } from "vitest";
import { diffColumns } from "../src/services/columnDiff.service.js";

describe("diffColumns", () => {
    it("detects columns to add in DB", () => {
        const sheetHeader = ["name", "age", "email"];
        const dbColumns = ["name", "age"];

        const result = diffColumns(sheetHeader, dbColumns);

        expect(result.toAddInDb).toEqual(["email"]);
        expect(result.toAddInSheet).toEqual([]);
    });

    it("detects columns to add in Sheet", () => {
        const sheetHeader = ["name"];
        const dbColumns = ["name", "phone"];

        const result = diffColumns(sheetHeader, dbColumns);

        expect(result.toAddInDb).toEqual([]);
        expect(result.toAddInSheet).toEqual(["phone"]);
    });

    it("detects both directions", () => {
        const sheetHeader = ["name", "email"];
        const dbColumns = ["name", "phone"];

        const result = diffColumns(sheetHeader, dbColumns);

        expect(result.toAddInDb).toEqual(["email"]);
        expect(result.toAddInSheet).toEqual(["phone"]);
    });

    it("excludes internal columns (_sync_id, updated_at)", () => {
        const sheetHeader = ["name", "_sync_id"];
        const dbColumns = ["name", "_sync_id", "updated_at"];

        const result = diffColumns(sheetHeader, dbColumns);

        expect(result.toAddInDb).toEqual([]);
        expect(result.toAddInSheet).toEqual([]);
    });

    it("returns empty arrays when perfectly in sync", () => {
        const sheetHeader = ["name", "age"];
        const dbColumns = ["name", "age", "_sync_id", "updated_at"];

        const result = diffColumns(sheetHeader, dbColumns);

        expect(result.toAddInDb).toEqual([]);
        expect(result.toAddInSheet).toEqual([]);
    });
});
