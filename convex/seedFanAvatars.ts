import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";

type FanPhoto = {
  email: string;
  photographer: string;
  page: string;
  photoId: string;
};

const WOMEN = [
  [
    "Prince Akachi",
    "smiling-woman-wearing-turban-i2hoD-C2RUA",
    "1530785602389-07594beb8b73",
  ],
  [
    "Leon ellDOT",
    "woman-wearing-black-shirt-standing-in-front-of-red-wall-f6HbVnGtNnY",
    "1523824921871-d6f1a15151f1",
  ],
  [
    "Jessica Felicio",
    "smiling-woman-wearing-black-top-YEbFUPYfUlo",
    "1527201987695-67c06571957e",
  ],
  [
    "Divine Effiong",
    "woman-with-green-and-white-flower-on-ear-h1lA3N5wb8M",
    "1593351799227-75df2026356b",
  ],
  [
    "William Boateng",
    "a-person-with-earrings-lG8E7KT7Elk",
    "1669040084821-097235fe53ff",
  ],
  [
    "Ben Masora",
    "woman-with-black-hair-and-red-lipstick-Vw1Z9vaOpUA",
    "1628682814595-a3f0816b25ff",
  ],
  [
    "Prince Akachi",
    "woman-wearing-orange-and-black-head-dress-V6iX4MiOCyY",
    "1532076904124-d4e8fe7fbbec",
  ],
  [
    "Jeffery Erhunse",
    "woman-in-white-and-red-shirt-vp9mRauo68c",
    "1589156191108-c762ff4b96ab",
  ],
  [
    "Jessica Felicio",
    "a-woman-with-an-afro-is-looking-at-the-camera-_cvwXhGqG-o",
    "1519699047748-de8e457a634e",
  ],
  [
    "Jabari Timothy",
    "a-woman-in-a-white-shirt-is-posing-for-a-picture-DpfkkL1FD20",
    "1653333438514-9ce5a7551cfb",
  ],
  [
    "Jabari Timothy",
    "a-woman-wearing-a-hat-q1zcvHgXa5w",
    "1658497714148-eb009d3ea195",
  ],
  [
    "Jabari Timothy",
    "a-woman-with-curly-hair-EsnPE1B_jHI",
    "1656473031949-5541282f05a4",
  ],
  [
    "Gideon Hezekiah",
    "woman-in-white-tank-top-6oU5SYnjfMQ",
    "1613730317928-246094cb6a82",
  ],
  [
    "Ato Aikins",
    "woman-in-green-and-gold-crown-gEVelFtUjfc",
    "1590670796065-5c2469672e18",
  ],
  [
    "Nana Kwame",
    "woman-in-yellow-and-orange-hijab-VEWUZkWnGL4",
    "1588578929512-82de8ae1e8df",
  ],
  [
    "Stephen Tettey Atsu",
    "a-woman-with-an-afro-standing-in-front-of-a-wall-kzyjC4k8rCM",
    "1698116522682-f5c454648d5a",
  ],
  [
    "Stephen Tettey Atsu",
    "a-woman-in-a-blue-shirt-posing-for-a-picture-fMVLsEuNOFk",
    "1721602327245-9d1833131243",
  ],
  [
    "Ato Aikins",
    "a-woman-in-a-white-shirt-is-posing-for-a-picture-70OAYm5k8hs",
    "1671708926494-3ce4d55b761f",
  ],
  [
    "Abraham Eli",
    "smiling-woman-in-pink-and-white-floral-dress-bgoaK6wHDEU",
    "1602058746304-2aeebbef0462",
  ],
  [
    "Dam Dam",
    "a-woman-with-an-afro-is-posing-for-a-picture-z7jkf4dTDYw",
    "1653907912812-304d8ce1823b",
  ],
  [
    "Stephen Tettey Atsu",
    "a-woman-wearing-a-colorful-dress-and-a-head-scarf-3YrGQ9W2sh0",
    "1709513641614-f1b8fd550761",
  ],
  [
    "Godfred Kwakye",
    "a-woman-in-a-white-top-is-posing-for-a-picture-o-n8QFH9Xcc",
    "1729727897698-49aa9de604a0",
  ],
] as const;

const MEN = [
  [
    "Dorrell Tibbs",
    "man-wearing-red-v-neck-shirt-close-up-photography-GntSiIMHyVM",
    "1565884280295-98eb83e41c65",
  ],
  [
    "Joseph Sintum",
    "a-man-in-a-yellow-jacket-sitting-at-a-table-x_cdCJ3bAJg",
    "1647316897340-6b6de5597c0f",
  ],
  [
    "OverlyOlu",
    "a-man-wearing-a-hat-KbIaoky4sh4",
    "1657356217561-6ed26b47e116",
  ],
  [
    "khalid Aminu",
    "a-man-wearing-a-green-jacket-and-a-red-and-green-hat-R0ipcguzRIU",
    "1712100743761-5e20dc82c44c",
  ],
  [
    "Elizeu Dias",
    "selective-focus-of-man-smiling-during-daytime-2EGNqazbAMk",
    "1522529599102-193c0d76b5b6",
  ],
  [
    "Jassir Jonis",
    "man-in-black-crew-neck-shirt-QWa0TIUW638",
    "1587064712555-6e206484699b",
  ],
  [
    "Emmanuel Chilaka",
    "a-man-with-a-beard-and-glasses-posing-for-a-picture-5tqiaBDE3pg",
    "1654155427842-a4a249bf693e",
  ],
  [
    "Prince Akachi",
    "man-taking-selfie-outdoors-icu-D9rYM4w",
    "1531901599143-df5010ab9438",
  ],
  [
    "Veroll Sterling",
    "man-in-black-turtleneck-sweater-AGlO2jlVE4c",
    "1605980776566-0486c3ac7617",
  ],
  [
    "Justin Essah",
    "man-in-black-turtleneck-sweater-0xqmwDnYnEc",
    "1584119164246-461d43e9bab3",
  ],
  [
    "Dorrell Tibbs",
    "man-in-black-crew-neck-shirt-gisFZKWpKQ4",
    "1596580817363-a4a8f67d4bc8",
  ],
  [
    "Dorrell Tibbs",
    "man-in-black-v-neck-shirt-cokfziNs91A",
    "1606459431839-90b942dc3754",
  ],
  [
    "Joseph Agboola",
    "a-man-with-his-arms-crossed-vh7Y_FguZn8",
    "1665904176973-056b4d5d10c7",
  ],
  [
    "Divine Effiong",
    "man-in-black-crew-neck-t-shirt-O1lbOY0H5rc",
    "1625181796571-7f0d4571ab12",
  ],
  [
    "Kingsley Osei-Abrah",
    "man-in-white-and-black-crew-neck-t-shirt-F_1ww3Y6F_c",
    "1612213993024-b0ed04dfb248",
  ],
  [
    "Pharaoh Fontain",
    "a-man-with-dreadlocks-and-a-beanie-smiling-9WypIUPHxwU",
    "1684860078704-5b07ac577c2e",
  ],
  [
    "Adeboro Odunlami",
    "man-wearing-grey-shirt-during-daytime-ZfanC6Eg9nE",
    "1542276677-0aab41a6190f",
  ],
  [
    "Prince Akachi",
    "man-in-white-dress-shirt-s6tVlDVKz38",
    "1533108344127-a586d2b02479",
  ],
  [
    "Qwerqu McBrew",
    "man-in-white-crew-neck-t-shirt-CmXkpIPnkqE",
    "1623487906320-9348195f97b2",
  ],
] as const;

const FAMILIES = [
  "Mensah",
  "Owusu",
  "Boateng",
  "Adeyemi",
  "Okonkwo",
  "Diallo",
  "Bello",
  "Quaye",
  "Addo",
  "Sarpong",
];

function emailsFor(given: string[]): string[] {
  return given.flatMap((first) =>
    FAMILIES.map((last) => `${first}.${last}@kindred.example`.toLowerCase())
  );
}

/** Kofi Sarpong is left without a photo so the initials fallback stays visible. */
export function fanPhotos(): FanPhoto[] {
  const women = [
    "akosua.frimpong@kindred.example",
    "efua.boateng@kindred.example",
    ...emailsFor(["Abena", "Akua"]),
  ];
  const men = emailsFor(["Kwame", "Kofi"]);
  const pair = (
    emails: string[],
    photos: readonly (readonly [string, string, string])[]
  ) =>
    photos.map(([photographer, slug, photoId], index) => ({
      email: emails[index] ?? "",
      photographer,
      page: `https://unsplash.com/photos/${slug}`,
      photoId,
    }));
  return [...pair(women, WOMEN), ...pair(men, MEN)];
}

export const attachFanAvatar = internalMutation({
  args: {
    email: v.string(),
    storageId: v.id("_storage"),
    contentType: v.string(),
    sizeBytes: v.number(),
    credit: v.string(),
    sourceUrl: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    const profile =
      user === null
        ? null
        : await ctx.db
            .query("profiles")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
            .unique();
    if (profile === null || profile.avatarFileId !== undefined) {
      await ctx.storage.delete(args.storageId);
      return false;
    }
    const fileId = await ctx.db.insert("files", {
      storageId: args.storageId,
      kind: "avatar",
      ownerProfileId: profile._id,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
      credit: args.credit,
      sourceUrl: args.sourceUrl,
      createdAt: Date.now(),
    });
    await ctx.db.patch(profile._id, { avatarFileId: fileId });
    return true;
  },
});

/**
 * What: 160px Unsplash portraits for 41 of the 42 seed fan profiles.
 * Where: Unsplash License photos, photographer credited on each file row.
 * Rights: Unsplash License; free to use without permission.
 * How: `npx convex run seedFanAvatars:fanAvatars` after the seed accounts exist.
 * Out: artist and admin logins, and any fan who already set a photo.
 */
export const fanAvatars = internalAction({
  args: {},
  returns: v.object({ attached: v.number() }),
  handler: async (ctx): Promise<{ attached: number }> => {
    let attached = 0;
    for (const photo of fanPhotos()) {
      const response = await fetch(
        `https://images.unsplash.com/photo-${photo.photoId}?w=160&h=160&fit=crop&crop=faces&q=70&fm=jpg`
      );
      if (!response.ok) {
        throw new Error(`Fan photo fetch failed for ${photo.email}`);
      }
      const blob = await response.blob();
      const storageId = await ctx.storage.store(blob);
      const done: boolean = await ctx.runMutation(
        internal.seedFanAvatars.attachFanAvatar,
        {
          email: photo.email,
          storageId,
          contentType: blob.type || "image/jpeg",
          sizeBytes: blob.size,
          credit: `Photo: ${photo.photographer} / Unsplash`,
          sourceUrl: photo.page,
        }
      );
      if (done) {
        attached += 1;
      }
    }
    return { attached };
  },
});
