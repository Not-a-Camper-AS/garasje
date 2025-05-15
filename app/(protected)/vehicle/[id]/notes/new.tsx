import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Save } from "lucide-react-native";

export default function AddNewNote() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    // Here you would save the note to your database
    console.log("Saving note:", { title, content, vehicleId: id });
    
    // Navigate back to notes list
    router.back();
  };

  const canSave = title.trim().length > 0 && content.trim().length > 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="p-4 flex-1">
            {/* Header */}
            <View className="flex-row items-center mb-6">
              <Pressable
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="mr-3"
              >
                <ArrowLeft size={24} className="text-gray-700" />
              </Pressable>
              <Text className="text-2xl font-bold text-gray-900">Nytt notat</Text>
            </View>
            
            {/* Form */}
            <View className="mb-4">
              <Text className="text-base font-medium text-gray-700 mb-2">Tittel</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Skriv en tittel..."
                className="border border-gray-300 rounded-lg p-3 text-base bg-white"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View className="mb-6 flex-1">
              <Text className="text-base font-medium text-gray-700 mb-2">Notat</Text>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Skriv ditt notat her..."
                multiline
                className="border border-gray-300 rounded-lg p-3 text-base bg-white flex-1"
                style={{ textAlignVertical: 'top', minHeight: 200 }}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              className={`flex-row items-center justify-center py-3 px-4 rounded-lg ${canSave ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
              <Save size={20} color="white" className="mr-2" />
              <Text className="text-white font-medium">Lagre notat</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 