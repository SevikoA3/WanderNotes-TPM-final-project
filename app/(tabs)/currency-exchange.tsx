import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatNumber = (num: number) => {
  return num.toLocaleString("id-ID", { maximumFractionDigits: 2 });
};

const formatInputNumber = (value: string) => {
  // Remove all non-numeric characters except dots
  let numericValue = value.replace(/[^\d]/g, "");
  // Remove leading zeros (but allow single zero)
  numericValue = numericValue.replace(/^0+(?!$)/, "");
  // Add thousand separators
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseInputNumber = (value: string) => {
  // Remove dots for parsing
  return value.replace(/\./g, "");
};

const COUNTRY_CODES = [
  "IDR",
  "USD",
  "EUR",
  "JPY",
  "SGD",
  "MYR",
  "GBP",
  "AUD",
  "CNY",
  "KRW",
  "THB",
  "INR",
  "CAD",
  "CHF",
  "HKD",
  "NZD",
  "SAR",
  "AED",
  "PHP",
  "VND",
  "ZAR",
]; // Add more as needed

export default function CurrencyExchangeScreen() {
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState("IDR");
  const [to, setTo] = useState("USD");
  const [rates, setRates] = useState<any>({});

  const EXCHANGE_URL = process.env.EXPO_PUBLIC_EXCHANGE_URL;

  // Fetch rates whenever 'from' changes
  useEffect(() => {
    const fetchRates = async () => {
      setError("");
      setRates({});
      try {
        const url = `${EXCHANGE_URL}${from}`;
        const res = await axios.get(url);
        const data = res.data;
        if (data.result !== "success") throw new Error("API error.");
        setRates(data.conversion_rates);
      } catch (e: any) {
        setError(e.message || "Failed to fetch rates.");
      }
    };
    if (from) fetchRates();
  }, [from]);

  // Update result automatically when amount, from, or to changes
  useEffect(() => {
    setError("");
    setResult(null);
    const value = parseFloat(parseInputNumber(amount));
    if (!amount) return;
    if (isNaN(value)) {
      setError("Please enter a valid number.");
      return;
    }
    if (value < 0) {
      setError("Amount cannot be negative.");
      return;
    }
    const rate = rates[to];
    if (!rate) {
      setError("Exchange rate not found.");
      return;
    }
    const convertedAmount = value * rate;
    setResult(convertedAmount);
  }, [amount, to, rates]);

  const handleAmountChange = (text: string) => {
    const formatted = formatInputNumber(text);
    setAmount(formatted);
  };

  const getDisplayResult = () => {
    if (result === null) return "-";
    return formatNumber(result);
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-4 justify-center">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 justify-center">
          <View>
            <Text className="text-primary text-2xl font-bold text-center mb-6">
              Currency Exchange
            </Text>
          </View>

          <View className="bg-surface rounded-xl p-6 shadow-sm">
            <Text className="text-accent mb-2">From:</Text>
            <View className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 bg-white rounded-lg px-4 py-3 text-primary text-lg"
                keyboardType="numeric"
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="Enter amount"
                placeholderTextColor="#9a6b4c"
                maxLength={15}
              />
              <View
                className="ml-2 bg-orange rounded-lg"
                style={{ width: 120, height: 50 }}
              >
                <Picker
                  selectedValue={from}
                  onValueChange={setFrom}
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    width: "100%",
                    height: "100%",
                  }}
                  itemStyle={{ color: "#1b130d", fontWeight: "bold" }}
                  dropdownIconColor="#fff"
                  mode="dropdown"
                >
                  {COUNTRY_CODES.map((code) => (
                    <Picker.Item key={code} label={code} value={code} />
                  ))}
                </Picker>
              </View>
            </View>
            <Text className="text-accent mb-2">To:</Text>
            <View className="flex-row items-center mb-2">
              <View className="flex-1 bg-white rounded-lg px-4 py-3 justify-center min-h-[48px]">
                <Text className="text-primary text-lg">
                  {getDisplayResult()}
                </Text>
              </View>
              <View
                className="ml-2 bg-orange rounded-lg"
                style={{ width: 120, height: 50 }}
              >
                <Picker
                  selectedValue={to}
                  onValueChange={setTo}
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    width: "100%",
                    height: "100%",
                  }}
                  itemStyle={{ color: "#1b130d", fontWeight: "bold" }}
                  dropdownIconColor="#fff"
                  mode="dropdown"
                >
                  {COUNTRY_CODES.map((code) => (
                    <Picker.Item key={code} label={code} value={code} />
                  ))}
                </Picker>
              </View>
            </View>
            {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
