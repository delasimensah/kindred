import { Ionicons } from "@expo/vector-icons";
import React from "react";

import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";

interface LibraryMessageScreenProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

const LibraryMessageScreen: React.FC<LibraryMessageScreenProps> = ({
  icon,
  title,
  subtitle,
}) => {
  return <CollectionEmptyState icon={icon} title={title} subtitle={subtitle} />;
};

export default LibraryMessageScreen;
