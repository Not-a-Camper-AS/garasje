import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";

export default function TransferVehicle() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold mb-4">Overfør kjøretøy</Text>
        <Text className="text-base text-gray-600 mb-6">
          Her kan du overføre eierskap av kjøretøyet til en annen person. 
          Dette er nyttig når du selger kjøretøyet eller vil gi det til noen andre.
        </Text>
        
        {/* Form components for transferring vehicle would go here */}
      </View>
    </SafeAreaView>
  );
} 