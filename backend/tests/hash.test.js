import { describe, it, expect } from "vitest";
import { generateRowHash } from "../src/utils/hash.js";

describe("generateRowHash", () => {
    it("produces consistent hash for same data", () => {
        const row = { name: "Alice", age: "30" };
        const hash1 = generateRowHash(row);
        const hash2 = generateRowHash(row);
        expect(hash1).toBe(hash2);
    });

    it("produces different hash for different data", () => {
        const row1 = { name: "Alice", age: "30" };
        const row2 = { name: "Bob", age: "25" };
        expect(generateRowHash(row1)).not.toBe(generateRowHash(row2));
    });

    it("strips _sheet_row_id from hash calculation", () => {
        const row1 = { name: "Alice", _sheet_row_id: 2 };
        const row2 = { name: "Alice", _sheet_row_id: 5 };
        expect(generateRowHash(row1)).toBe(generateRowHash(row2));
    });

    it("strips _sync_id from hash calculation", () => {
        const row1 = { name: "Alice", _sync_id: "abc-123" };
        const row2 = { name: "Alice", _sync_id: "xyz-789" };
        expect(generateRowHash(row1)).toBe(generateRowHash(row2));
    });

    it("strips updated_at from hash calculation", () => {
        const row1 = { name: "Alice", updated_at: "2025-01-01" };
        const row2 = { name: "Alice", updated_at: "2025-06-15" };
        expect(generateRowHash(row1)).toBe(generateRowHash(row2));
    });

    it("produces same hash regardless of which internal fields are present", () => {
        const sheetRow = { name: "Alice", _sheet_row_id: 2 };
        const dbRow = { name: "Alice", _sync_id: "abc", updated_at: "2025-01-01" };
        expect(generateRowHash(sheetRow)).toBe(generateRowHash(dbRow));
    });

    it("produces identical hash regardless of key order", () => {
        const row1 = { name: "Alice", age: "30", city: "New York" };
        const row2 = { city: "New York", name: "Alice", age: "30" };
        expect(generateRowHash(row1)).toBe(generateRowHash(row2));
    });

    it("produces identical hash for numbers vs numeric strings", () => {
        const row1 = { name: "Alice", age: 30 };
        const row2 = { name: "Alice", age: "30" };
        expect(generateRowHash(row1)).toBe(generateRowHash(row2));
    });

    it("produces identical hash for null vs empty string", () => {
        const row1 = { name: "Alice", note: null };
        const row2 = { name: "Alice", note: "" };
        expect(generateRowHash(row1)).toBe(generateRowHash(row2));
    });

    it("trims whitespace from string values", () => {
        const row1 = { name: "Alice " };
        const row2 = { name: "Alice" };
        expect(generateRowHash(row1)).toBe(generateRowHash(row2));
    });

    it("normalizes Date objects to ISO strings", () => {
        const d = new Date("2026-01-01T00:00:00.000Z");
        const row1 = { date: d };
        const row2 = { date: "2026-01-01T00:00:00.000Z" };
        expect(generateRowHash(row1)).toBe(generateRowHash(row2));
    });

    it("returns a 64-char hex string (SHA-256)", () => {
        const hash = generateRowHash({ name: "test" });
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
});
