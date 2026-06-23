import { describe, it, expect } from "vitest";

describe("Saved Analysis - Validation helpers", () => {
  function validateSignup(email: string, password: string): { valid: boolean; error?: string } {
    if (!email || !password) return { valid: false, error: "Email and password are required." };
    if (password.length < 6) return { valid: false, error: "Password must be at least 6 characters." };
    if (!email.includes("@")) return { valid: false, error: "Invalid email format." };
    return { valid: true };
  }

  // Matches real API implementation: analyses/route.ts
  function parsePagination(pageRaw: string | null, limitRaw: string | null) {
    const page = Math.max(1, parseInt(pageRaw ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(limitRaw ?? "20", 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  describe("signup validation", () => {
    it("rejects empty email", () => {
      expect(validateSignup("", "pass123").valid).toBe(false);
    });

    it("rejects empty password", () => {
      expect(validateSignup("a@b.com", "").valid).toBe(false);
    });

    it("rejects short password", () => {
      const r = validateSignup("a@b.com", "ab12");
      expect(r.valid).toBe(false);
      expect(r.error).toContain("6");
    });

    it("accepts valid signup", () => {
      expect(validateSignup("a@b.com", "validpass123").valid).toBe(true);
    });

    it("rejects invalid email", () => {
      expect(validateSignup("notanemail", "pass123").valid).toBe(false);
    });
  });

  describe("pagination parsing (matches API route)", () => {
    it("defaults to page 1, limit 20", () => {
      expect(parsePagination(null, null)).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    it("parses explicit values", () => {
      expect(parsePagination("3", "10")).toEqual({ page: 3, limit: 10, skip: 20 });
    });

    it("clamps page to minimum 1", () => {
      expect(parsePagination("0", "20")).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    it("clamps limit between 1 and 50", () => {
      const r1 = parsePagination("1", "0");
      expect(r1.limit).toBe(1);
      const r2 = parsePagination("1", "100");
      expect(r2.limit).toBe(50);
    });

    it("calculates skip correctly", () => {
      expect(parsePagination("5", "10")).toEqual({ page: 5, limit: 10, skip: 40 });
    });
  });
});
