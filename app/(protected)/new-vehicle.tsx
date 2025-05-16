import React, { useState } from "react";
import { View, TextInput, Pressable, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Search, AlertCircle, X, Check } from "lucide-react-native";

type VehicleData = {
  make: string;
  model: string;
  year: string;
  color: string;
  registrationNumber: string;
  typebetegnelse?: string;
  understellsnummer?: string;
  seats?: number;
  weight?: number;
  totalWeight?: number;
};

export default function NewVehicle() {
  const [licensePlate, setLicensePlate] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [nickname, setNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Function to search for vehicle by license plate
  const searchVehicle = async () => {
    if (!licensePlate.trim()) {
      setError("Vennligst skriv inn et registreringsnummer");
      return;
    }

    setError(null);
    setIsSearching(true);
    
    try {
      // Log API request details
      console.log("Making API request to:", `/api/search-vehicle?kjennemerke=${encodeURIComponent(licensePlate.trim())}`);
      
      // Make the API request with relative URL
      const response = await fetch(`/api/search-vehicle?kjennemerke=${encodeURIComponent(licensePlate.trim())}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Check if the response is valid JSON
      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);
      
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid content type:", contentType);
        throw new Error("Server returned an invalid response format. Expected JSON.");
      }
      
      // Safely parse JSON
      let data;
      try {
        data = await response.json();
        console.log("Parsed JSON data:", data);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Failed to parse server response as JSON");
      }
      
      // Handle API response
      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch vehicle data");
      }
      
      if (data?.success && data?.vehicle) {
        setVehicleData(data.vehicle);
      } else {
        setError("Ingen kjøretøydata funnet");
      }
    } catch (err) {
      console.error("Error searching for vehicle:", err);
      
      // Handle specific error for JSON parsing
      if (err instanceof SyntaxError && err.message.includes("JSON")) {
        setError("Feil ved kommunikasjon med API-et. Vennligst prøv igjen senere.");
      } else {
        setError((err as Error).message || "Noe gikk galt ved søk etter kjøretøyet");
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Function to save the vehicle
  const saveVehicle = async () => {
    if (!vehicleData) return;
    
    setIsSaving(true);
    
    try {
      // In a real implementation, you would make an API call to save the vehicle
      console.log("Saving vehicle:", {
        ...vehicleData,
        nickname: nickname.trim() || `${vehicleData.make} ${vehicleData.model}`,
      });
      
      // Navigate back to the vehicles list or dashboard
      router.replace("/");
    } catch (err) {
      console.error("Error saving vehicle:", err);
      setError("Failed to save vehicle");
    } finally {
      setIsSaving(false);
    }
  };

  // Clear vehicle data to restart the search
  const clearVehicleData = () => {
    setVehicleData(null);
    setLicensePlate("");
    setNickname("");
    setError(null);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="px-4 pt-4 pb-2 flex-row items-center border-b border-gray-100">
            <Pressable 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center mr-3 active:bg-gray-100"
            >
              <ArrowLeft size={24} color="#111" />
            </Pressable>
            <Text className="text-xl font-bold flex-1">Legg til kjøretøy</Text>
          </View>
          
          <View className="p-6">
            {!vehicleData ? (
              <>
                <Text className="text-base text-gray-700 mb-2">
                  Søk etter kjøretøyet ditt ved å skrive inn registreringsnummeret
                </Text>
                
                <View className="flex-row items-center gap-2 mb-4">
                  <View className="flex-1 border border-gray-300 rounded-lg px-3 py-2 flex-row items-center">
                    <TextInput
                      className="flex-1 text-base h-10"
                      placeholder="F.eks. EE47617"
                      value={licensePlate}
                      onChangeText={setLicensePlate}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={8}
                    />
                    {licensePlate.length > 0 && (
                      <Pressable onPress={() => setLicensePlate("")}>
                        <X size={20} color="#999" />
                      </Pressable>
                    )}
                  </View>
                  
                  <Pressable
                    onPress={searchVehicle}
                    disabled={isSearching || !licensePlate.trim()}
                    className={`${
                      isSearching || !licensePlate.trim() ? "bg-gray-300" : "bg-[#22000A]"
                    } rounded-lg px-4 py-3 items-center justify-center`}
                  >
                    {isSearching ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Search size={20} color="#ffffff" />
                    )}
                  </Pressable>
                </View>
                
                {error && (
                  <View className="flex-row items-center bg-red-50 p-3 rounded-lg mb-4">
                    <AlertCircle size={20} color="#ef4444" />
                    <Text className="text-red-700 ml-2">{error}</Text>
                  </View>
                )}
                
                <Text className="text-sm text-gray-500 mt-4">
                  Vi bruker data fra Statens Vegvesen for å finne informasjon om kjøretøyet ditt.
                </Text>
              </>
            ) : (
              <>
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xl font-bold">Kjøretøydetaljer</Text>
                    <Pressable 
                      onPress={clearVehicleData}
                      className="px-3 py-1 border border-gray-300 rounded-lg"
                    >
                      <Text className="text-sm">Søk på nytt</Text>
                    </Pressable>
                  </View>
                  
                  <View className="bg-green-50 p-3 rounded-lg mb-4 flex-row items-center">
                    <Check size={20} color="#10b981" />
                    <Text className="text-green-700 ml-2">Kjøretøy funnet!</Text>
                  </View>
                  
                  <View className="bg-gray-50 p-4 rounded-lg mb-4">
                    <Text className="text-lg font-semibold mb-2">
                      {vehicleData.make} {vehicleData.model}
                    </Text>
                    <View className="flex-row flex-wrap">
                      <View className="mr-4 mb-2">
                        <Text className="text-gray-500 text-sm">Årsmodell</Text>
                        <Text className="font-medium">{vehicleData.year}</Text>
                      </View>
                      <View className="mr-4 mb-2">
                        <Text className="text-gray-500 text-sm">Reg.nr</Text>
                        <Text className="font-medium">{vehicleData.registrationNumber}</Text>
                      </View>
                      {vehicleData.color && (
                        <View className="mr-4 mb-2">
                          <Text className="text-gray-500 text-sm">Farge</Text>
                          <Text className="font-medium">{vehicleData.color}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View className="mb-4">
                    <Text className="text-base font-medium mb-2">Gi kjøretøyet et kallenavn (valgfritt)</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-2 h-12 text-base"
                      placeholder="F.eks. Familiebilen"
                      value={nickname}
                      onChangeText={setNickname}
                    />
                  </View>
                  
                  <Pressable
                    onPress={saveVehicle}
                    disabled={isSaving}
                    className={`${
                      isSaving ? "bg-gray-300" : "bg-[#22000A]"
                    } rounded-lg py-3 items-center justify-center mt-4`}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-white font-semibold text-base">Legg til kjøretøy</Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
