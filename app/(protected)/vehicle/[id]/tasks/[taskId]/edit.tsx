import { View, ScrollView, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import React, { useState, useRef } from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Check, ChevronDown } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTodoById, updateTodo } from "@/lib/db";
import { useAuth } from "@/context/supabase-provider";
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from "date-fns";

// Task type mapping (to decide icon in the UI)
const taskTypes = [
  { id: "oil", name: "Oljeskift" },
  { id: "maintenance", name: "Vedlikehold" },
  { id: "wash", name: "Vask" },
  { id: "inspection", name: "Kontroll" },
  { id: "general", name: "Annen oppgave" },
];

// Priority options
const priorityOptions = [
  { id: "1", name: "Lav", color: "#10B981" },
  { id: "2", name: "Medium", color: "#F59E0B" },
  { id: "3", name: "Høy", color: "#EF4444" },
];

// Define TodoTask type
interface TodoTask {
  id: string;
  user_id: string;
  vehicle_id: string;
  task: string;
  priority: string;
  dueDate: string;
  notes: string;
  type: string;
  is_complete: boolean;
  inserted_at: string;
}

export default function EditTask() {
  const { id, taskId } = useLocalSearchParams<{ id: string, taskId: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<TextInput>(null);
  
  const [task, setTask] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [type, setType] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  // Query to fetch the task
  const { data: taskData, isLoading } = useQuery<TodoTask>({
    queryKey: ['task', taskId, session?.user.id],
    queryFn: () => getTodoById(taskId as string, session?.user.id as string),
    enabled: !!taskId && !!session?.user.id,
  });

  // Update form when task data is loaded
  React.useEffect(() => {
    if (taskData) {
      setTask(taskData.task);
      setNotes(taskData.notes);
      setPriority(taskData.priority);
      setDueDate(new Date(taskData.dueDate));
      setType(taskData.type);
    }
  }, [taskData]);

  // Mutation to update task
  const { mutate: updateTask, isPending: updating } = useMutation({
    mutationFn: () => updateTodo(taskId as string, session?.user.id as string, {
      task,
      notes,
      priority,
      dueDate: dueDate.toISOString(),
      type
    }),
    onSuccess: () => {
      // Invalidate all todos queries
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId, session?.user.id] });
      router.back();
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Could not update task');
    }
  });

  const handleSave = () => {
    if (!task.trim()) {
      Alert.alert('Error', 'Task name is required');
      return;
    }
    updateTask();
  };

  const handleNotesFocus = () => {
    // Add a small delay to ensure the keyboard is shown
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#22000A" />
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
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Header */}
          <View className="px-4 pt-4 pb-2 flex-row items-center border-b border-gray-100">
            <Pressable 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center mr-3 active:bg-gray-100"
            >
              <ArrowLeft size={24} color="#111" />
            </Pressable>
            <Text className="text-xl font-bold">Rediger oppgave</Text>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 px-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Task Name */}
            <View className="mt-6">
              <Text className="text-base font-bold mb-2">Oppgavenavn</Text>
              <TextInput
                value={task}
                onChangeText={setTask}
                className="bg-gray-50 p-4 rounded-lg text-base"
                placeholder="Skriv oppgavenavn"
              />
            </View>

            {/* Priority */}
            <View className="mt-6">
              <Text className="text-base font-bold mb-2">Prioritet</Text>
              <Pressable 
                onPress={() => setShowPriorityPicker(!showPriorityPicker)}
                className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View 
                    style={{ backgroundColor: priorityOptions.find(p => p.name === priority)?.color || "#F59E0B" }}
                    className="w-4 h-4 rounded-full mr-2"
                  />
                  <Text className="text-gray-900">{priority || "Medium"}</Text>
                </View>
                <ChevronDown size={18} color="#9ca3af" />
              </Pressable>
              
              {/* Priority options */}
              {showPriorityPicker && (
                <View className="bg-white rounded-lg mt-1 border border-gray-200 shadow-sm overflow-hidden">
                  {priorityOptions.map(option => (
                    <View key={option.id} className="border-b border-gray-100">
                      <Pressable 
                        onPress={() => {
                          setPriority(option.name);
                          setShowPriorityPicker(false);
                        }}
                        className={`px-4 py-3 flex-row items-center justify-between active:bg-gray-50 active:rounded-xl my-0.5 ${
                          priority === option.name ? 'bg-gray-50' : ''
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View 
                            style={{ backgroundColor: option.color }}
                            className="w-4 h-4 rounded-full mr-2"
                          />
                          <Text className="text-gray-900">{option.name}</Text>
                        </View>
                        {priority === option.name && (
                          <Check size={18} color="#10B981" />
                        )}
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Due Date */}
            <View className="mt-6">
              <Text className="text-base font-bold mb-2">Frist</Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <Text className="text-base">{format(dueDate, 'dd.MM.yyyy')}</Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDueDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Task Type */}
            <View className="mt-6">
              <Text className="text-base font-bold mb-2">Type oppgave</Text>
              <Pressable 
                onPress={() => setShowTypePicker(!showTypePicker)}
                className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Text className="text-gray-900">
                    {taskTypes.find(t => t.id === type)?.name || 'Annen oppgave'}
                  </Text>
                </View>
                <ChevronDown size={18} color="#9ca3af" />
              </Pressable>
              
              {/* Task type options */}
              {showTypePicker && (
                <View className="bg-white rounded-lg mt-1 border border-gray-200 shadow-sm overflow-hidden">
                  {taskTypes.map(taskType => (
                    <View key={taskType.id} className="border-b border-gray-100">
                      <Pressable 
                        onPress={() => {
                          setType(taskType.id);
                          setShowTypePicker(false);
                        }}
                        className={`px-4 py-3 flex-row items-center justify-between active:bg-gray-50 active:rounded-xl my-0.5 ${
                          type === taskType.id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <Text className="text-gray-900">{taskType.name}</Text>
                        {type === taskType.id && (
                          <Check size={18} color="#10B981" />
                        )}
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Notes */}
            <View className="mt-6">
              <Text className="text-base font-bold mb-2">Notater</Text>
              <TextInput
                ref={notesInputRef}
                value={notes}
                onChangeText={setNotes}
                onFocus={handleNotesFocus}
                className="bg-gray-50 p-4 rounded-lg text-base"
                placeholder="Legg til notater"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Save Button */}
            <Pressable 
              onPress={handleSave}
              disabled={updating}
              className={`bg-[#22000A] py-4 rounded-lg items-center justify-center my-6 ${
                updating ? 'opacity-70' : 'active:opacity-90'
              }`}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">Lagre endringer</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 