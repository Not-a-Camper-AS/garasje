import * as React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Text } from "@/components/ui/text";
import { Vehicle } from "@/types/vehicle";
import { Car, Bike, ChevronRight } from "lucide-react-native";
import { Card } from "./ui/card";

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function VehicleCard({ vehicle, onPress, style }: VehicleCardProps) {
  // Vehicle type icons and colors
  const iconMap = {
    car: <Car size={20} className="text-blue-800" />,
    bike: <Bike size={20} className="text-purple-800" />,
  };

  const bgColorMap = {
    car: "bg-blue-100",
    bike: "bg-purple-100", 
  };

  const icon = vehicle.type ? iconMap[vehicle.type] : <Car size={20} className="text-blue-800" />;
  const bgColor = vehicle.type ? bgColorMap[vehicle.type] : "bg-blue-100";

  return (
    <Card
      className="bg-white rounded-3xl shadow-md py-5 px-5 flex-row items-center mb-4 w-full"
      onPress={onPress}
      style={style}
    >
      {/* Left: Icon */}
      <View className={`w-12 h-12 rounded-xl ${bgColor} items-center justify-center`}>
        {icon}
      </View>

      {/* Middle: Info */}
      <View className="flex-1 ml-4">
        <Text className="text-xl font-bold text-gray-900">
          {vehicle.make} {vehicle.model}
        </Text>
        <Text className="text-sm text-gray-500">
          {vehicle.year} • {vehicle.licensePlate}
        </Text>
      </View>

      {/* Right: Chevron */}
      <ChevronRight size={20} className="text-gray-400" />
    </Card>
  );
} 