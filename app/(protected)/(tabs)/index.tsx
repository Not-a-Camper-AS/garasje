import { router } from "expo-router";
import { FlatList, View, useWindowDimensions, Pressable, ScrollView } from "react-native";
import { useState, useRef } from "react";

import { Text } from "@/components/ui/text";
import { Vehicle } from "@/types/vehicle";
import { SafeAreaView } from "@/components/safe-area-view";
import { ClipboardList, Wrench, ChevronRight, Car, Bike, CheckCircle2, Clock, ArrowRight, Plus, Calendar, DropletIcon, Fuel, Battery, PenLine } from "lucide-react-native";

// Temporary mock data - replace with actual data from your backend
const mockVehicles: Vehicle[] = [
	{
		id: "1",
		make: "Toyota",
		model: "Corolla",
		year: 2020,
		licensePlate: "ABC123",
		color: "Sølv",
		type: "car",
		nickname: "Min Bil",
	},
	{
		id: "2",
		make: "Honda",
		model: "Civic",
		year: 2021,
		licensePlate: "XYZ789",
		color: "Blå",
		type: "car",
		nickname: "Min Honda",
	},
	{
		id: "3",
		make: "Bike",
		model: "Mountain Bike",
		year: 2022,
		licensePlate: "DEF456",
		color: "Rød",
		type: "bike",
		nickname: "Min Sykkel",
	},
];

// Mock to-do and completed tasks data
const mockTodos = [
	{ id: "1", title: "Skifte olje", dueDate: "Idag", icon: <DropletIcon size={14} className="text-amber-600" /> },
	{ id: "2", title: "Sjekk dekktrykk", dueDate: "Imorgen", icon: <Wrench size={14} className="text-amber-600" /> },
	{ id: "3", title: "Vask bilen", dueDate: "Neste uke", icon: <DropletIcon size={14} className="text-amber-600" /> },
];

const mockCompletedTasks = [
	{ id: "1", title: "Byttet bremseklosser", date: "2d", icon: <Wrench size={14} className="text-green-600" /> },
	{ id: "2", title: "Fylt spylervæske", date: "1u", icon: <DropletIcon size={14} className="text-green-600" /> },
];

// Quick action pill button component
const QuickAction = ({ 
	label, 
	icon, 
	onPress,
	color = "bg-indigo-500",
	textColor = "text-white"
}: {
	label: string;
	icon: React.ReactNode;
	onPress: () => void;
	color?: string;
	textColor?: string;
}) => (
	<Pressable 
		className={`${color} rounded-full py-1.5 px-3 flex-row items-center mr-2 shadow-sm`}
		onPress={onPress}
	>
		<View className="mr-1">
			{icon}
		</View>
		<Text className={`text-sm font-medium ${textColor}`}>{label}</Text>
	</Pressable>
);

// Section Header component
const SectionHeader = ({
	title,
	onViewMore,
	icon
}: {
	title: string;
	onViewMore: () => void;
	icon: React.ReactNode;
}) => (
	<View className="flex-row items-center justify-between mb-2">
		<View className="flex-row items-center">
			{icon}
			<Text className="text-base font-bold text-gray-900 ml-1">{title}</Text>
		</View>
		<Pressable onPress={onViewMore} className="flex-row items-center">
			<Text className="text-xs font-medium text-gray-600 mr-1">Se alle</Text>
			<ArrowRight size={14} className="text-gray-600" />
		</Pressable>
	</View>
);

export default function Home() {
	const { width } = useWindowDimensions();
	const ITEM_WIDTH = width;
	const SPACING = width * 0.05; // Reduced side padding
	
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

	const handleViewAllTodos = (vehicleId: string) => {
		router.push(`/(protected)/vehicle/${vehicleId}/tasks`);
	};

	const handleViewAllCompleted = (vehicleId: string) => {
		router.push(`/(protected)/vehicle/${vehicleId}/maintenance/history`);
	};

	return (
		<SafeAreaView className="flex-1 bg-[#C7F9CC]">
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
						height: '100%',
						paddingHorizontal: SPACING,
					}}>
						<ScrollView showsVerticalScrollIndicator={false}>
							{/* Vehicle Info */}
							<View className="flex-row items-center justify-between mt-6 mb-4">
								<View className="flex-1">
									{/* Nickname */}
									<Text className="text-4xl font-black text-gray-900 italic mb-0">
										{item.nickname || ''}
									</Text>
									
									{/* Vehicle Details */}
									<View className="flex-row items-center">
										<Text className="text-base font-medium text-gray-700">
											{item.make} {item.model}
										</Text>
										<View className="bg-white/30 rounded-full px-2 py-0.5 ml-2">
											<Text className="text-xs text-gray-600">
												{item.year}
											</Text>
										</View>
										<View className="bg-white/30 rounded-full px-2 py-0.5 ml-1">
											<Text className="text-xs text-gray-600">
												{item.licensePlate}
											</Text>
										</View>
									</View>
								</View>

								{/* Icon */}
								<View className={`w-16 h-16 rounded-full ${item.type === 'bike' ? 'bg-purple-100' : 'bg-blue-100'} items-center justify-center`}>
									{item.type === 'bike' ? (
										<Bike size={30} className="text-purple-700" />
									) : (
										<Car size={30} className="text-blue-700" />
									)}
								</View>
							</View>
							
							{/* Quick Actions */}
							<View className="flex-row flex-wrap mt-1 mb-5">
								<QuickAction 
									label="Ny oppgave" 
									icon={<Plus size={14} className="text-white" />} 
									onPress={() => handleAddTasks(item.id)}
									color="bg-indigo-500"
								/>
								<QuickAction 
									label="Logg vedlikehold" 
									icon={<Wrench size={14} className="text-white" />} 
									onPress={() => handleLogMaintenance(item.id)}
									color="bg-emerald-500"
								/>
								<QuickAction 
									label="Kalender" 
									icon={<Calendar size={14} className="text-gray-700" />} 
									onPress={() => router.push(`/(protected)/vehicle/${item.id}/calendar`)}
									color="bg-white"
									textColor="text-gray-700"
								/>
							</View>

							{/* Recent To-dos Section */}
							<View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
								<SectionHeader 
									title="Oppgaver" 
									icon={<Clock size={16} className="text-amber-500" />}
									onViewMore={() => handleViewAllTodos(item.id)} 
								/>
								
								{mockTodos.slice(0, 3).map(todo => (
									<View key={todo.id} className="flex-row items-center py-2 border-b border-gray-50">
										<View className="w-6 h-6 rounded-lg bg-amber-50 items-center justify-center mr-2">
											{todo.icon}
										</View>
										<Text className="text-sm font-medium text-gray-900 flex-1">{todo.title}</Text>
										<View className="bg-amber-50 rounded-full px-2 py-0.5">
											<Text className="text-xs text-amber-700">{todo.dueDate}</Text>
										</View>
									</View>
								))}
							</View>

							{/* Recently Completed Section */}
							<View className="bg-white rounded-2xl p-4 shadow-sm mb-8">
								<SectionHeader 
									title="Fullført" 
									icon={<CheckCircle2 size={16} className="text-green-500" />}
									onViewMore={() => handleViewAllCompleted(item.id)} 
								/>
								
								{mockCompletedTasks.slice(0, 2).map(task => (
									<View key={task.id} className="flex-row items-center py-2 border-b border-gray-50">
										<View className="w-6 h-6 rounded-lg bg-green-50 items-center justify-center mr-2">
											{task.icon}
										</View>
										<Text className="text-sm font-medium text-gray-900 flex-1">{task.title}</Text>
										<View className="bg-green-50 rounded-full px-2 py-0.5">
											<Text className="text-xs text-green-700">{task.date}</Text>
										</View>
									</View>
								))}
							</View>

							{/* Stats/Quick Info */}
							<View className="grid grid-cols-3 gap-2 mb-4">
								<View className="bg-white rounded-xl p-3 shadow-sm items-center">
									<Fuel size={18} className="text-blue-500 mb-1" />
									<Text className="text-xs text-gray-600">Neste service</Text>
									<Text className="text-sm font-bold text-gray-900">1200 km</Text>
								</View>
								<View className="bg-white rounded-xl p-3 shadow-sm items-center">
									<Battery size={18} className="text-blue-500 mb-1" />
									<Text className="text-xs text-gray-600">Batteri</Text>
									<Text className="text-sm font-bold text-gray-900">God</Text>
								</View>
								<View className="bg-white rounded-xl p-3 shadow-sm items-center">
									<PenLine size={18} className="text-blue-500 mb-1" />
									<Text className="text-xs text-gray-600">Notater</Text>
									<Text className="text-sm font-bold text-gray-900">3</Text>
								</View>
							</View>
						</ScrollView>
					</View>
				)}
			/>

			{/* Page indicator */}
			<View className="flex-row justify-center items-center absolute bottom-4 left-0 right-0 z-10">
				{mockVehicles.map((_, i) => (
					<View
						key={i}
						className={`mx-1 rounded-full ${i === currentIndex ? "bg-gray-900" : "bg-gray-300"}`}
						style={{ width: i === currentIndex ? 8 : 6, height: 6 }}
					/>
				))}
			</View>
		</SafeAreaView>
	);
}
