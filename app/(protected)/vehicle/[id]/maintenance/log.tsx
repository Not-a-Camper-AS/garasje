import { View, ScrollView, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useState, useEffect } from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Calendar, Check, Tag, ChevronDown, AlertCircle } from "lucide-react-native";

// Maintenance categories
const maintenanceCategories = [
  { id: "1", name: "Olje og filter" },
  { id: "2", name: "Bremser" },
  { id: "3", name: "Dekk" },
  { id: "4", name: "Batteri" },
  { id: "5", name: "Vask og rengjøring" },
  { id: "6", name: "Service" },
  { id: "7", name: "Annet" },
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

export default function LogMaintenance() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vehicle, setVehicle] = useState(getMockVehicle(id as string));
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('no-NO'));
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  // Save the maintenance log (in a real app, this would save to a database)
  const handleSave = () => {
    if (!title.trim()) {
      // Show validation error
      return;
    }
    
    // Mock saving the data
    console.log('Saving maintenance log:', {
      vehicleId: id,
      title,
      category: selectedCategory,
      notes,
      date,
    });
    
    // Navigate back to the maintenance history page
    router.replace(`/vehicle/${id}/maintenance/history`);
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
            <Text className="text-xl font-bold">Logg vedlikehold</Text>
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
            <Text className="text-base font-bold mb-2">Hva har du gjort?</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="F.eks. Byttet bremseklosser"
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
          
          {/* Category picker */}
          <View className="mt-5">
            <Text className="text-base font-bold mb-2">Kategori</Text>
            <Pressable 
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Tag size={18} color={selectedCategory ? "#111" : "#9ca3af"} className="mr-2" />
                <Text className={selectedCategory ? "text-gray-900" : "text-gray-400"}>
                  {selectedCategory || "Velg kategori"}
                </Text>
              </View>
              <ChevronDown size={18} color="#9ca3af" />
            </Pressable>
            
            {/* Category options */}
            {showCategoryPicker && (
              <View className="bg-white rounded-lg mt-1 border border-gray-200 shadow-sm overflow-hidden">
                {maintenanceCategories.map(category => (
                  <Pressable 
                    key={category.id}
                    onPress={() => {
                      setSelectedCategory(category.name);
                      setShowCategoryPicker(false);
                    }}
                    className={`px-4 py-3 border-b border-gray-100 flex-row items-center justify-between ${
                      selectedCategory === category.name ? 'bg-gray-50' : ''
                    }`}
                  >
                    <Text className="text-gray-900">{category.name}</Text>
                    {selectedCategory === category.name && (
                      <Check size={18} color="#10B981" />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          
          {/* Date picker (simplified for demo) */}
          <View className="mt-5">
            <Text className="text-base font-bold mb-2">Dato</Text>
            <View className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center">
              <Calendar size={18} color="#111" className="mr-2" />
              <Text className="text-gray-900">{date}</Text>
            </View>
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