import { parseExpiry } from "#Utils/time.util";
import { describe, it, expect } from "vitest";

describe("TimeUtil", () => {
  it("Should correctly convert seconds to milliseconds", () => {
    const timeString = "15m";

    expect(parseExpiry(timeString)).toBe(900000);
  });

  it("Should throw on invalid format", () => {
    expect(() => parseExpiry("invalid")).toThrow();
  });
});
