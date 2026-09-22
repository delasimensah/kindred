import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    authUserId: v.id("users"),
    displayName: v.string(),
    genres: v.array(v.string()),
    timezone: v.optional(v.string()),
    isAdmin: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_authUserId", ["authUserId"])
    .index("by_isAdmin", ["isAdmin"]),
});
