import { ArrowsLeftRight } from "phosphor-react-native";
import React, { useState } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatNumber = (num: number) => {
  return num.toLocaleString("id-ID", { maximumFractionDigits: 2 });
};

export default function CurrencyExchangeScreen() {
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [rate] = useState(15600); // Example: 1 USD = 15,600 IDR

  const handleExchange = () => {
    setError("");
    setResult(null);
    const value = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(value)) {
      setError("Masukkan angka yang valid.");
      return;
    }
    if (value < 0) {
      setError("Angka tidak boleh negatif.");
      return;
    }
    setResult(
      `${formatNumber(value)} IDR = $${formatNumber(value / rate)} USD`
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fcfaf8] px-4 justify-center">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 justify-center">
          <Text className="text-[#1b130d] text-2xl font-bold text-center mb-6">
            Currency Exchange
          </Text>
          <View className="bg-[#f3ece7] rounded-xl p-6 shadow-sm">
            <Text className="text-[#9a6b4c] mb-2">Masukkan jumlah (IDR):</Text>
            <TextInput
              className="bg-white rounded-lg px-4 py-3 text-[#1b130d] text-lg mb-2"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="Contoh: 100000"
              placeholderTextColor="#9a6b4c"
              maxLength={12}
            />
            {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-[#1b130d] rounded-lg py-3 mt-2"
              onPress={handleExchange}
              activeOpacity={0.85}
            >
              <ArrowsLeftRight size={24} color="#fff" />
              <Text className="text-white text-base font-bold ml-2">
                Tukar ke USD
              </Text>
            </TouchableOpacity>
            {result && (
              <Text className="text-[#1b130d] text-lg font-semibold text-center mt-4">
                {result}
              </Text>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
