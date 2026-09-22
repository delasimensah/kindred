import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const ONBOARDING_AVATARS = [
  {
    handle: "amaara",
    photographer: "Prince Akachi",
    page: "https://unsplash.com/photos/portrait-photography-of-woman-RcqKOjX0ZHE",
    fetchUrl:
      "https://images.unsplash.com/photo-1531300185372-b7cbe2eddf0b?w=256&h=256&fit=crop&crop=faces&q=70&fm=jpg",
  },
  {
    handle: "kweku-darko",
    photographer: "Prince Akachi",
    page: "https://unsplash.com/photos/shallow-focus-photo-of-man-A07yNZW0iyk",
    fetchUrl:
      "https://images.unsplash.com/photo-1533108165347-036ec233d7ec?w=256&h=256&fit=crop&crop=faces&q=70&fm=jpg",
  },
  {
    handle: "sela-okoro",
    photographer: "Ayo Ogunseinde",
    page: "https://unsplash.com/photos/woman-wearing-black-shirt-sibVwORYqs0",
    fetchUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=256&h=256&fit=crop&crop=faces&q=70&fm=jpg",
  },
  {
    handle: "tewa-nkrumah",
    photographer: "Ayo Ogunseinde",
    page: "https://unsplash.com/photos/woman-wearing-white-shirt-standing-RrD8ypt8cjY",
    fetchUrl:
      "https://images.unsplash.com/photo-1500336624523-d727130c3328?w=256&h=256&fit=crop&crop=faces&q=70&fm=jpg",
  },
  {
    handle: "leye-ade",
    photographer: "Prince Akachi",
    page: "https://unsplash.com/photos/portrait-of-man-looking-up-JGfx1AKAaNA",
    fetchUrl:
      "https://images.unsplash.com/photo-1531299983330-093763e1d963?w=256&h=256&fit=crop&crop=faces&q=70&fm=jpg",
  },
] as const;

/**
 * What: 256px Unsplash people portraits for the five onboarding acts.
 * Where: Unsplash License photos (Prince Akachi, Ayo Ogunseinde).
 * Rights: Unsplash License; credit stored on the file row.
 * How: `npx convex run seedAvatars:onboardingAvatars` fetches Unsplash into Convex (no repo copies).
 * Out: no covers, audio, or extra artists (KIND-48).
 */
export const onboardingAvatars = internalAction({
  args: {},
  returns: v.object({ upserted: v.number(), avatars: v.number() }),
  handler: async (ctx): Promise<{ upserted: number; avatars: number }> => {
    const { upserted }: { upserted: number } = await ctx.runMutation(
      internal.seed.onboardingArtists,
      {}
    );
    let avatars = 0;
    for (const photo of ONBOARDING_AVATARS) {
      const response = await fetch(photo.fetchUrl);
      if (!response.ok) {
        throw new Error(`Avatar fetch failed for ${photo.handle}`);
      }
      const blob = await response.blob();
      const storageId = await ctx.storage.store(blob);
      await ctx.runMutation(internal.seed.attachOnboardingAvatar, {
        handle: photo.handle,
        storageId,
        contentType: blob.type || "image/jpeg",
        sizeBytes: blob.size,
        credit: `Photo: ${photo.photographer} / Unsplash`,
        sourceUrl: photo.page,
      });
      avatars += 1;
    }
    return { upserted, avatars };
  },
});
