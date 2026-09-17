import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Thin scaffold schema: Convex Auth tables plus a profile stub.
 * Product catalog tables land after workshop Convex cloud + schema growth from system design.
 */
export default defineSchema({
  ...authTables,
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
  }).index("by_userId", ["userId"]),
});
