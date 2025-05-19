import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/supabase-provider";
import { getMaintenanceById, getVehicleById } from "@/lib/db";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Calendar, DollarSign, Gauge, DropletIcon, Wrench, Battery, Fuel, Pencil } from "lucide-react-native";
import { format } from "date-fns";

// Get icon for maintenance type
const getMaintenanceIcon = (type: string) => {
	switch (type) {
		case "oil":
			return <DropletIcon size={24} className="text-green-600" />;
		case "maintenance":
			return <Wrench size={24} className="text-green-600" />;
		case "wash":
			return <DropletIcon size={24} className="text-green-600" />;
		case "inspection":
			return <Wrench size={24} className="text-green-600" />;
		case "battery":
			return <Battery size={24} className="text-green-600" />;
		case "fuel":
			return <Fuel size={24} className="text-green-600" />;
		default:
			return <Wrench size={24} className="text-green-600" />;
	}
};

const InfoRow = ({ 
	label, 
	value, 
	icon 
}: { 
	label: string; 
	value: string | number | undefined;
	icon: React.ReactNode;
}) => (
	<View className="flex-row items-center py-3 border-b border-gray-100">
		<View className="w-8 h-8 rounded-lg bg-gray-50 items-center justify-center mr-3">
			{icon}
		</View>
		<View className="flex-1">
			<Text className="text-sm text-gray-500">{label}</Text>
			<Text className="text-base font-medium text-gray-900">
				{value || "-"}
			</Text>
		</View>
	</View>
);

export default function MaintenanceDetails() {
	const { id: vehicleId, maintenanceId } = useLocalSearchParams();
	const { session } = useAuth();

	const vehicle = useQuery({
		queryKey: ["vehicle", vehicleId],
		queryFn: () => getVehicleById(vehicleId as string, session?.user.id || ""),
	});

	const maintenance = useQuery({
		queryKey: ["maintenance", maintenanceId],
		queryFn: () => getMaintenanceById(maintenanceId as string, session?.user.id || ""),
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
						<Text className="text-xl font-bold">Vedlikeholdsdetaljer</Text>
					</View>
					<Pressable 
						onPress={() => router.push(`/vehicle/${vehicleId}/maintenance/${maintenanceId}/edit`)}
						className="w-10 h-10 rounded-full bg-[#22000A] items-center justify-center active:opacity-90"
					>
						<Pencil size={20} color="#fff" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-4">
					{maintenance.data && (
						<>
							<View className="py-6 items-center">
								<View className="w-16 h-16 rounded-2xl bg-green-50 items-center justify-center mb-4">
									{getMaintenanceIcon(maintenance.data.maintenance_type)}
								</View>
								<Text className="text-2xl font-bold text-gray-900 text-center">
									{maintenance.data.title}
								</Text>
								{maintenance.data.description && (
									<Text className="text-base text-gray-600 text-center mt-2">
										{maintenance.data.description}
									</Text>
								)}
							</View>

							<View className="bg-white rounded-xl mb-6">
								<InfoRow
									label="Dato utført"
									value={format(new Date(maintenance.data.date_performed), "dd. MMMM yyyy")}
									icon={<Calendar size={16} className="text-gray-400" />}
								/>
								<InfoRow
									label="Kostnad"
									value={maintenance.data.cost ? `${maintenance.data.cost} kr` : undefined}
									icon={<DollarSign size={16} className="text-gray-400" />}
								/>
								<InfoRow
									label="Kilometerstand"
									value={maintenance.data.mileage ? `${maintenance.data.mileage} km` : undefined}
									icon={<Gauge size={16} className="text-gray-400" />}
								/>
							</View>
						</>
					)}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
} 