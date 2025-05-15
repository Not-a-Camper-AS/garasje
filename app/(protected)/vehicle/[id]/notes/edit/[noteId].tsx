import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Save, Pencil, FileText } from "lucide-react-native";

// Mock notes data (same as in [noteId].tsx)
const mockNotes = [
  { id: "1", title: "Riper i lakken", content: "Noterte riper i lakken på passasjersiden etter parkering på kjøpesenter. Ser ut til å være ca 10cm lang og nokså grunn. Bør vurdere å fikse dette ved neste service, eller se om det kan poleres bort. Bilen ble parkert ved Storosenteret 12. august, og ripene ble oppdaget da jeg kom tilbake etter handletur.", date: "12. aug 2023", icon: <Pencil size={16} className="text-indigo-600" /> },
  { id: "2", title: "Kjøring i utlandet", content: "Husk å ta med internasjonalt førerkort og forsikringsbevis ved kjøring i utlandet. Også sjekk lokale trafikkregler for landet du skal besøke. For kjøring i Spania og Frankrike kreves refleksvest, varseltrekant og reservepærer. Bilforsikringen dekker kjøring i Europa inntil 3 måneder.", date: "5. jul 2023", icon: <FileText size={16} className="text-indigo-600" /> },
  { id: "3", title: "Støy fra motor", content: "Hører en svak tikking fra motoren ved tomgang når den er kald. Forsvinner når motoren er varm. Nevnte dette for mekaniker ved siste service, men de fant ikke noe unormalt. Bør følges med på om lyden blir sterkere over tid.", date: "23. jun 2023", icon: <FileText size={16} className="text-indigo-600" /> },
];

export default function EditNote() {
  const { id, noteId } = useLocalSearchParams<{ id: string; noteId: string }>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Find the note from our mock data
  const note = mockNotes.find(n => n.id === noteId);
  
  // Populate the form with existing note data
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);
  
  // Track changes
  useEffect(() => {
    if (note) {
      const titleChanged = title !== note.title;
      const contentChanged = content !== note.content;
      setHasUnsavedChanges(titleChanged || contentChanged);
    }
  }, [title, content, note]);
  
  // Handle back with unsaved changes
  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Uslagrede endringer",
        "Du har gjort endringer som ikke er lagret. Vil du lagre før du går tilbake?",
        [
          {
            text: "Forkast",
            onPress: () => router.back(),
            style: "destructive"
          },
          {
            text: "Avbryt",
            style: "cancel"
          },
          {
            text: "Lagre", 
            onPress: handleSave
          }
        ]
      );
    } else {
      router.back();
    }
  };
  
  // Handle saving the note
  const handleSave = () => {
    if (!canSave) return;
    
    setLoading(true);
    
    // Simulate API call to update note
    setTimeout(() => {
      console.log("Updating note:", { id: noteId, title, content, vehicleId: id });
      setLoading(false);
      setHasUnsavedChanges(false);
      
      // Navigate back to the note detail
      router.back();
    }, 500);
  };
  
  // Validate form
  const canSave = title.trim().length > 0 && content.trim().length > 0 && !loading;
  
  // Handle note not found
  if (!note) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <View className="p-4 flex-1">
          <View className="flex-row items-center mb-6">
            <Pressable
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="mr-3"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </Pressable>
            <Text className="text-2xl font-bold text-gray-900">Rediger notat</Text>
          </View>
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-gray-500">Notatet ble ikke funnet</Text>
            <Pressable 
              onPress={() => router.back()}
              className="mt-4 bg-indigo-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Gå tilbake</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
                onPress={handleBack}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="mr-3"
              >
                <ArrowLeft size={24} className="text-gray-700" />
              </Pressable>
              <Text className="text-2xl font-bold text-gray-900">Rediger notat</Text>
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
              className={`flex-row items-center justify-center py-3 px-4 rounded-lg ${canSave ? (hasUnsavedChanges ? 'bg-indigo-600' : 'bg-green-600') : 'bg-gray-300'}`}
            >
              <Save size={20} color="white" className="mr-2" />
              <Text className="text-white font-medium">
                {loading ? "Lagrer..." : "Lagre endringer"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 