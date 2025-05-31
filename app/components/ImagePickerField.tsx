import { LinearGradient } from "expo-linear-gradient";
import { Image as IconImage } from "phosphor-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ImagePickerFieldProps {
  image: string | null;
  onPick: () => void;
  editable?: boolean;
  aspect?: [number, number];
}

const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  image,
  onPick,
  editable = true,
  aspect = [16, 9],
}) => {
  return (
    <TouchableOpacity
      className="w-full aspect-[16/9] mb-4 px-4 rounded-xl overflow-hidden"
      activeOpacity={0.8}
      onPress={onPick}
      disabled={!editable}
    >
      {image ? (
        <View className="flex-1 w-full h-full">
          <Image
            source={{ uri: image }}
            className="w-full h-full absolute rounded-xl"
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.35)"]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderRadius: 16,
            }}
          >
            <View className="flex-1 justify-center items-center rounded-xl">
              <Text className="text-white text-lg font-bold">
                Press to edit
              </Text>
            </View>
          </LinearGradient>
        </View>
      ) : (
        <View className="flex-1 w-full h-full bg-surface-light rounded-xl items-center justify-center border-2 border-dashed border-accent-light">
          <IconImage size={48} color="#a97c5a" weight="regular" />
          <Text className="text-accent-light mt-2 font-medium text-base">
            Press to add a picture
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ImagePickerField;
