import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export async function fileUrl(
  ctx: QueryCtx,
  fileId: Id<"files"> | undefined
): Promise<string | null> {
  if (fileId === undefined) {
    return null;
  }
  const file = await ctx.db.get(fileId);
  if (file === null) {
    return null;
  }
  return await ctx.storage.getUrl(file.storageId);
}
