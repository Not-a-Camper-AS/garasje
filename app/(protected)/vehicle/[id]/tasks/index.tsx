import { View, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useState, useEffect } from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Clock, Plus, DropletIcon, Wrench, ArrowLeft, Battery, Fuel } from "lucide-react-native";
import { useAuth } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";
import { Vehicle } from "@/types/vehicle";
import { getTodos } from "@/lib/db";
import { TodoTask } from "@/types/todo";
import { format } from "date-fns";


// Get icon for todo task based on task type
const getTodoIcon = (taskType: string | undefined, isCompleted = false) => {
  const color = isCompleted ? "#10B981" : "#F59E0B";
  
  switch (taskType) {
    case "oil":
      return <DropletIcon size={14} color={color} />;
    case "maintenance":
      return <Wrench size={14} color={color} />;
    case "wash":
      return <DropletIcon size={14} color={color} />;
    case "inspection":
      return <Wrench size={14} color={color} />;
    case "battery":
      return <Battery size={14} color={color} />;
    case "fuel":
      return <Fuel size={14} color={color} />;
    default:
      return <Clock size={14} color={color} />;
  }
};

const TaskItem = ({ 
  title, 
  date, 
  icon, 
  color = "bg-amber-50",
  textColor = "text-amber-700",
  taskId,
  vehicleId
}: { 
  title: string; 
  date: string;
  icon: React.ReactNode;
  color?: string;
  textColor?: string;
  taskId: string;
  vehicleId: string;
}) => (
  <View className="border-b border-gray-100">
    <Pressable 
      className="flex-row items-center py-3 px-4 active:bg-gray-50 active:rounded-xl my-0.5"
      onPress={() => router.push(`/vehicle/${vehicleId}/tasks/${taskId}`)}
    >
      <View className={`w-10 h-10 rounded-lg ${color} items-center justify-center mr-4`}>
        {icon}
      </View>
      <Text className="text-base font-medium text-gray-900 flex-1">{title}</Text>
      <View className={`${color} rounded-full px-3 py-1.5`}>
        <Text className={`text-sm ${textColor}`}>{format(date, 'dd.MM.yyyy')}</Text>
      </View>
    </Pressable>
  </View>
);


export default function VehicleTasks() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch real vehicle data and tasks
  useEffect(() => {
    const fetchVehicleAndTasks = async () => {
      if (!id || !session?.user.id) return;
      
      try {
        setLoading(true);
        
        // Fetch vehicle
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', id)
          .eq('user_id', session.user.id)
          .single();
          
        if (vehicleError) {
          console.error('Error fetching vehicle:', vehicleError);
          Alert.alert('Error', 'Could not load vehicle details');
          router.back();
          return;
        }
        
        if (vehicleData) {
          setVehicle(vehicleData as Vehicle);
          
          // Fetch tasks for this vehicle
          try {
            const tasksData = await getTodos(session.user.id, id as string);
            setTasks(tasksData || []);
          } catch (taskError) {
            console.error('Error fetching tasks:', taskError);
            Alert.alert('Error', 'Could not load tasks');
          }
        } else {
          Alert.alert('Not Found', 'Vehicle not found');
          router.back();
        }
      } catch (error) {
        console.error('Error in fetch effect:', error);
        Alert.alert('Error', 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicleAndTasks();
  }, [id, session?.user.id]);
  
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#22000A" />
      </SafeAreaView>
    );
  }
  
  if (!vehicle) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
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
            <Text className="text-xl font-bold">Planlagte oppgaver</Text>
          </View>
          <Pressable 
            onPress={() => router.push(`/vehicle/${id}/tasks/new`)}
            className="w-10 h-10 rounded-full bg-[#22000A] items-center justify-center active:opacity-90"
          >
            <Plus size={22} color="#fff" />
          </Pressable>
        </View>
        
        {/* Tasks List */}
        <ScrollView className="flex-1 px-4">
          <View className="py-4 flex-row items-center">
            <Clock size={20} color="#F59E0B" />
            <Text className="text-lg font-bold ml-2">Kommende vedlikehold</Text>
          </View>
          
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              title={task.task}
              date={task.dueDate}
              icon={getTodoIcon(task.type)}
              color="bg-amber-50"
              textColor="text-amber-700"
              taskId={task.id}
              vehicleId={id as string}
            />
          ))}

          {tasks.length === 0 && (
            <View className="py-10 items-center">
              <Text className="text-gray-500 text-center">Ingen aktive oppgaver</Text>
              <Pressable
                onPress={() => router.push(`/vehicle/${id}/tasks/new`)}
                className="mt-4 bg-[#22000A] rounded-full px-5 py-2"
              >
                <Text className="text-white font-medium">Legg til oppgave</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 