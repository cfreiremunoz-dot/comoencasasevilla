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

  it("adds six blank team profiles to older saved page content", () => {
    const {
      teamTitle: _teamTitle,
      teamMembers: _teamMembers,
      ...legacyContent
    } = ABOUT_PAGE_DEFAULTS;
    const parsed = aboutPageContentSchema.parse(legacyContent);

    expect(parsed.teamTitle).toBe("Las personas detrás de ComoEnCasa");
    expect(parsed.teamMembers).toHaveLength(6);
  });

  it("accepts six editable team profiles", () => {
    const parsed = aboutPageContentSchema.safeParse(ABOUT_PAGE_DEFAULTS);

    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.teamMembers).toHaveLength(6);
  });

  it("rejects non-HTTPS team photo URLs", () => {
    const content = {
      ...ABOUT_PAGE_DEFAULTS,
      teamMembers: ABOUT_PAGE_DEFAULTS.teamMembers.map((member, index) =>
        index === 0 ? { ...member, image: "javascript:alert(1)" } : member,
      ),
    };

    expect(aboutPageContentSchema.safeParse(content).success).toBe(false);
  });
});
