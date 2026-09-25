import { isReactionEmoji, REACTION_EMOJIS } from "../reactions";

describe("reactions", () => {
  it("keeps the five now-playing emoji", () => {
    expect(REACTION_EMOJIS).toEqual(["🔥", "❤️", "🙌", "👏", "✨"]);
    expect(isReactionEmoji("🔥")).toBe(true);
    expect(isReactionEmoji("👍")).toBe(false);
  });
});
