import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";

export default function AddPeopleToVehicle() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold mb-4">Legg til personer</Text>
        <Text className="text-base text-gray-600">
          Her kan du legge til personer som har tilgang til kjøretøyet med ID: {id}
        </Text>
        
        {/* Form components for adding people would go here */}
      </View>
    </SafeAreaView>
  );
} 