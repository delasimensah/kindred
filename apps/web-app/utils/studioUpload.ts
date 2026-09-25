import type { Id } from "@convex/_generated/dataModel";

export async function uploadStudioImage(args: {
  file: File;
  generateUrl: () => Promise<string>;
  save: (payload: {
    storageId: Id<"_storage">;
    contentType: string;
    sizeBytes: number;
  }) => Promise<null>;
}): Promise<void> {
  const uploadUrl = await args.generateUrl();
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": args.file.type },
    body: args.file,
  });
  if (!result.ok) {
    throw new Error("Upload failed");
  }
  const { storageId } = (await result.json()) as {
    storageId: Id<"_storage">;
  };
  await args.save({
    storageId,
    contentType: args.file.type,
    sizeBytes: args.file.size,
  });
}
