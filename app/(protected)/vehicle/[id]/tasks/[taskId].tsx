import { View, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Clock, DropletIcon, Wrench, ArrowLeft, CheckCircle, Battery, Fuel, MoreVertical, Pencil, Trash2 } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { getTodoById, completeTodo, deleteTodo, updateTodo } from "@/lib/db";
import { useAuth } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";
import { Vehicle } from "@/types/vehicle";
import { format } from "date-fns";

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

// Get icon for todo task based on task type
const getTodoIcon = (taskType: string | undefined, isCompleted = false) => {
  const color = isCompleted ? "#10B981" : "#F59E0B";
  
  switch (taskType) {
    case "oil":
      return <DropletIcon size={20} color={color} />;
    case "maintenance":
      return <Wrench size={20} color={color} />;
    case "wash":
      return <DropletIcon size={20} color={color} />;
    case "inspection":
      return <Wrench size={20} color={color} />;
    case "battery":
      return <Battery size={20} color={color} />;
    case "fuel":
      return <Fuel size={20} color={color} />;
    default:
      return <Clock size={20} color={color} />;
  }
};

// Get priority color
const getPriorityColor = (priority: string) => {
  switch(priority) {
    case "Høy": return "#EF4444";
    case "Medium": return "#F59E0B";
    case "Lav": return "#10B981";
    default: return "#F59E0B";
  }
};

// Fetch vehicle by ID
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

export default function TaskDetail() {
  const { id, taskId } = useLocalSearchParams<{ id: string, taskId: string }>();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  
  // Query to fetch vehicle data
  const { data: vehicle, isLoading: loadingVehicle } = useQuery({
    queryKey: ['vehicle', id, session?.user.id],
    queryFn: () => fetchVehicle(id as string, session?.user.id as string),
    enabled: !!id && !!session?.user.id,
  });
  
  // Query to fetch the specific task
  const { data: task, isLoading: loadingTask, error: taskError } = useQuery<TodoTask, Error>({
    queryKey: ['task', taskId, session?.user.id],
    queryFn: () => getTodoById(taskId as string, session?.user.id as string),
    enabled: !!taskId && !!session?.user.id,
  });
  
  // Mutation to mark task as completed
  const { mutate: markComplete, isPending: completing } = useMutation({
    mutationFn: () => completeTodo(taskId as string, session?.user.id as string),
    onSuccess: () => {
      // Invalidate todos list for this vehicle to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['todos', id, session?.user.id] });
      router.replace(`/vehicle/${id}/tasks`);
    },
    onError: (error) => {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Could not mark task as completed');
    }
  });
  
  // Mutation to delete task
  const { mutate: deleteTask, isPending: deleting } = useMutation({
    mutationFn: () => deleteTodo(taskId as string, session?.user.id as string),
    onSuccess: () => {
      // Invalidate all todos queries
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      router.replace(`/vehicle/${id}/tasks`);
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Could not delete task');
    }
  });

  const handleMarkComplete = () => {
    markComplete();
  };

  const handleDelete = () => {
    Alert.alert(
      "Slett oppgave",
      "Er du sikker på at du vil slette denne oppgaven?",
      [
        {
          text: "Avbryt",
          style: "cancel"
        },
        {
          text: "Slett",
          style: "destructive",
          onPress: () => deleteTask()
        }
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/vehicle/${id}/tasks/${taskId}/edit`);
  };
  
  if (loadingTask || loadingVehicle) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#22000A" />
      </SafeAreaView>
    );
  }
  
  if (!task || taskError) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text>Oppgave ikke funnet</Text>
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
            <Text className="text-base text-gray-600">{vehicle?.make} {vehicle?.model}</Text>
            <Text className="text-xl font-bold">Oppgavedetaljer</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable 
              onPress={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full items-center justify-center active:bg-gray-100"
            >
              <MoreVertical size={24} color="#111" />
            </Pressable>
            <Pressable 
              onPress={handleMarkComplete}
              disabled={completing}
              className={`px-4 py-2 rounded-full bg-[#22000A] items-center justify-center ${completing ? 'opacity-70' : 'active:opacity-90'}`}
            >
              {completing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-base font-medium text-white">Fullfør</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Menu Overlay */}
        {showMenu && (
          <View className="absolute top-20 right-4 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
            <Pressable 
              onPress={() => {
                setShowMenu(false);
                handleEdit();
              }}
              className="flex-row items-center px-4 py-3 border-b gap-2 border-gray-100 active:bg-gray-50"
            >
              <Pencil size={18} color="#111" className="mr-2" />
              <Text className="text-base">Rediger</Text>
            </Pressable>
            <Pressable 
              onPress={() => {
                setShowMenu(false);
                handleDelete();
              }}
              className="flex-row items-center px-4 gap-2 py-3 active:bg-gray-50"
            >
              <Trash2 size={18} color="#EF4444" className="mr-2" />
              <Text className="text-base text-red-500">Slett</Text>
            </Pressable>
          </View>
        )}
        
        {/* Task Details */}
        <ScrollView className="flex-1 px-4">
          {/* Task Header */}
          <View className="mt-6 mb-4">
            <View className="flex-row">
              <View className={`w-12 h-12 rounded-xl bg-amber-50 items-center justify-center mr-4`}>
                {getTodoIcon(task.type)}
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">{task.task}</Text>
                <View className="flex-row items-center mt-1 gap-2">
                  <Clock size={14} className="text-amber-500" />
                  <Text className="text-sm text-gray-600">{format(task.dueDate, 'dd.MM.yyyy')}</Text>
                </View>
              </View>
            </View>
            
            {/* Priority Badge */}
            <View className="mt-4 flex-row items-center">
              <Text className="text-sm text-gray-600 mr-2">Prioritet:</Text>
              <View 
                style={{ backgroundColor: `${getPriorityColor(task.priority)}20` }}
                className="rounded-full px-3 py-1 flex-row items-center"
              >
                <View 
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                  className="w-2 h-2 rounded-full mr-1.5"
                />
                <Text style={{ color: getPriorityColor(task.priority) }} className="text-sm font-medium">
                  {task.priority}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Description */}
          <View className="mb-6">
            <Text className="text-base font-bold mb-2">Beskrivelse</Text>
            <View className="bg-gray-50 p-4 rounded-lg">
              <Text className="text-base text-gray-700">{task.notes}</Text>
            </View>
          </View>
          
          {/* Created Date */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500">Opprettet: 
              {format(task.inserted_at, 'dd.MM.yyyy')}</Text>
          </View>
          
          {/* Action Button */}
          <Pressable 
            onPress={handleMarkComplete}
            disabled={completing}
            className={`bg-[#22000A] py-4 rounded-lg flex-row items-center justify-center mb-10 gap-2 ${completing ? 'opacity-70' : 'active:opacity-90'}`}
          >
            {completing ? (
              <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />
            ) : (
              <CheckCircle size={20} color="#fff" className="mr-2" />
            )}
            <Text className="text-base font-bold text-white">Marker som fullført</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 