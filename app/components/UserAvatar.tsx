import React from "react";
import { Image } from "react-native";

export default function UserAvatar({
  uri,
  size = 56,
}: {
  uri: string;
  size?: number;
}) {
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="cover"
    />
  );
}
