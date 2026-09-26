import type { Id } from "@convex/_generated/dataModel";

export async function uploadStudioFile(args: {
  file: File;
  generateUrl: () => Promise<string>;
  register: (payload: {
    storageId: Id<"_storage">;
    contentType: string;
    sizeBytes: number;
  }) => Promise<Id<"files">>;
}): Promise<Id<"files">> {
  const uploadUrl = await args.generateUrl();
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": args.file.type || "application/octet-stream" },
    body: args.file,
  });
  if (!result.ok) {
    throw new Error("Upload failed");
  }
  const { storageId } = (await result.json()) as {
    storageId: Id<"_storage">;
  };
  return await args.register({
    storageId,
    contentType: args.file.type || "application/octet-stream",
    sizeBytes: args.file.size,
  });
}
