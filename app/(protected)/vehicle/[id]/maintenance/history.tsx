import { View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useState, useEffect } from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { CheckCircle2, Plus, DropletIcon, Wrench, ArrowLeft, Calendar } from "lucide-react-native";

// Mock completed maintenance tasks
const mockCompletedTasks = [
  { id: "1", title: "Byttet bremseklosser", date: "24. mai 2023", icon: <Wrench size={14} color="#10B981" /> },
  { id: "2", title: "Fylt spylervæske", date: "15. april 2023", icon: <DropletIcon size={14} color="#10B981" /> },
  { id: "3", title: "Skiftet oljefilter", date: "10. mars 2023", icon: <Wrench size={14} color="#10B981" /> },
  { id: "4", title: "Byttet vindusviskere", date: "5. februar 2023", icon: <Wrench size={14} color="#10B981" /> },
  { id: "5", title: "Service hos Tesla", date: "15. januar 2023", icon: <Wrench size={14} color="#10B981" /> },
  { id: "6", title: "Skiftet dekk til vinter", date: "20. november 2022", icon: <Wrench size={14} color="#10B981" /> },
];

// Get mock vehicle based on ID
const getMockVehicle = (id: string) => {
  const vehicles = [
    {
      id: "1",
      make: "Tesla",
      model: "Model 3 Long Range",
      year: 2022,
      licensePlate: "EE 47617",
      color: "Grå",
      type: "car",
      nickname: "Millenial Falcon",
    },
    {
      id: "2",
      make: "Honda",
      model: "Civic",
      year: 2021,
      licensePlate: "XYZ789",
      color: "Blå",
      type: "car",
      nickname: "Min Honda",
    },
    {
      id: "3",
      make: "Bike",
      model: "Mountain Bike",
      year: 2022,
      licensePlate: "DEF456",
      color: "Rød",
      type: "bike",
      nickname: "Min Sykkel",
    },
  ];
  
  return vehicles.find(v => v.id === id) || vehicles[0];
};

const MaintenanceItem = ({ 
  title, 
  date, 
  icon, 
  color = "bg-green-50",
  textColor = "text-green-700"
}: { 
  title: string; 
  date: string;
  icon: React.ReactNode;
  color?: string;
  textColor?: string;
}) => (
  <View className="border-b border-gray-100">
    <Pressable className="flex-row items-center py-3 px-4 active:bg-gray-50 active:rounded-xl my-0.5">
      <View className={`w-10 h-10 rounded-lg ${color} items-center justify-center mr-4`}>
        {icon}
      </View>
      <Text className="text-base font-medium text-gray-900 flex-1">{title}</Text>
      <View className={`flex-row items-center`}>
        <Calendar size={14} className="text-gray-400 mr-1.5" />
        <Text className={`text-sm text-gray-500`}>{date}</Text>
      </View>
    </Pressable>
  </View>
);

export default function MaintenanceHistory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vehicle, setVehicle] = useState(getMockVehicle(id as string));
  
  // In a real app, you would fetch maintenance history for this specific vehicle
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <View className="flex-1">
        {/* Custom Header */}
        <View className="px-4 pt-4 pb-2 flex-row items-center border-b border-gray-100">
          <Pressable 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center mr-3 active:bg-gray-100"
          >
            <ArrowLeft size={24} color="#111" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-base text-gray-600">{vehicle.make} {vehicle.model}</Text>
            <Text className="text-xl font-bold">Vedlikeholdslogg</Text>
          </View>
          <Pressable 
            onPress={() => router.push(`/vehicle/${id}/maintenance/log`)}
            className="w-10 h-10 rounded-full bg-[#22000A] items-center justify-center active:opacity-90"
          >
            <Plus size={22} color="#fff" />
          </Pressable>
        </View>
        
        {/* Maintenance History List */}
        <ScrollView className="flex-1 px-4">
          <View className="py-4 flex-row items-center">
            <CheckCircle2 size={20} color="#10B981" />
            <Text className="text-lg font-bold ml-2">Fullførte vedlikehold</Text>
          </View>
          
          {mockCompletedTasks.map(task => (
            <MaintenanceItem
              key={task.id}
              title={task.title}
              date={task.date}
              icon={task.icon}
              color="bg-green-50"
              textColor="text-green-700"
            />
          ))}

          {mockCompletedTasks.length === 0 && (
            <View className="py-10 items-center">
              <Text className="text-gray-500 text-center">Ingen vedlikeholdshistorikk</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 