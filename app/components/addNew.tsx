import { useRouter } from "expo-router";
import { Bell, Calendar, Image as IconImage } from "phosphor-react-native";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddNewScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#fdf9f6]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Title Input */}
        <View className="px-4 pt-2">
          <TextInput
            placeholder="Trip title"
            placeholderTextColor="#a97c5a"
            className="w-full rounded-2xl bg-[#f5ede7] text-[#a97c5a] text-lg font-medium p-4 mb-4"
            style={{ minHeight: 56 }}
          />
        </View>

        {/* Note Input */}
        <View className="px-4">
          <TextInput
            placeholder="Write your note here..."
            placeholderTextColor="#a97c5a"
            className="w-full rounded-2xl bg-[#f5ede7] text-[#a97c5a] text-base font-normal p-4 mb-4"
            style={{ minHeight: 120, textAlignVertical: "top" }}
            multiline
          />
        </View>

        {/* Add to your note */}
        <Text className="px-4 pt-4 pb-2 text-lg font-bold text-[#191410]">
          Add to your note
        </Text>
        <View className="gap-4 px-4">
          {/* Add images */}
          <TouchableOpacity className="flex-row items-center mb-2">
            <View className="size-12 rounded-xl bg-[#f5ede7] items-center justify-center mr-4">
              <IconImage size={28} color="#191410" weight="regular" />
            </View>
            <Text className="text-base text-[#191410]">
              Add images or attachments
            </Text>
          </TouchableOpacity>
          {/* Add dates */}
          <TouchableOpacity className="flex-row items-center mb-2">
            <View className="size-12 rounded-xl bg-[#f5ede7] items-center justify-center mr-4">
              <Calendar size={28} color="#191410" weight="regular" />
            </View>
            <Text className="text-base text-[#191410]">Add dates</Text>
          </TouchableOpacity>
          {/* Add reminder */}
          <TouchableOpacity className="flex-row items-center mb-2">
            <View className="size-12 rounded-xl bg-[#f5ede7] items-center justify-center mr-4">
              <Bell size={28} color="#191410" weight="regular" />
            </View>
            <Text className="text-base text-[#191410]">Add reminder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Save Button */}
      <View className="px-4 pb-6 pt-2 bg-transparent">
        <TouchableOpacity className="w-full h-14 rounded-2xl bg-[#f4811f] items-center justify-center">
          <Text className="text-white text-lg font-bold">Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
