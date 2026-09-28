import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { asUser, errorCode, makeBackend } from "./test.setup";

async function fan(email: string, name: string) {
  const t = makeBackend();
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", { email, name });
  });
  await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
  return { t, userId };
}

const request = {
  displayName: "Efua Boateng",
  bio: "Afro-soul from Accra.",
  note: "I want a home for songs that are not on a major playlist.",
};

describe("artistRequests", () => {
  it("stores one pending request and refuses a second until it is declined", async () => {
    const { t, userId } = await fan(
      "efua.boateng@kindredmail.com",
      "Efua Boateng"
    );
    const authed = asUser(t, userId);

    expect(await authed.query(api.artistRequests.getMine, {})).toMatchObject({
      status: "none",
      displayName: "Efua Boateng",
    });

    await authed.mutation(api.artistRequests.submit, request);
    const pending = await authed.query(api.artistRequests.getMine, {});
    expect(pending.status).toBe("pending");
    expect(pending.bio).toBe(request.bio);

    try {
      await authed.mutation(api.artistRequests.submit, request);
      throw new Error("expected a second submit to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }

    await t.run(async (ctx) => {
      const row = await ctx.db.query("artistRequests").first();
      if (row === null) {
        throw new Error("request missing");
      }
      await ctx.db.patch(row._id, {
        status: "declined",
        declineReason: "Need a public link",
        decidedAt: Date.now(),
      });
    });

    const declined = await authed.query(api.artistRequests.getMine, {});
    expect(declined).toMatchObject({
      status: "declined",
      declineReason: "Need a public link",
    });

    await authed.mutation(api.artistRequests.submit, {
      ...request,
      note: "Here is a link to the songs.",
    });
    const again = await authed.query(api.artistRequests.getMine, {});
    expect(again.status).toBe("pending");
    expect(again.note).toBe("Here is a link to the songs.");
  });

  it("refuses a new request after approval or when the profile is already an artist", async () => {
    const { t, userId } = await fan(
      "amaara.mensah@kindredmail.com",
      "Amaara Mensah"
    );
    const authed = asUser(t, userId);
    await authed.mutation(api.artistRequests.submit, {
      displayName: "Amaara Mensah",
      bio: "Highlife and choir.",
      note: "I already play live in Accra.",
    });

    await t.run(async (ctx) => {
      const row = await ctx.db.query("artistRequests").first();
      if (row === null) {
        throw new Error("request missing");
      }
      await ctx.db.patch(row._id, {
        status: "approved",
        decidedAt: Date.now(),
      });
    });

    try {
      await authed.mutation(api.artistRequests.submit, request);
      throw new Error("expected an approved profile to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }

    expect((await authed.query(api.artistRequests.getMine, {})).status).toBe(
      "approved"
    );

    const linkedUserId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "linked.artist@kindredmail.com",
        name: "Linked Artist",
      });
    });
    await asUser(t, linkedUserId).mutation(api.profiles.ensureProfile, {});
    await t.run(async (ctx) => {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_authUserId", (q) => q.eq("authUserId", linkedUserId))
        .unique();
      if (profile === null) {
        throw new Error("profile missing");
      }
      await ctx.db.insert("artists", {
        profileId: profile._id,
        name: "Linked Artist",
        handle: "linked-artist",
        bio: "Already on Kindred.",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
    });

    expect(
      (await asUser(t, linkedUserId).query(api.artistRequests.getMine, {}))
        .status
    ).toBe("approved");
    try {
      await asUser(t, linkedUserId).mutation(api.artistRequests.submit, {
        displayName: "Linked Artist",
        bio: "Already on Kindred.",
        note: "I want another profile.",
      });
      throw new Error("expected an existing artist to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }
  });

  it("gives the next fan a different handle when the name is taken", async () => {
    const first = await fan("efua.one@kindredmail.com", "Efua Boateng");
    await asUser(first.t, first.userId).mutation(
      api.artistRequests.submit,
      request
    );

    const secondUserId: Id<"users"> = await first.t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.two@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(first.t, secondUserId).mutation(
      api.profiles.ensureProfile,
      {}
    );
    await asUser(first.t, secondUserId).mutation(
      api.artistRequests.submit,
      request
    );

    const handles = await first.t.run(async (ctx) => {
      const rows = await ctx.db.query("artistRequests").collect();
      return rows.map((row) => row.handle).sort();
    });
    expect(handles).toEqual(["efua-boateng", "efua-boateng-2"]);
  });

  it("refuses an empty bio and a signed-out caller", async () => {
    const { t, userId } = await fan("fan@kindredmail.com", "Fan");

    try {
      await asUser(t, userId).mutation(api.artistRequests.submit, {
        ...request,
        bio: "   ",
      });
      throw new Error("expected an empty bio to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("INVALID");
    }

    try {
      await t.mutation(api.artistRequests.submit, request);
      throw new Error("expected a signed-out submit to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("UNAUTHENTICATED");
    }
  });
});
