import { describe, expect, it } from "vitest";
import { ABOUT_PAGE_DEFAULTS, aboutPageContentSchema } from "./about-page-content";

describe("about page content", () => {
  it("accepts the complete default page content", () => {
    expect(aboutPageContentSchema.safeParse(ABOUT_PAGE_DEFAULTS).success).toBe(true);
  });

  it("rejects incomplete content before it can be saved", () => {
    expect(aboutPageContentSchema.safeParse({ ...ABOUT_PAGE_DEFAULTS, title: "" }).success).toBe(
      false,
    );
  });

  it("rejects unsupported summary icons", () => {
    const content = {
      ...ABOUT_PAGE_DEFAULTS,
      summaryItems: [{ icon: "unknown", text: "Resumen" }],
    };
    expect(aboutPageContentSchema.safeParse(content).success).toBe(false);
  });
});
