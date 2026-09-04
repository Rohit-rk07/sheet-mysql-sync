import { describe, it, expect } from "vitest";
import { validateIdentifier, safeIdentifier } from "../src/utils/sanitize.js";

describe("validateIdentifier", () => {
    it("accepts valid simple names", () => {
        expect(() => validateIdentifier("users")).not.toThrow();
        expect(() => validateIdentifier("sheet1_data")).not.toThrow();
        expect(() => validateIdentifier("_sync_id")).not.toThrow();
        expect(() => validateIdentifier("Column1")).not.toThrow();
    });

    it("rejects empty string", () => {
        expect(() => validateIdentifier("")).toThrow("non-empty string");
    });

    it("rejects null/undefined", () => {
        expect(() => validateIdentifier(null)).toThrow("non-empty string");
        expect(() => validateIdentifier(undefined)).toThrow("non-empty string");
    });

    it("rejects names starting with a digit", () => {
        expect(() => validateIdentifier("1column")).toThrow();
    });

    it("rejects names with spaces", () => {
        expect(() => validateIdentifier("user name")).toThrow();
    });

    it("rejects names with special characters", () => {
        expect(() => validateIdentifier("user@name")).toThrow();
        expect(() => validateIdentifier("user-name")).toThrow();
        expect(() => validateIdentifier("user.name")).toThrow();
    });

    it("rejects SQL injection attempts", () => {
        expect(() => validateIdentifier("test` DROP TABLE foo; --")).toThrow();
        expect(() => validateIdentifier("'; DROP TABLE users; --")).toThrow();
    });

    it("rejects names longer than 64 characters", () => {
        const longName = "a".repeat(65);
        expect(() => validateIdentifier(longName)).toThrow();
    });

    it("accepts names up to 64 characters", () => {
        const name = "a".repeat(64);
        expect(() => validateIdentifier(name)).not.toThrow();
    });
});

describe("safeIdentifier", () => {
    it("returns backtick-wrapped name", () => {
        expect(safeIdentifier("users")).toBe("`users`");
    });

    it("throws for invalid names", () => {
        expect(() => safeIdentifier("user name")).toThrow();
    });

    it("uses custom label in error message", () => {
        expect(() => safeIdentifier("bad name", "table name")).toThrow("table name");
    });
});
