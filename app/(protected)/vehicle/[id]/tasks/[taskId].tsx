import { View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Clock, DropletIcon, Wrench, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react-native";

// Mock tasks for finding task detail
const mockTasks = [
  { id: "1", title: "Skifte olje", dueDate: "Idag", icon: <DropletIcon size={14} color="#F59E0B" />, 
    description: "Skift motorolje og oljefilter. Bruk syntetisk 5W-30 olje for beste ytelse.",
    priority: "Medium", createdAt: "2023-10-15" },
  { id: "2", title: "Sjekk dekktrykk", dueDate: "Imorgen", icon: <Wrench size={14} color="#F59E0B" />,
    description: "Kontroller dekktrykk i alle fire dekk. Anbefalt trykk er 2.5 bar foran og 2.7 bar bak.",
    priority: "Lav", createdAt: "2023-10-16" },
  { id: "3", title: "Vask bilen", dueDate: "Neste uke", icon: <DropletIcon size={14} color="#F59E0B" />,
    description: "Vask bilen grundig, inkludert understellet for å fjerne veisalt.",
    priority: "Lav", createdAt: "2023-10-12" },
  { id: "4", title: "Kontroller lys", dueDate: "Neste uke", icon: <Wrench size={14} color="#F59E0B" />,
    description: "Sjekk at alle lys fungerer korrekt. Bytt pærer ved behov.",
    priority: "Medium", createdAt: "2023-10-10" },
  { id: "5", title: "Bytt vindusviskere", dueDate: "Neste måned", icon: <Wrench size={14} color="#F59E0B" />,
    description: "Bytt vindusviskere foran og bak. Bosch Aerotwin er anbefalt for denne bilmodellen.",
    priority: "Høy", createdAt: "2023-10-05" },
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

// Get priority color
const getPriorityColor = (priority: string) => {
  switch(priority) {
    case "Høy": return "#EF4444";
    case "Medium": return "#F59E0B";
    case "Lav": return "#10B981";
    default: return "#F59E0B";
  }
};

export default function TaskDetail() {
  const { id, taskId } = useLocalSearchParams<{ id: string, taskId: string }>();
  const [vehicle, setVehicle] = useState(getMockVehicle(id as string));
  const [task, setTask] = useState<any>(null);
  
  useEffect(() => {
    // In a real app, you would fetch the specific task by ID
    const foundTask = mockTasks.find(t => t.id === taskId);
    setTask(foundTask || null);
  }, [taskId]);
  
  const handleMarkComplete = () => {
    // In a real app, you would update the task status
    console.log('Marking task as complete:', taskId);
    router.replace(`/vehicle/${id}/tasks`);
  };
  
  if (!task) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text>Oppgave ikke funnet</Text>
      </SafeAreaView>
    );
  }
  
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
            <Text className="text-xl font-bold">Oppgavedetaljer</Text>
          </View>
          <Pressable 
            onPress={handleMarkComplete}
            className="px-4 py-2 rounded-full bg-[#22000A] items-center justify-center active:opacity-90"
          >
            <Text className="text-base font-medium text-white">Fullfør</Text>
          </Pressable>
        </View>
        
        {/* Task Details */}
        <ScrollView className="flex-1 px-4">
          {/* Task Header */}
          <View className="mt-6 mb-4">
            <View className="flex-row">
              <View className={`w-12 h-12 rounded-xl bg-amber-50 items-center justify-center mr-4`}>
                {task.icon ? React.cloneElement(task.icon, { size: 20 }) : 
                  <Wrench size={20} color="#F59E0B" />}
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">{task.title}</Text>
                <View className="flex-row items-center mt-1">
                  <Clock size={14} className="text-amber-500 mr-1.5" />
                  <Text className="text-sm text-gray-600">{task.dueDate}</Text>
                </View>
              </View>
            </View>
            
            {/* Priority Badge */}
            <View className="mt-4 flex-row items-center">
              <Text className="text-sm text-gray-600 mr-2">Prioritet:</Text>
              <View 
                style={{ backgroundColor: `${getPriorityColor(task.priority)}20` }}
                className="rounded-full px-3 py-1 flex-row items-center"
              >
                <View 
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                  className="w-2 h-2 rounded-full mr-1.5"
                />
                <Text style={{ color: getPriorityColor(task.priority) }} className="text-sm font-medium">
                  {task.priority}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Description */}
          <View className="mb-6">
            <Text className="text-base font-bold mb-2">Beskrivelse</Text>
            <View className="bg-gray-50 p-4 rounded-lg">
              <Text className="text-base text-gray-700">{task.description}</Text>
            </View>
          </View>
          
          {/* Created Date */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500">Opprettet: {task.createdAt}</Text>
          </View>
          
          {/* Action Button */}
          <Pressable 
            onPress={handleMarkComplete}
            className="bg-[#22000A] py-4 rounded-lg flex-row items-center justify-center mb-10 active:opacity-90"
          >
            <CheckCircle size={20} color="#fff" className="mr-2" />
            <Text className="text-base font-bold text-white">Marker som fullført</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 