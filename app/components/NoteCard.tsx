import React from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

export type NoteCardProps = {
  note: {
    id: number;
    imagePath: string;
    title: string;
    description: string;
  };
  onPress: () => void;
};

const NoteCard = ({ note, onPress }: NoteCardProps) => (
  <TouchableOpacity
    key={note.id}
    onPress={onPress}
    activeOpacity={0.85}
    className="p-4"
  >
    <View className="flex-col rounded-xl xl:flex-row xl:items-start bg-white shadow-sm overflow-hidden">
      <ImageBackground
        source={{ uri: note.imagePath }}
        className="w-full aspect-[16/9] xl:w-1/3"
        resizeMode="cover"
      />
      <View className="w-full xl:w-2/3 grow flex-col items-stretch justify-center gap-1 p-4">
        <Text className="text-primary text-lg font-bold leading-tight tracking-[-0.015em]">
          {note.title}
        </Text>
        <View className="flex-row items-end gap-3 justify-between mt-1">
          <Text className="text-accent text-base font-normal leading-normal">
            {note.description.length > 80
              ? note.description.slice(0, 80) + "..."
              : note.description}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default NoteCard;
