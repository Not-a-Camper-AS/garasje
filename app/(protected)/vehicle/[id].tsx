import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { H1 } from "@/components/ui/typography";

export default function VehicleDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-background p-4">
      <H1>Vehicle Details</H1>
      {/* Add vehicle details here */}
    </View>
  );
} 