import { View, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Car, Bike, ChevronDown } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVehicle } from "@/lib/db";
import { useAuth } from "@/context/supabase-provider";


// Vehicle type options
const vehicleTypes = [
  { id: "car", name: "Bil", icon: <Car size={20} className="text-blue-800" /> },
  { id: "bike", name: "Sykkel", icon: <Bike size={20} className="text-purple-800" /> },
];

// Background color presets
const bgColorPresets = {
  car: [
    { id: "amber", name: "Amber", value: "#FFC193" },
    { id: "blue", name: "Blå", value: "#93C5FF" },
    { id: "green", name: "Grønn", value: "#93FFB5" },
    { id: "purple", name: "Lilla", value: "#D093FF" },
    { id: "pink", name: "Rosa", value: "#FF93D0" },
    { id: "yellow", name: "Gul", value: "#FFE893" },
  ],
  bike: [
    { id: "green", name: "Grønn", value: "#B9FFC2" },
    { id: "blue", name: "Blå", value: "#B9E6FF" },
    { id: "purple", name: "Lilla", value: "#D9B9FF" },
    { id: "pink", name: "Rosa", value: "#FFB9E6" },
    { id: "yellow", name: "Gul", value: "#FFF0B9" },
    { id: "orange", name: "Oransje", value: "#FFD9B9" },
  ],
};

// Vehicle color presets
const vehicleColorPresets = [
  { id: "white", name: "Hvit", value: "#FFFFFF" },
  { id: "black", name: "Svart", value: "#000000" },
  { id: "gray", name: "Grå", value: "#808080" },
  { id: "red", name: "Rød", value: "#FF0000" },
  { id: "blue", name: "Blå", value: "#0000FF" },
  { id: "green", name: "Grønn", value: "#008000" },
  { id: "yellow", name: "Gul", value: "#FFFF00" },
  { id: "silver", name: "Sølv", value: "#C0C0C0" },
  { id: "brown", name: "Brun", value: "#A52A2A" },
  { id: "navy", name: "Marineblå", value: "#000080" },
  { id: "burgundy", name: "Burgunder", value: "#800020" },
  { id: "beige", name: "Beige", value: "#F5F5DC" },
];

export default function NewVehicle() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  // Form state
  const [nickname, setNickname] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [selectedType, setSelectedType] = useState<"car" | "bike">("car");
  const [selectedBgColor, setSelectedBgColor] = useState(bgColorPresets.car[0].value);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  // Update background color when vehicle type changes
  const handleTypeChange = (type: "car" | "bike") => {
    setSelectedType(type);
    setSelectedBgColor(bgColorPresets[type][0].value);
    setShowTypePicker(false);
  };

  // Mutation to create a new vehicle
  const { mutate: saveVehicle, isPending: saving } = useMutation({
    mutationFn: (vehicleData: Parameters<typeof createVehicle>[1]) => 
      createVehicle(session?.user.id as string, vehicleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      router.replace("/");
    },
    onError: (error) => {
      console.error("Error saving vehicle:", error);
      Alert.alert("Error", "Could not save vehicle. Please try again.");
    },
  });

  // Handle form submission
  const handleSave = () => {
    if (!nickname.trim()) {
      Alert.alert("Error", "Please enter a nickname for your vehicle");
      return;
    }

    saveVehicle({
      nickname: nickname.trim(),
      make: make.trim() || undefined,
      model: model.trim() || undefined,
      year: year ? parseInt(year) : undefined,
      color: color.trim() || undefined,
      licensePlate: licensePlate.trim() || undefined,
      type: selectedType,
      bgColor: selectedBgColor,
    });
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
          <Text className="text-xl font-bold flex-1">Legg til nytt kjøretøy</Text>
          <Pressable 
            onPress={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-full bg-[#22000A] items-center justify-center active:opacity-90"
          >
            <Text className="text-white font-medium">Lagre</Text>
          </Pressable>
        </View>

        {/* Form */}
        <ScrollView className="flex-1 p-4">
          {/* Nickname */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Kallenavn *</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="F.eks. Min Tesla"
              className="bg-gray-50 px-4 rounded-xl text-base"
              style={{ height: 44, textAlignVertical: 'center', paddingTop: 0, paddingBottom: 0 }}
            />
          </View>

          {/* Vehicle Type */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Type *</Text>
            <Pressable
              onPress={() => setShowTypePicker(true)}
              className="bg-gray-50 px-4 py-3 rounded-xl flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                {vehicleTypes.find(t => t.id === selectedType)?.icon}
                <Text className="ml-2 text-base">
                  {vehicleTypes.find(t => t.id === selectedType)?.name}
                </Text>
              </View>
              <ChevronDown size={20} color="#666" />
            </Pressable>
          </View>

          {/* Make */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Merke</Text>
            <TextInput
              value={make}
              onChangeText={setMake}
              placeholder="F.eks. Tesla"
              className="bg-gray-50 px-4 rounded-xl text-base"
              style={{ height: 44, textAlignVertical: 'center', paddingTop: 0, paddingBottom: 0 }}
            />
          </View>

          {/* Model */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Modell</Text>
            <TextInput
              value={model}
              onChangeText={setModel}
              placeholder="F.eks. Model 3"
              className="bg-gray-50 px-4 rounded-xl text-base"
              style={{ height: 44, textAlignVertical: 'center', paddingTop: 0, paddingBottom: 0 }}
            />
          </View>

          {/* Year */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Årsmodell</Text>
            <TextInput
              value={year}
              onChangeText={setYear}
              placeholder="F.eks. 2022"
              keyboardType="numeric"
              className="bg-gray-50 px-4 rounded-xl text-base"
              style={{ height: 44, textAlignVertical: 'center', paddingTop: 0, paddingBottom: 0 }}
            />
          </View>

          {/* Vehicle Color */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Farge</Text>
            <TextInput
              value={color}
              onChangeText={setColor}
              placeholder="F.eks. Rød"
              className="bg-gray-50 px-4 rounded-xl text-base"
              style={{ height: 44, textAlignVertical: 'center', paddingTop: 0, paddingBottom: 0 }}
            />
          </View>

          {/* Background Color */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Bakgrunnsfarge</Text>
            <Pressable
              onPress={() => setShowBgColorPicker(true)}
              className="bg-gray-50 px-4 py-3 rounded-xl flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View 
                  className="w-6 h-6 rounded-full mr-2 border border-gray-200"
                  style={{ backgroundColor: selectedBgColor }}
                />
                <Text className="text-base">
                  {bgColorPresets[selectedType].find(c => c.value === selectedBgColor)?.name || "Velg farge"}
                </Text>
              </View>
              <ChevronDown size={20} color="#666" />
            </Pressable>
          </View>

          {/* License Plate */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Registreringsnummer</Text>
            <TextInput
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="F.eks. EE 47617"
              className="bg-gray-50 px-4 rounded-xl text-base"
              style={{ height: 44, textAlignVertical: 'center', paddingTop: 0, paddingBottom: 0 }}
            />
          </View>
        </ScrollView>
      </View>

      {/* Type Picker Modal */}
      {showTypePicker && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-white w-[90%] rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4">Velg type</Text>
            {vehicleTypes.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => handleTypeChange(type.id as "car" | "bike")}
                className="flex-row items-center py-3 border-b border-gray-100"
              >
                {type.icon}
                <Text className="ml-2 text-base">{type.name}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowTypePicker(false)}
              className="mt-4 py-3"
            >
              <Text className="text-center text-red-600 font-medium">Avbryt</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Background Color Picker Modal */}
      {showBgColorPicker && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-white w-[90%] rounded-2xl p-4">
            <Text className="text-lg font-bold mb-2">Velg bakgrunnsfarge</Text>
            <Text className="text-sm text-gray-500 mb-4">
              Velg en farge som vil vises som bakgrunn for kjøretøyet ditt i appen. Dette hjelper deg med å raskt identifisere kjøretøyet ditt.
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {bgColorPresets[selectedType].map((preset) => (
                <Pressable
                  key={preset.id}
                  onPress={() => {
                    setSelectedBgColor(preset.value);
                    setShowBgColorPicker(false);
                  }}
                  className="w-[30%] items-center mb-4"
                >
                  <View 
                    className={`w-16 h-16 rounded-full mb-1 border-2 ${
                      selectedBgColor === preset.value ? 'border-[#22000A]' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: preset.value }}
                  />
                  <Text className="text-xs text-center">{preset.name}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => setShowBgColorPicker(false)}
              className="mt-4 py-3"
            >
              <Text className="text-center text-red-600 font-medium">Avbryt</Text>
            </Pressable>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}
