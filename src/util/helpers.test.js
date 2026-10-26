import { describe, expect, test } from "vitest";
import { slugify, timeAgo } from "./helpers";

describe("timeAgo", () => {
  const now = new Date("2026-10-26T12:00:00Z").getTime();

  test("describes recent and older times", () => {
    expect(timeAgo(now - 10 * 1000, now)).toBe("just now");
    expect(timeAgo(now - 5 * 60 * 1000, now)).toBe("5 minutes ago");
    expect(timeAgo(now - 3 * 60 * 60 * 1000, now)).toBe("3 hours ago");
    expect(timeAgo(now - 24 * 60 * 60 * 1000, now)).toBe("yesterday");
    expect(timeAgo(now - 14 * 24 * 60 * 60 * 1000, now)).toBe("2 weeks ago");
  });
});

describe("slugify", () => {
  test("makes a safe file name", () => {
    expect(slugify("How was my talk?")).toBe("how-was-my-talk");
    expect(slugify("  Café Feedback!! ")).toBe("cafe-feedback");
    expect(slugify("???")).toBe("suggestify");
  });
});
