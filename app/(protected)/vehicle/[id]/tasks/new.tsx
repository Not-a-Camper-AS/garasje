import { View, ScrollView, Pressable, TextInput, Alert, Modal, Platform, KeyboardAvoidingView } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useState, useRef } from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Calendar, Check, ChevronDown, AlertCircle, Clock, X } from "lucide-react-native";
import { useAuth } from "@/context/supabase-provider";
import { Vehicle } from "@/types/vehicle";
import { supabase } from "@/config/supabase";
import { useQuery, useMutation, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import { createTodo } from "@/lib/db";
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addDays, addWeeks, addMonths, parseISO } from 'date-fns';


// Task priority options
const priorityOptions = [
  { id: "1", name: "Lav", color: "#10B981" },
  { id: "2", name: "Medium", color: "#F59E0B" },
  { id: "3", name: "Høy", color: "#EF4444" },
];

// Due date options
const dueDateOptions = [
  { id: "1", name: "Idag", value: new Date() },
  { id: "2", name: "Imorgen", value: addDays(new Date(), 1) },
  { id: "3", name: "Denne uken", value: addDays(new Date(), 3) },
  { id: "4", name: "Neste uke", value: addWeeks(new Date(), 1) },
  { id: "5", name: "Neste måned", value: addMonths(new Date(), 1) },
  { id: "6", name: "Egendefinert dato", value: null },
];

// Task type mapping (to decide icon in the UI)
const taskTypes = [
  { id: "oil", name: "Oljeskift" },
  { id: "maintenance", name: "Vedlikehold" },
  { id: "wash", name: "Vask" },
  { id: "inspection", name: "Kontroll" },
  { id: "general", name: "Annen oppgave" },
];

// Function to fetch vehicle by ID
const fetchVehicle = async (vehicleId: string, userId: string): Promise<Vehicle> => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Vehicle;
};

// Function to create a new task
const createTask = async ({ 
  userId, 
  vehicleId, 
  taskData 
}: { 
  userId: string; 
  vehicleId: string; 
  taskData: { 
    task: string; 
    priority: string; 
    dueDate: string; 
    notes: string; 
    type: string; 
  }; 
}) => {
  const { data, error } = await supabase
    .from('todos')
    .insert([
      {
        user_id: userId,
        vehicle_id: vehicleId,
        task: taskData.task,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        notes: taskData.notes,
        type: taskData.type,
        is_complete: false
      }
    ])
    .select()
    .single()
    .throwOnError();

  return data;
};

export default function NewTask() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<TextInput>(null);
  const [title, setTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [selectedDueDate, setSelectedDueDate] = useState('Idag');
  const [customDate, setCustomDate] = useState(new Date());
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [selectedType, setSelectedType] = useState('general');
  const [notes, setNotes] = useState('');
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  
  // Query to fetch vehicle data
  const { data: vehicle, isLoading: loading, error: vehicleError } = useQuery({
    queryKey: ['vehicle', id, session?.user.id],
    queryFn: () => fetchVehicle(id as string, session?.user.id as string),
    enabled: !!id && !!session?.user.id,
    onSuccess: (data: Vehicle) => {
      // Vehicle data loaded successfully
    },
    onError: (error: Error) => {
      console.error('Error fetching vehicle:', error);
      Alert.alert('Error', 'Could not load vehicle details');
      router.back();
    }
  } as UseQueryOptions<Vehicle, Error, Vehicle, (string | undefined)[]>);
  
  // Mutation to create a new task
  const { mutate: saveTask, isPending: saving } = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', id, session?.user.id] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      router.replace(`/vehicle/${id}/tasks`);
    },
    onError: (error: Error) => {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Could not save task. Please try again.');
    }
  });
  
  // Get color for selected priority
  const getPriorityColor = (priorityName: string) => {
    const priority = priorityOptions.find(p => p.name === priorityName);
    return priority ? priority.color : "#F59E0B";
  };
  
  // Get formatted due date for display
  const getFormattedDueDate = () => {
    if (selectedDueDate === 'Egendefinert dato') {
      return format(customDate, 'dd.MM.yyyy');
    }
    
    return selectedDueDate;
  };
  
  // Get actual due date value for database
  const getDueDateValue = () => {
    if (selectedDueDate === 'Egendefinert dato') {
      return format(customDate, 'yyyy-MM-dd');
    }
    
    const option = dueDateOptions.find(opt => opt.name === selectedDueDate);
    if (option && option.value) {
      return format(option.value, 'yyyy-MM-dd');
    }
    
    return format(new Date(), 'yyyy-MM-dd');
  };
  
  // Handle custom date change
  const onCustomDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setCustomDate(selectedDate);
      setSelectedDueDate('Egendefinert dato');
      if (Platform.OS === 'android') {
        setShowCustomDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowCustomDatePicker(false);
    }
  };
  
  // Figure out task type based on title (simple classification)
  const determineTaskType = (taskTitle: string) => {
    const lowerTitle = taskTitle.toLowerCase();
    
    if (lowerTitle.includes('olje') || lowerTitle.includes('oil')) {
      return 'oil';
    } else if (lowerTitle.includes('vask') || lowerTitle.includes('wash')) {
      return 'wash';
    } else if (lowerTitle.includes('kontroll') || lowerTitle.includes('check') || 
               lowerTitle.includes('inspect')) {
      return 'inspection';
    } else if (lowerTitle.includes('service') || lowerTitle.includes('maintenance') || 
               lowerTitle.includes('vedlikehold') || lowerTitle.includes('reparer')) {
      return 'maintenance';
    }
    
    return 'general';
  };
  
  // Handle saving the task
  const handleSave = () => {
    if (!title.trim() || !vehicle || !session?.user.id) {
      return;
    }
    
    // Determine the task type from the title if not selected manually
    const taskType = selectedType || determineTaskType(title);
    
    // Get formatted due date value
    const dueDateValue = getDueDateValue();
    
    // Trigger mutation
    saveTask({
      userId: session.user.id,
      vehicleId: vehicle.id,
      taskData: {
        task: title,
        priority: selectedPriority,
        dueDate: dueDateValue,
        notes: notes,
        type: taskType
      }
    });
  };
  
  const handleNotesFocus = () => {
    // Add a small delay to ensure the keyboard is shown
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }
  
  if (vehicleError || !vehicle) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Vehicle not found</Text>
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
              <Text className="text-xl font-bold">Planlegg vedlikehold</Text>
            </View>
            <Pressable 
              onPress={handleSave}
              disabled={!title.trim() || saving}
              className={`px-4 py-2 rounded-full ${!title.trim() || saving ? 'bg-gray-200' : 'bg-[#22000A]'} items-center justify-center active:opacity-90`}
            >
              <Text className={`text-base font-medium ${!title.trim() || saving ? 'text-gray-500' : 'text-white'}`}>
                {saving ? "Lagrer..." : "Lagre"}
              </Text>
            </Pressable>
          </View>
          
          {/* Form */}
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 px-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title input */}
            <View className="mt-5">
              <Text className="text-base font-bold mb-2">Hvilket vedlikehold planlegger du?</Text>
              <TextInput
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  // Auto-select type based on title
                  if (text && !selectedType) {
                    setSelectedType(determineTaskType(text));
                  }
                }}
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
                    <View key={priority.id} className="border-b border-gray-100">
                      <Pressable 
                        onPress={() => {
                          setSelectedPriority(priority.name);
                          setShowPriorityPicker(false);
                        }}
                        className={`px-4 py-3 flex-row items-center justify-between active:bg-gray-50 active:rounded-xl my-0.5 ${
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
                    </View>
                  ))}
                </View>
              )}
            </View>
            
            {/* Task type picker */}
            <View className="mt-5">
              <Text className="text-base font-bold mb-2">Type oppgave</Text>
              <Pressable 
                onPress={() => setShowTypePicker(!showTypePicker)}
                className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Text className="text-gray-900">
                    {taskTypes.find(t => t.id === selectedType)?.name || 'Annen oppgave'}
                  </Text>
                </View>
                <ChevronDown size={18} color="#9ca3af" />
              </Pressable>
              
              {/* Task type options */}
              {showTypePicker && (
                <View className="bg-white rounded-lg mt-1 border border-gray-200 shadow-sm overflow-hidden">
                  {taskTypes.map(type => (
                    <View key={type.id} className="border-b border-gray-100">
                      <Pressable 
                        onPress={() => {
                          setSelectedType(type.id);
                          setShowTypePicker(false);
                        }}
                        className={`px-4 py-3 flex-row items-center justify-between active:bg-gray-50 active:rounded-xl my-0.5 ${
                          selectedType === type.id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <Text className="text-gray-900">{type.name}</Text>
                        {selectedType === type.id && (
                          <Check size={18} color="#10B981" />
                        )}
                      </Pressable>
                    </View>
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
                <View className="flex-row items-center gap-2">
                  <Calendar size={18} color="#111" />
                  <Text className="text-gray-900">{getFormattedDueDate()}</Text>
                </View>
                <ChevronDown size={18} color="#9ca3af" />
              </Pressable>
              
              {/* Due date options */}
              {showDueDatePicker && (
                <View className="bg-white rounded-lg mt-1 border border-gray-200 shadow-sm overflow-hidden">
                  {dueDateOptions.map(option => (
                    <View key={option.id} className="border-b border-gray-100">
                      <Pressable 
                        onPress={() => {
                          setSelectedDueDate(option.name);
                          if (option.name === 'Egendefinert dato') {
                            setShowCustomDatePicker(true);
                          }
                          setShowDueDatePicker(false);
                        }}
                        className={`px-4 py-3 flex-row items-center justify-between active:bg-gray-50 active:rounded-xl my-0.5 ${
                          selectedDueDate === option.name ? 'bg-gray-50' : ''
                        }`}
                      >
                        <View className="flex-row items-center gap-2">
                          {option.name === 'Egendefinert dato' ? (
                            <Calendar size={18} color="#111" className="mr-2" />
                          ) : (
                            <Clock size={18} color="#111" className="mr-2" />
                          )}
                          <Text className="text-gray-900">{option.name}</Text>
                        </View>
                        {selectedDueDate === option.name && (
                          <Check size={18} color="#10B981" />
                        )}
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
            
            {/* Custom Date Picker Button for direct access */}
            {selectedDueDate === 'Egendefinert dato' && (
              <View className="mt-2">
                <Pressable 
                  onPress={() => setShowCustomDatePicker(true)}
                  className="bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-2">
                    <Calendar size={18} color="#111" />
                    <Text className="text-gray-900">Åpne datovelger ({format(customDate, 'dd.MM.yyyy')})</Text>
                  </View>
                </Pressable>
              </View>
            )}
            
            {/* Custom Date Picker Modal */}
            {showCustomDatePicker && (
              Platform.OS === 'ios' ? (
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={showCustomDatePicker}
                  onRequestClose={() => setShowCustomDatePicker(false)}
                >
                  <View className="flex-1 justify-end bg-black/50">
                    <SafeAreaView edges={['bottom']} className="bg-white rounded-t-2xl">
                      <View className="p-4">
                        <View className="flex-row justify-between items-center mb-4">
                          <Text className="text-lg font-bold">Velg dato</Text>
                          <Pressable 
                            onPress={() => setShowCustomDatePicker(false)}
                            className="p-2 rounded-full active:bg-gray-100"
                          >
                            <X size={22} color="#111" />
                          </Pressable>
                        </View>
                        
                        <View className="items-center mb-4">
                          <Text className="text-lg text-center font-medium mb-2">
                            {format(customDate, 'dd. MMMM yyyy')}
                          </Text>
                        </View>
                        
                        <DateTimePicker
                          testID="dateTimePicker"
                          value={customDate}
                          mode="date"
                          is24Hour={true}
                          display="spinner"
                          onChange={onCustomDateChange}
                          minimumDate={new Date()}
                          style={{ height: 150, width: '100%' }}
                        />
                        
                        <View className="flex-row justify-end mt-4 mb-2">
                          <Pressable
                            onPress={() => setShowCustomDatePicker(false)}
                            className="px-6 py-3 bg-gray-200 rounded-full mr-2"
                          >
                            <Text className="font-medium">Avbryt</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => setShowCustomDatePicker(false)}
                            className="px-6 py-3 bg-[#22000A] rounded-full"
                          >
                            <Text className="text-white font-medium">Bekreft</Text>
                          </Pressable>
                        </View>
                      </View>
                    </SafeAreaView>
                  </View>
                </Modal>
              ) : (
                <DateTimePicker
                  testID="dateTimePickerAndroid"
                  value={customDate}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={onCustomDateChange}
                  minimumDate={new Date()}
                />
              )
            )}
            
            {/* Notes */}
            <View className="mt-5 mb-10">
              <Text className="text-base font-bold mb-2">Notater (valgfritt)</Text>
              <TextInput
                ref={notesInputRef}
                value={notes}
                onChangeText={setNotes}
                onFocus={handleNotesFocus}
                placeholder="Ytterligere detaljer..."
                className="bg-gray-50 px-4 py-3 rounded-lg text-base border border-gray-200 min-h-[100]"
                multiline={true}
                placeholderTextColor="#9ca3af"
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 