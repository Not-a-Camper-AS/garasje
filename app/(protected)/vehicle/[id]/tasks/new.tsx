import { View, ScrollView, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useState, useEffect } from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Calendar, Check, Tag, ChevronDown, AlertCircle, Clock } from "lucide-react-native";

// Task priority options
const priorityOptions = [
  { id: "1", name: "Lav", color: "#10B981" },
  { id: "2", name: "Medium", color: "#F59E0B" },
  { id: "3", name: "Høy", color: "#EF4444" },
];

// Due date options
const dueDateOptions = [
  { id: "1", name: "Idag" },
  { id: "2", name: "Imorgen" },
  { id: "3", name: "Denne uken" },
  { id: "4", name: "Neste uke" },
  { id: "5", name: "Neste måned" },
  { id: "6", name: "Egendefinert dato" },
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

export default function NewTask() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vehicle, setVehicle] = useState(getMockVehicle(id as string));
  const [title, setTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [selectedDueDate, setSelectedDueDate] = useState('Idag');
  const [notes, setNotes] = useState('');
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  
  // Get color for selected priority
  const getPriorityColor = (priorityName: string) => {
    const priority = priorityOptions.find(p => p.name === priorityName);
    return priority ? priority.color : "#F59E0B";
  };
  
  // Save the task (in a real app, this would save to a database)
  const handleSave = () => {
    if (!title.trim()) {
      // Show validation error
      return;
    }
    
    // Mock saving the data
    console.log('Saving task:', {
      vehicleId: id,
      title,
      priority: selectedPriority,
      dueDate: selectedDueDate,
      notes,
    });
    
    // Navigate back to the tasks page
    router.replace(`/vehicle/${id}/tasks`);
  };
  
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
            <Text className="text-xl font-bold">Ny oppgave</Text>
          </View>
          <Pressable 
            onPress={handleSave}
            className={`px-4 py-2 rounded-full ${title.trim() ? 'bg-[#22000A]' : 'bg-gray-200'} items-center justify-center active:opacity-90`}
            disabled={!title.trim()}
          >
            <Text className={`text-base font-medium ${title.trim() ? 'text-white' : 'text-gray-500'}`}>Lagre</Text>
          </Pressable>
        </View>
        
        {/* Form */}
        <ScrollView className="flex-1 px-4">
          {/* Title input */}
          <View className="mt-5">
            <Text className="text-base font-bold mb-2">Hva må gjøres?</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="F.eks. Bytte bremseklosser"
              className="bg-gray-50 px-4 py-3 rounded-lg text-base border border-gray-200"
              placeholderTextColor="#9ca3af"
            />
            {!title.trim() && (
              <View className="flex-row items-center mt-1">
                <AlertCircle size={14} color="#EF4444" />
                <Text className="text-sm text-red-500 ml-1">Dette feltet er påkrevd</Text>
              </View>
            )}
          </View>
          
          {/* Priority picker */}
          <View className="mt-5">
            <Text className="text-base font-bold mb-2">Prioritet</Text>
            <Pressable 
              onPress={() => setShowPriorityPicker(!showPriorityPicker)}
              className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View 
                  style={{ backgroundColor: getPriorityColor(selectedPriority) }}
                  className="w-4 h-4 rounded-full mr-2"
                />
                <Text className="text-gray-900">{selectedPriority}</Text>
              </View>
              <ChevronDown size={18} color="#9ca3af" />
            </Pressable>
            
            {/* Priority options */}
            {showPriorityPicker && (
              <View className="bg-white rounded-lg mt-1 border border-gray-200 shadow-sm overflow-hidden">
                {priorityOptions.map(priority => (
                  <Pressable 
                    key={priority.id}
                    onPress={() => {
                      setSelectedPriority(priority.name);
                      setShowPriorityPicker(false);
                    }}
                    className={`px-4 py-3 border-b border-gray-100 flex-row items-center justify-between ${
                      selectedPriority === priority.name ? 'bg-gray-50' : ''
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View 
                        style={{ backgroundColor: priority.color }}
                        className="w-4 h-4 rounded-full mr-2"
                      />
                      <Text className="text-gray-900">{priority.name}</Text>
                    </View>
                    {selectedPriority === priority.name && (
                      <Check size={18} color="#10B981" />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          
          {/* Due date picker */}
          <View className="mt-5">
            <Text className="text-base font-bold mb-2">Frist</Text>
            <Pressable 
              onPress={() => setShowDueDatePicker(!showDueDatePicker)}
              className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Clock size={18} color="#111" className="mr-2" />
                <Text className="text-gray-900">{selectedDueDate}</Text>
              </View>
              <ChevronDown size={18} color="#9ca3af" />
            </Pressable>
            
            {/* Due date options */}
            {showDueDatePicker && (
              <View className="bg-white rounded-lg mt-1 border border-gray-200 shadow-sm overflow-hidden">
                {dueDateOptions.map(option => (
                  <Pressable 
                    key={option.id}
                    onPress={() => {
                      setSelectedDueDate(option.name);
                      setShowDueDatePicker(false);
                    }}
                    className={`px-4 py-3 border-b border-gray-100 flex-row items-center justify-between ${
                      selectedDueDate === option.name ? 'bg-gray-50' : ''
                    }`}
                  >
                    <Text className="text-gray-900">{option.name}</Text>
                    {selectedDueDate === option.name && (
                      <Check size={18} color="#10B981" />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          
          {/* Notes */}
          <View className="mt-5 mb-10">
            <Text className="text-base font-bold mb-2">Notater (valgfritt)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Ytterligere detaljer..."
              className="bg-gray-50 px-4 py-3 rounded-lg text-base border border-gray-200 min-h-[100]"
              multiline={true}
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 