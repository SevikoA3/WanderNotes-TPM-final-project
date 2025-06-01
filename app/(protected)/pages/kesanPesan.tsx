import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const KesanPesanScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="flex-1 justify-center p-6 w-full">
          <Text className="text-accent text-base">
            Aplikasi ini mungkin masih terhitung simple karena temanya aja
            intinya cuma note. tapi dari hal yang simple gini banyak banget yang
            bisa aku pelajari kaya misalnya fitur reminder, sensor-sensor yang
            bisa dipakai, image handling, dan lain-lain. Terima kasih ke pada
            pak bagus untuk satu semesternya ini, semoga ilmu yang bapak berikan
            bisa menjadi amal jariyah.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default KesanPesanScreen;
