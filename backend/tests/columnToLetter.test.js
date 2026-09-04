import { describe, it, expect } from "vitest";
import { columnToLetter, parseRowIdFromRange } from "../src/utils/columnLetter.js";

describe("columnToLetter", () => {
    it("converts 1 to A", () => {
        expect(columnToLetter(1)).toBe("A");
    });

    it("converts 26 to Z", () => {
        expect(columnToLetter(26)).toBe("Z");
    });

    it("converts 27 to AA", () => {
        expect(columnToLetter(27)).toBe("AA");
    });

    it("converts 28 to AB", () => {
        expect(columnToLetter(28)).toBe("AB");
    });

    it("converts 52 to AZ", () => {
        expect(columnToLetter(52)).toBe("AZ");
    });

    it("converts 53 to BA", () => {
        expect(columnToLetter(53)).toBe("BA");
    });

    it("converts 702 to ZZ", () => {
        expect(columnToLetter(702)).toBe("ZZ");
    });

    it("converts 703 to AAA", () => {
        expect(columnToLetter(703)).toBe("AAA");
    });
});

describe("parseRowIdFromRange", () => {
    it("extracts row number from Sheet1!A5:F5", () => {
        expect(parseRowIdFromRange("Sheet1!A5:F5")).toBe(5);
    });

    it("extracts row number with quoted sheet name 'My Sheet'!A12:Z12", () => {
        expect(parseRowIdFromRange("'My Sheet'!A12:Z12")).toBe(12);
    });

    it("extracts row number from single cell range Sheet1!A100", () => {
        expect(parseRowIdFromRange("Sheet1!A100")).toBe(100);
    });

    it("returns null for invalid inputs", () => {
        expect(parseRowIdFromRange("")).toBeNull();
        expect(parseRowIdFromRange(null)).toBeNull();
        expect(parseRowIdFromRange("invalid_range")).toBeNull();
    });
});
