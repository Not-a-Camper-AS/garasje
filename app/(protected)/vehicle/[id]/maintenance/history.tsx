import { View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/supabase-provider";
import { getMaintenance, getVehicleById } from "@/lib/db";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { CheckCircle2, Plus, DropletIcon, Wrench, ArrowLeft, Calendar, Battery, Fuel } from "lucide-react-native";
import { format } from "date-fns";

// Get icon for maintenance type
const getMaintenanceIcon = (type: string) => {
	switch (type) {
		case "oil":
			return <DropletIcon size={14} className="text-green-600" />;
		case "maintenance":
			return <Wrench size={14} className="text-green-600" />;
		case "wash":
			return <DropletIcon size={14} className="text-green-600" />;
		case "inspection":
			return <Wrench size={14} className="text-green-600" />;
		case "battery":
			return <Battery size={14} className="text-green-600" />;
		case "fuel":
			return <Fuel size={14} className="text-green-600" />;
		default:
			return <Wrench size={14} className="text-green-600" />;
	}
};

const MaintenanceItem = ({ 
	title, 
	date, 
	icon, 
	color = "bg-green-50",
	textColor = "text-green-700",
	onPress
}: { 
	title: string; 
	date: string;
	icon: React.ReactNode;
	color?: string;
	textColor?: string;
	onPress?: () => void;
}) => (
	<View className="border-b border-gray-100">
		<Pressable 
			className="flex-row items-center py-3 px-4 active:bg-gray-50 active:rounded-xl my-0.5"
			onPress={onPress}
		>
			<View className={`w-10 h-10 rounded-lg ${color} items-center justify-center mr-4`}>
				{icon}
			</View>
			<Text className="text-base font-medium text-gray-900 flex-1">{title}</Text>
			<View className={`flex-row items-center`}>
				<Calendar size={14} className="text-gray-400 mr-1.5" />
				<Text className={`text-sm text-gray-500`}>{date}</Text>
			</View>
		</Pressable>
	</View>
);

export default function MaintenanceHistory() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { session } = useAuth();

	const vehicle = useQuery({
		queryKey: ["vehicle", id],
		queryFn: () => getVehicleById(id as string, session?.user.id || ""),
	});

	const maintenance = useQuery({
		queryKey: ["maintenance", id],
		queryFn: () => getMaintenance(session?.user.id || "", id as string),
	});

	return (
		<SafeAreaView className="flex-1 bg-white">
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
						<Text className="text-base text-gray-600">
							{vehicle.data?.make} {vehicle.data?.model}
						</Text>
						<Text className="text-xl font-bold">Vedlikeholdshistorikk</Text>
					</View>
					<Pressable 
						onPress={() => router.push(`/vehicle/${id}/maintenance/log`)}
						className="w-10 h-10 rounded-full bg-[#22000A] items-center justify-center active:opacity-90"
					>
						<Plus size={22} color="#fff" />
					</Pressable>
				</View>
				
				{/* Maintenance History List */}
				<ScrollView className="flex-1 px-4">
					<View className="py-4 flex-row items-center">
						<CheckCircle2 size={20} color="#10B981" />
						<Text className="text-lg font-bold ml-2">Utført vedlikehold</Text>
					</View>
					
					{maintenance.data?.map(task => (
						<MaintenanceItem
							key={task.id}
							title={task.title}
							date={format(new Date(task.date_performed), "dd. MMMM yyyy")}
							icon={getMaintenanceIcon(task.maintenance_type)}
							color="bg-green-50"
							textColor="text-green-700"
							onPress={() => router.push({
								pathname: "/vehicle/[id]/maintenance/[maintenanceId]",
								params: { id: id as string, maintenanceId: task.id }
							})}
						/>
					))}

					{(!maintenance.data || maintenance.data.length === 0) && (
						<View className="py-10 items-center">
							<Text className="text-gray-500 text-center">Ingen vedlikeholdshistorikk</Text>
						</View>
					)}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
} 