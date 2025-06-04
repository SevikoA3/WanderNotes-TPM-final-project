import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, SafeAreaView, ScrollView, Text, View } from "react-native";

const SevikoProfile = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 0 }}>
        {/* Header Section */}
        <View className="bg-surface items-center pb-8 pt-12 px-6 rounded-b-3xl shadow-lg mb-6 mx-6">
          <View className="border-4 border-orange-light rounded-full shadow-lg mb-4">
            <Image
              source={require("../../../assets/images/myPic.jpg")}
              style={{ width: 130, height: 130, borderRadius: 65 }}
            />
          </View>
          <Text className="text-primary text-3xl font-extrabold mb-1 tracking-tight">Seviko</Text>
          <Text className="text-accent text-base font-medium mb-2">Web & AI Enthusiast</Text>
          <View className="flex-row items-center gap-2 mb-1">
            <Feather name="map-pin" size={16} color="#ff9800" />
            <Text className="text-accent text-sm">Yogyakarta, Indonesia</Text>
          </View>
        </View>

        {/* Profile Info Section */}
        <View className="px-8 mb-8">
          <View className="bg-surface rounded-2xl shadow-md p-6 mb-4">
            <Text className="text-primary text-lg font-bold mb-1">About Me</Text>
            <Text className="text-accent text-base leading-relaxed">
              Name: <Text className="font-semibold text-primary">Seviko Attalarik P.H</Text>
              {"\n"}
              Birthdate: <Text className="font-semibold text-primary">1 September 2004</Text>
              {"\n"}
              Birthplace: <Text className="font-semibold text-primary">Yogyakarta, Indonesia</Text>
            </Text>
          </View>
          <View className="bg-surface rounded-2xl shadow-md p-6 mb-4">
            <Text className="text-primary text-lg font-bold mb-1">Bio</Text>
            <Text className="text-accent text-base leading-relaxed">
              I am a student at Universitas Pembangunan Nasional "Veteran" Yogyakarta, currently pursuing my passion in
              web development and machine learning. As the Vice Head of the Web Division in UPNVY's IT Club, I actively
              engage in collaborative projects that enhance my technical and leadership skills. In addition to my role
              in the IT Club, I also serve as a laboratory assistant, where I support students in practical learning
              sessions. I am constantly seeking opportunities to learn and grow, particularly in creating innovative web
              solutions and exploring the exciting potential of AI-driven technologies.
            </Text>
          </View>
          <View className="bg-surface rounded-2xl shadow-md p-6 flex-row items-center justify-between">
            <Text className="text-primary text-base font-semibold">GitHub</Text>
            <Text className="text-orange font-bold text-base" selectable>
              https://github.com/SevikoA3
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SevikoProfile;
