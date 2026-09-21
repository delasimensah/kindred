import { COLORS, FONT_FAMILIES, RADII, TEXT_SECONDARY_OPACITY } from "../index";

describe("Kindred design tokens", () => {
  it("exports the locked Color Hunt palette", () => {
    expect(COLORS.page).toBe("#222831");
    expect(COLORS.surface).toBe("#393E46");
    expect(COLORS.primary).toBe("#FFD369");
    expect(COLORS.text).toBe("#EEEEEE");
    expect(COLORS.textOnPrimary).toBe("#222831");
    expect(TEXT_SECONDARY_OPACITY).toBe(0.6);
  });

  it("exports locked radii and font family names", () => {
    expect(RADII.input).toBe(10);
    expect(RADII.card).toBe(12);
    expect(RADII.button).toBe(12);
    expect(RADII.full).toBe(9999);
    expect(FONT_FAMILIES.ui).toBe("Satoshi");
    expect(FONT_FAMILIES.display).toBe("Clash Display");
  });
});
