import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface LocationPickerFieldProps {
  address: string;
  loading?: boolean;
  onPick: () => void;
  disabled?: boolean;
}

const LocationPickerField: React.FC<LocationPickerFieldProps> = ({
  address,
  loading,
  onPick,
  disabled,
}) => (
  <View className="px-4 pb-2">
    <Text className="text-base text-primary font-bold mb-1">Location</Text>
    <TouchableOpacity
      onPress={onPick}
      className="rounded-xl bg-surface-light px-4 py-3 flex-row items-center"
      disabled={disabled}
    >
      <View>
        <Text className="text-accent-light text-base">
          {loading
            ? "Getting location..."
            : address
            ? address
            : "Pick location"}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#a97c5a" className="ml-2" />
      ) : null}
    </TouchableOpacity>
  </View>
);

export default LocationPickerField;
