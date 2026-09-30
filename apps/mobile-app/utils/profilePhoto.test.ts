import type { Id } from "@convex/_generated/dataModel";
import * as FileSystem from "expo-file-system/legacy";

import { uploadProfilePhoto } from "./profilePhoto";

describe("uploadProfilePhoto", () => {
  it("returns the storage id from a finished upload", async () => {
    (FileSystem.uploadAsync as jest.Mock).mockResolvedValue({
      status: 200,
      body: JSON.stringify({ storageId: "storage-1" }),
    });

    await expect(
      uploadProfilePhoto({
        uri: "file:///photo.jpg",
        contentType: "image/jpeg",
        uploadUrl: "https://upload.example/photo",
      })
    ).resolves.toBe("storage-1" as Id<"_storage">);
  });
});
