import type { Id } from "@convex/_generated/dataModel";
import * as FileSystem from "expo-file-system/legacy";

/**
 * Sends a picked photo to Convex file storage.
 * https://docs.expo.dev/versions/v57.0.0/sdk/filesystem/#filesystemuploadasyncurl-fileuri-options
 */
export async function uploadProfilePhoto(args: {
  uri: string;
  contentType: string;
  uploadUrl: string;
}): Promise<Id<"_storage">> {
  const result = await FileSystem.uploadAsync(args.uploadUrl, args.uri, {
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { "Content-Type": args.contentType },
  });
  if (result.status !== 200) {
    throw new Error("Upload failed");
  }
  const body = JSON.parse(result.body) as { storageId?: Id<"_storage"> };
  if (body.storageId === undefined) {
    throw new Error("Upload failed");
  }
  return body.storageId;
}
