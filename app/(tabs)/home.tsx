import { MagnifyingGlass } from "phosphor-react-native";
import React from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const cardData = [
    {
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCfQSrLLMIy88cmB0Nbm-N0sJcdLb6iIM2O0w6VVUzcdgwWErAKPPHDiQ5rvBBeI8s1wDuNOsm6o0DQ1P02UUBjTP7sYuk9RLlo87B2d3k5VYAefiPMMAscg_nbaZa7GFgG7f5P1bIDGJ5stwIO5R1R-wuiI41OlV7P01H5R_fe70QcRiTJmv_xtUlsQoeJE-5JQBY9sVNO9Ak2ceDv1QVYS6Ho038KMGr_EtQl-TuuzankijMjN3sdF4lW-f_WXvle3mFHySlOIqzF",
      title: "A Journey Through the Heart of Italy",
      description:
        "Discover the rich history, art, and culinary delights of Italy, from the ancient ruins of Rome to the romantic canals of Venice.",
    },
    {
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCHuWp4q9AzcX-2-3IUiFDpFl3qsWU-E1V_UtR_5bo2UXatoHjH1lY5AxkEhwbvpINayBXI9b7Z8x6l4G7zTLwwEEvVqIFQ8ZAjvyRQpHW_JAgJCwbNla4oPdn-2PxCh74dTcRbrgTeLDNWv_1_rM_vK5_VtDc67YdObMN6X6VKUKqtJT_scYOUlNgfsZYi20KONC1uU5_faUhM0lHkSV4Mz3n2TSJpmt1EEdYzMKZ-57-U4imPeHLuyaaX52Gje6NG2Ku1eEKxbi_-",
      title: "Exploring the Wonders of Japan",
      description:
        "Immerse yourself in the unique blend of tradition and modernity in Japan, from the serene temples of Kyoto to the bustling streets of Tokyo.",
    },
    {
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCEv6D4MA72GvAvsN_EGj8xUaBpcHtlVnstCGiE9PtAQajeFCW9rhxaijREGVovuJiZVIjQ_5uF9RYO_0BGQwSOOUJNhdvH0PMg0hCk2pjk4Dr8XL7xa5d203vLSUwDkR0cyV5EsduPI3QVAcLmVwBLumGZdATnvToDN_NOk47FJwNgiK968qXD3X0Lr3b0iXMOcCsJl4JmUdRQRJmmw5cJz2b6e0VX5Y8T1R5lsGNVDPq-ouO94VnXXv9ji-sBOd5A9NFxD7JiI1yd",
      title: "The Magic of the French Riviera",
      description:
        "Experience the glamour and beauty of the French Riviera, with its stunning coastline, charming towns, and vibrant culture.",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#fcfaf8]">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-between">
          {/* Top Section */}
          <View>
            {/* Header */}
            <View className="flex-row items-center bg-[#fcfaf8] p-4 pb-2 justify-between">
              {/* Spacer for centering title */}
              <View className="w-12" />
              <Text className="text-[#1b130d] text-2xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                WanderNotes
              </Text>
              <View className="flex w-12 items-center justify-end">
                {/* Removed Plus button */}
              </View>
            </View>

            {/* Search Bar */}
            <View className="px-4 py-3">
              <View className="flex-row items-center rounded-xl h-12 w-full bg-[#f3ece7] overflow-hidden">
                <View className="items-center justify-center pl-4 pr-2">
                  <MagnifyingGlass size={24} color="#9a6b4c" />
                </View>
                <TextInput
                  placeholder="Search"
                  className="flex-1 h-full text-[#1b130d] placeholder:text-[#9a6b4c] text-base font-normal leading-normal pl-2"
                  placeholderTextColor="#9a6b4c"
                />
              </View>
            </View>

            {/* Content Cards */}
            {cardData.map((card, index) => (
              <View key={index} className="p-4">
                {/* Added bg-white and shadow for card appearance, overflow for image rounding. Adjust xl:w-* for desired layout. */}
                <View className="flex-col rounded-xl xl:flex-row xl:items-start bg-white shadow-sm overflow-hidden">
                  <ImageBackground
                    source={{ uri: card.imageUrl }}
                    className="w-full aspect-[16/9] xl:w-1/3"
                    resizeMode="cover"
                  />
                  <View className="w-full xl:w-2/3 grow flex-col items-stretch justify-center gap-1 p-4">
                    <Text className="text-[#1b130d] text-lg font-bold leading-tight tracking-[-0.015em]">
                      {card.title}
                    </Text>
                    <View className="flex-row items-end gap-3 justify-between mt-1">
                      <Text className="text-[#9a6b4c] text-base font-normal leading-normal">
                        {card.description}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
