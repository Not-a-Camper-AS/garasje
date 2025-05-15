import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { View, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Edit2, Trash2, Calendar, Pencil, FileText } from "lucide-react-native";

// Mock notes data (in a real app, you'd fetch this from an API or database)
const mockNotes = [
  { id: "1", title: "Riper i lakken", content: "Noterte riper i lakken på passasjersiden etter parkering på kjøpesenter. Ser ut til å være ca 10cm lang og nokså grunn. Bør vurdere å fikse dette ved neste service, eller se om det kan poleres bort. Bilen ble parkert ved Storosenteret 12. august, og ripene ble oppdaget da jeg kom tilbake etter handletur.", date: "12. aug 2023", icon: <Pencil size={16} className="text-indigo-600" /> },
  { id: "2", title: "Kjøring i utlandet", content: "Husk å ta med internasjonalt førerkort og forsikringsbevis ved kjøring i utlandet. Også sjekk lokale trafikkregler for landet du skal besøke. For kjøring i Spania og Frankrike kreves refleksvest, varseltrekant og reservepærer. Bilforsikringen dekker kjøring i Europa inntil 3 måneder.", date: "5. jul 2023", icon: <FileText size={16} className="text-indigo-600" /> },
  { id: "3", title: "Støy fra motor", content: "Hører en svak tikking fra motoren ved tomgang når den er kald. Forsvinner når motoren er varm. Nevnte dette for mekaniker ved siste service, men de fant ikke noe unormalt. Bør følges med på om lyden blir sterkere over tid.", date: "23. jun 2023", icon: <FileText size={16} className="text-indigo-600" /> },
];

export default function ViewNote() {
  const { id, noteId } = useLocalSearchParams<{ id: string; noteId: string }>();
  const [loading, setLoading] = useState(false);
  
  // Find the note from our mock data
  const note = mockNotes.find(n => n.id === noteId);
  
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
            <Text className="text-2xl font-bold text-gray-900">Notat</Text>
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
  
  const handleEdit = () => {
    // Navigate to edit page
    router.push(`/vehicle/${id}/notes/edit/${noteId}`);
  };
  
  const handleDelete = () => {
    Alert.alert(
      "Slett notat",
      "Er du sikker på at du vil slette dette notatet?",
      [
        {
          text: "Avbryt",
          style: "cancel"
        },
        {
          text: "Slett", 
          onPress: () => {
            setLoading(true);
            // Simulate deletion
            setTimeout(() => {
              setLoading(false);
              router.back();
            }, 500);
          },
          style: "destructive"
        }
      ]
    );
  };
  
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-1 p-4">
        {/* Header with back button */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="mr-3"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </Pressable>
            <Text className="text-2xl font-bold text-gray-900">Notat</Text>
          </View>
          
          {/* Actions */}
          <View className="flex-row">
            <Pressable
              onPress={handleEdit}
              className="mr-3 p-2 bg-indigo-50 rounded-full"
              disabled={loading}
            >
              <Edit2 size={20} className="text-indigo-600" />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              className="p-2 bg-red-50 rounded-full"
              disabled={loading}
            >
              <Trash2 size={20} className="text-red-600" />
            </Pressable>
          </View>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Note title */}
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {note.title}
          </Text>
          
          {/* Date */}
          <View className="flex-row items-center mb-4">
            <Calendar size={16} className="text-gray-500 mr-2" />
            <Text className="text-sm text-gray-500">{note.date}</Text>
          </View>
          
          {/* Content */}
          <View className="bg-white p-4 rounded-xl border border-gray-100 mb-4">
            <Text className="text-base text-gray-800 leading-relaxed">
              {note.content}
            </Text>
          </View>

          {/* Related vehicle info could go here */}
          <View className="bg-gray-50 p-4 rounded-xl mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-1">
              Tilknyttet kjøretøy
            </Text>
            <Text className="text-base font-medium text-gray-900">
              {/* Normally you'd fetch vehicle info */}
              Tesla Model 3 (EE 47617)
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 