import { router } from "expo-router";
import { FlatList, View, useWindowDimensions, Pressable } from "react-native";
import { useState, useRef } from "react";

import { Text } from "@/components/ui/text";
import { VehicleCard } from "@/components/VehicleCard";
import { Vehicle } from "@/types/vehicle";
import { SafeAreaView } from "@/components/safe-area-view";
import { ClipboardList, Wrench, ChevronRight } from "lucide-react-native";

// Temporary mock data - replace with actual data from your backend
const mockVehicles: Vehicle[] = [
	{
		id: "1",
		make: "Toyota",
		model: "Corolla",
		year: 2020,
		licensePlate: "ABC123",
		color: "Silver",
		type: "car",
		nickname: "My Car",
	},
	{
		id: "2",
		make: "Honda",
		model: "Civic",
		year: 2021,
		licensePlate: "XYZ789",
		color: "Blue",
		type: "car",
		nickname: "My Honda",
	},
	{
		id: "3",
		make: "Bike",
		model: "Mountain Bike",
		year: 2022,
		licensePlate: "DEF456",
		color: "Red",
		type: "bike",
		nickname: "My Bike",
	},
];

// Action button component
const ActionButton = ({ 
	label, 
	icon, 
	onPress 
}: {
	label: string;
	icon: React.ReactNode;
	onPress: () => void;
}) => (
	<Pressable 
		className="bg-white rounded-3xl py-4 px-5 flex-row items-center shadow-sm mb-3"
		onPress={onPress}
	>
		<View className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center mr-3">
			{icon}
		</View>
		<Text className="text-lg font-semibold text-gray-900 flex-1">{label}</Text>
		<ChevronRight size={20} className="text-gray-400" />
	</Pressable>
);

export default function Home() {
	const { width } = useWindowDimensions();
	const CARD_WIDTH = width * 0.85;
	const SPACING = width * 0.075; // Spacing on each side (7.5% of width)
	const ITEM_WIDTH = width;
	
	const [currentIndex, setCurrentIndex] = useState(0);
	const flatListRef = useRef<FlatList>(null);
	const currentVehicle = mockVehicles[currentIndex];

	// Handle action button presses
	const handleAddTasks = (vehicleId: string) => {
		router.push(`/(protected)/vehicle/${vehicleId}/tasks/new`);
	};

	const handleLogMaintenance = (vehicleId: string) => {
		router.push(`/(protected)/vehicle/${vehicleId}/maintenance/log`);
	};

	return (
		<SafeAreaView className="flex-1 bg-[#C7F9CC]">
			{/* Large nickname at top */}
			<View className="items-center mt-8 mb-12">
				<Text className="text-5xl font-black text-gray-900 italic">
					{currentVehicle?.nickname || ''}
				</Text>
				<Text className="text-lg text-gray-700 mt-2">
					i forhold til resten av dagen ↓
				</Text>
			</View>

			<FlatList
				ref={flatListRef}
				data={mockVehicles}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				snapToInterval={ITEM_WIDTH}
				decelerationRate="fast"
				snapToAlignment="center"
				keyExtractor={(item) => item.id}
				getItemLayout={(_, index) => ({
					length: ITEM_WIDTH,
					offset: ITEM_WIDTH * index,
					index,
				})}
				onMomentumScrollEnd={e => {
					const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
					setCurrentIndex(index);
				}}
				renderItem={({ item }) => (
					<View style={{ 
						width: ITEM_WIDTH, 
						paddingHorizontal: SPACING,
						justifyContent: "center", 
						alignItems: "center" 
					}}>
						{/* Vehicle Card */}
						<VehicleCard
							vehicle={item}
							onPress={() => router.push(`/(protected)/vehicle/${item.id}`)}
							style={{ width: '100%', marginBottom: 16 }}
						/>
						
						{/* Quick Actions */}
						<View style={{ width: '100%', marginTop: 16 }}>
							<ActionButton 
								label="Add Tasks" 
								icon={<ClipboardList size={20} className="text-indigo-600" />} 
								onPress={() => handleAddTasks(item.id)}
							/>
							<ActionButton 
								label="Log Maintenance" 
								icon={<Wrench size={20} className="text-emerald-600" />} 
								onPress={() => handleLogMaintenance(item.id)}
							/>
						</View>
					</View>
				)}
			/>

			{/* Page indicator */}
			<View className="flex-row justify-center items-center mt-6 mb-4">
				{mockVehicles.map((_, i) => (
					<View
						key={i}
						className={`mx-1 rounded-full ${i === currentIndex ? "bg-gray-900" : "bg-gray-300"}`}
						style={{ width: i === currentIndex ? 10 : 8, height: 8 }}
					/>
				))}
			</View>
		</SafeAreaView>
	);
}
