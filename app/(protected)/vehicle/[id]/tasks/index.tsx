import { View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useState, useEffect } from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Clock, Plus, DropletIcon, Wrench, ArrowLeft } from "lucide-react-native";

// Mock tasks for demonstration
const mockTasks = [
  { id: "1", title: "Skifte olje", dueDate: "Idag", icon: <DropletIcon size={14} color="#F59E0B" /> },
  { id: "2", title: "Sjekk dekktrykk", dueDate: "Imorgen", icon: <Wrench size={14} color="#F59E0B" /> },
  { id: "3", title: "Vask bilen", dueDate: "Neste uke", icon: <DropletIcon size={14} color="#F59E0B" /> },
  { id: "4", title: "Kontroller lys", dueDate: "Neste uke", icon: <Wrench size={14} color="#F59E0B" /> },
  { id: "5", title: "Bytt vindusviskere", dueDate: "Neste måned", icon: <Wrench size={14} color="#F59E0B" /> },
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

const TaskItem = ({ 
  title, 
  date, 
  icon, 
  color = "bg-amber-50",
  textColor = "text-amber-700"
}: { 
  title: string; 
  date: string;
  icon: React.ReactNode;
  color?: string;
  textColor?: string;
}) => (
  <Pressable className="flex-row items-center py-4 border-b border-gray-100 active:bg-gray-50">
    <View className={`w-10 h-10 rounded-lg ${color} items-center justify-center mr-4`}>
      {icon}
    </View>
    <Text className="text-base font-medium text-gray-900 flex-1">{title}</Text>
    <View className={`${color} rounded-full px-3 py-1.5`}>
      <Text className={`text-sm ${textColor}`}>{date}</Text>
    </View>
  </Pressable>
);

export default function VehicleTasks() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vehicle, setVehicle] = useState(getMockVehicle(id as string));
  
  // In a real app, you would fetch tasks for this specific vehicle
  
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
            <Text className="text-xl font-bold">Oppgaver</Text>
          </View>
          <Pressable 
            onPress={() => router.push(`/vehicle/${id}/tasks/new`)}
            className="w-10 h-10 rounded-full bg-[#22000A] items-center justify-center active:opacity-90"
          >
            <Plus size={22} color="#fff" />
          </Pressable>
        </View>
        
        {/* Tasks List */}
        <ScrollView className="flex-1 px-4">
          <View className="py-4 flex-row items-center">
            <Clock size={20} color="#F59E0B" />
            <Text className="text-lg font-bold ml-2">Aktive oppgaver</Text>
          </View>
          
          {mockTasks.map(task => (
            <TaskItem
              key={task.id}
              title={task.title}
              date={task.dueDate}
              icon={task.icon}
              color="bg-amber-50"
              textColor="text-amber-700"
            />
          ))}

          {mockTasks.length === 0 && (
            <View className="py-10 items-center">
              <Text className="text-gray-500 text-center">Ingen aktive oppgaver</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 