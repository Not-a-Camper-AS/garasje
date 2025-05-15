import { useLocalSearchParams, router } from "expo-router";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Pencil, FileText, ArrowRight, Plus, ArrowLeft } from "lucide-react-native";

// Mock notes for demonstration
const mockNotes = [
  { id: "1", title: "Riper i lakken", content: "Noterte riper i lakken på passasjersiden etter parkering på kjøpesenter.", date: "3d", icon: <Pencil size={16} className="text-indigo-600" /> },
  { id: "2", title: "Kjøring i utlandet", content: "Husk å ta med internasjonalt førerkort og forsikringsbevis ved kjøring i utlandet.", date: "2u", icon: <FileText size={16} className="text-indigo-600" /> },
  { id: "3", title: "Støy fra motor", content: "Hører en svak tikking fra motoren ved tomgang når den er kald.", date: "1u", icon: <FileText size={16} className="text-indigo-600" /> },
];

// Note item component
const NoteItem = ({ 
  title, 
  content,
  date, 
  icon,
  onPress
}: { 
  title: string;
  content: string;
  date: string;
  icon: React.ReactNode;
  onPress: () => void;
}) => (
  <Pressable 
    className="bg-white mb-3 rounded-xl p-4 border border-indigo-100 active:opacity-70"
    onPress={onPress}
    android_ripple={{ color: 'rgba(79, 70, 229, 0.1)' }}
  >
    <View className="flex-row items-center mb-2">
      <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center mr-3">
        {icon}
      </View>
      <Text className="text-lg font-semibold text-gray-900 flex-1">{title}</Text>
      <View className="bg-indigo-50 rounded-full px-2.5 py-1">
        <Text className="text-sm text-indigo-700">{date}</Text>
      </View>
    </View>
    <Text className="text-base text-gray-700 ml-11" numberOfLines={2}>
      {content}
    </Text>
  </Pressable>
);

export default function VehicleNotes() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const navigateToNote = (noteId: string) => {
    router.push(`/vehicle/${id}/notes/${noteId}`);
  };

  const navigateToAddNote = () => {
    router.push(`/vehicle/${id}/notes/new`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        {/* Header with back button */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Pressable
              onPress={handleBack}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              className="mr-3 p-1"
            >
              <ArrowLeft size={22} className="text-gray-700" />
            </Pressable>
            <Text className="text-2xl font-bold text-gray-900">Notater</Text>
          </View>
          <Pressable 
            className="flex-row items-center bg-indigo-500 px-3 py-2 rounded-lg active:bg-indigo-600"
            onPress={navigateToAddNote}
          >
            <Plus size={16} color="white" className="mr-1" />
            <Text className="text-white font-medium">Nytt notat</Text>
          </Pressable>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {mockNotes.length > 0 ? (
            mockNotes.map(note => (
              <NoteItem
                key={note.id}
                title={note.title}
                content={note.content}
                date={note.date}
                icon={note.icon}
                onPress={() => navigateToNote(note.id)}
              />
            ))
          ) : (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500 text-center mb-2">Ingen notater ennå</Text>
              <Text className="text-gray-500 text-center mb-6">Trykk på 'Nytt notat' for å legge til ditt første notat</Text>
              <Pressable 
                className="bg-indigo-500 px-4 py-2 rounded-lg"
                onPress={navigateToAddNote}
              >
                <Text className="text-white font-medium">Nytt notat</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 