import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ReminderListProps {
  reminders: Date[];
  onRemove?: (idx: number) => void;
  removable?: boolean;
  className?: string;
}

const ReminderList: React.FC<ReminderListProps> = ({
  reminders,
  onRemove,
  removable = true,
  className = "",
}) => {
  if (!reminders.length) return null;
  return (
    <View className={`mt-2 ${className}`}>
      {reminders.map((rem, idx) => (
        <View
          key={idx}
          className="flex-row items-center justify-between bg-surface-light rounded-xl px-4 py-2 mb-2"
        >
          <Text className="text-accent-light text-base">
            {rem.toLocaleString()}
          </Text>
          {removable && onRemove && (
            <TouchableOpacity onPress={() => onRemove(idx)}>
              <Text className="text-accent font-bold">Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

export default ReminderList;
