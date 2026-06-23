import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn (className utility)", () => {
  it("joins class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts", () => {
    // twMerge should pick the last one
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles undefined values", () => {
    expect(cn("a", undefined, "b")).toBe("a b");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles object syntax", () => {
    expect(cn({ "text-red": true, "text-blue": false })).toBe("text-red");
  });

  it("merges padding correctly", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("merges margin correctly", () => {
    expect(cn("m-2", "m-4")).toBe("m-4");
  });
});
