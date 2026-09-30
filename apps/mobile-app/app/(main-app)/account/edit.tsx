import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";

import { EditProfileScreen, SkeletonCard, VStack } from "@/components";
import { uploadProfilePhoto } from "@/utils";

const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

/**
 * A fan picks a photo from their library and saves their display name.
 * The email on the screen is the sign-in address and is not editable.
 * https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/
 */
const EditProfileRoute = () => {
  const router = useRouter();
  const me = useQuery(api.profiles.getMe, {});
  const setDisplayName = useMutation(api.profiles.setDisplayName);
  const generateAvatarUploadUrl = useMutation(
    api.profiles.generateAvatarUploadUrl
  );
  const saveAvatar = useMutation(api.profiles.saveAvatar);
  const [savingName, setSavingName] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (me === undefined || me === null) {
    return (
      <VStack
        spacing="lg"
        padding="lg"
        className="flex-1 bg-page"
        accessibilityLabel="Loading profile"
      >
        <SkeletonCard width={88} height={88} radius={44} />
        <SkeletonCard width={120} height={16} radius={6} />
        <SkeletonCard width={320} height={52} radius={16} />
        <SkeletonCard width={120} height={16} radius={6} />
        <SkeletonCard width={320} height={52} radius={16} />
        <SkeletonCard width={320} height={52} radius={26} />
      </VStack>
    );
  }

  const onChangePhoto = () => {
    setNotice(null);
    void ImagePicker.requestMediaLibraryPermissionsAsync()
      .then(async (permission) => {
        if (!permission.granted) {
          setNotice("Kindred needs photo access to set your picture.");
          return;
        }
        const picked = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (picked.canceled || picked.assets[0] === undefined) {
          return;
        }
        const asset = picked.assets[0];
        const contentType = asset.mimeType ?? "image/jpeg";
        const sizeBytes = asset.fileSize ?? 0;
        if (!contentType.startsWith("image/")) {
          setNotice("Choose an image.");
          return;
        }
        if (sizeBytes <= 0 || sizeBytes > PHOTO_MAX_BYTES) {
          setNotice("Photo must be 10MB or smaller.");
          return;
        }
        setSavingPhoto(true);
        try {
          const uploadUrl = await generateAvatarUploadUrl({});
          const storageId = await uploadProfilePhoto({
            uri: asset.uri,
            contentType,
            uploadUrl,
          });
          await saveAvatar({ storageId, contentType, sizeBytes });
        } finally {
          setSavingPhoto(false);
        }
      })
      .catch(() => {
        setSavingPhoto(false);
        setNotice("The photo did not save.");
      });
  };

  return (
    <EditProfileScreen
      displayName={me.displayName}
      email={me.email}
      avatarUrl={me.avatarUrl}
      savingName={savingName}
      savingPhoto={savingPhoto}
      notice={notice}
      onChangePhoto={onChangePhoto}
      onSaveName={(displayName) => {
        setSavingName(true);
        setNotice(null);
        void setDisplayName({ displayName })
          .then(() => {
            router.back();
          })
          .catch(() => {
            setNotice("The name did not save.");
            setSavingName(false);
          });
      }}
    />
  );
};

export default EditProfileRoute;
