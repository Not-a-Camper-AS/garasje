import { router } from "expo-router";
import { View, useWindowDimensions, Pressable, ScrollView, RefreshControl } from "react-native";
import { useState, useRef, useMemo, useCallback } from "react";
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import PagerView from 'react-native-pager-view';

import { Text } from "@/components/ui/text";
import { Vehicle } from "@/types/vehicle";
import { SafeAreaView } from "@/components/safe-area-view";
import { ClipboardList, Wrench, ChevronRight, Car, Bike, CheckCircle2, Clock, ArrowRight, Plus, Calendar, DropletIcon, Fuel, Battery, PenLine, Sparkles } from "lucide-react-native";

// Animated components
const AnimatedView = Animated.createAnimatedComponent(View);

// Temporary mock data - replace with actual data from your backend
const mockVehicles: Vehicle[] = [
	{
		id: "1",
		make: "Tesla",
		model: "Model 3 Long Range",
		year: 2022,
		licensePlate: "EE 47617",
		color: "Grå",
		type: "car",
		nickname: "Millenial Falcon",
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

// Background colors for pages
const bgColors = ["#B9FFC2", "#FFC193", "#FFFFFF"];

// Quick action button component with new design
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
		className={`${color} rounded-xl py-3 px-4 flex-row items-center mr-3 mb-3 shadow-sm`}
		style={{ elevation: 3 }}
		onPress={onPress}
		android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false, radius: 20 }}
	>
		<Text className={`text-base font-black italic mr-2.5 ${textColor}`}>{label}</Text>
		<View className=" rounded-lg p-1.5 ">
			{icon}
		</View>
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
	<View className="flex-row items-center justify-between mb-3">
		<View className="flex-row items-center">
			{icon}
			<Text className="text-lg font-bold text-gray-900 ml-1.5">{title}</Text>
		</View>
		<Pressable 
			onPress={onViewMore} 
			className="flex-row items-center py-1 px-2 rounded-full active:bg-gray-100"
			hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
		>
			<Text className="text-sm font-medium text-gray-600 mr-1">Se alle</Text>
			<ArrowRight size={16} className="text-gray-600" />
		</Pressable>
	</View>
);

// Task item component
const TaskItem = ({ 
	title, 
	date, 
	icon, 
	color = "bg-amber-50",
	textColor = "text-amber-700"
}: { 
	title: string; 
	date: string;
	icon: React.ReactNode;
	color?: string;
	textColor?: string;
}) => (
	<Pressable className="flex-row items-center py-3 border-b border-gray-50 active:bg-gray-50">
		<View className={`w-8 h-8 rounded-lg ${color} items-center justify-center mr-3`}>
			{icon}
		</View>
		<Text className="text-base font-medium text-gray-900 flex-1">{title}</Text>
		<View className={`${color} rounded-full px-2.5 py-1`}>
			<Text className={`text-sm ${textColor}`}>{date}</Text>
		</View>
	</Pressable>
);

// Indicator component with animation
const AnimatedIndicator = ({ 
	isActive, 
	onPress 
}: { 
	isActive: boolean; 
	onPress: () => void;
}) => {
	return (
		<Pressable 
			onPress={onPress}
			className="mx-1.5"
			hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
		>
			<View
				className={`rounded-full ${isActive ? "bg-[#22000A]" : "bg-[#22000A]/20"}`}
				style={{ 
					width: isActive ? 16 : 6, 
					height: 6,
					opacity: isActive ? 1 : 0.7,
				}}
			/>
		</Pressable>
	);
};

export default function Home() {
	const { width } = useWindowDimensions();
	const SPACING = 24; // Padding for content
	
	const [currentIndex, setCurrentIndex] = useState(0);
	const [refreshing, setRefreshing] = useState(false);
	const pagerRef = useRef<PagerView>(null);
	const currentVehicle = mockVehicles[currentIndex];
	
	// Assign a background color to each vehicle
	const vehicleBackgrounds = useMemo(() => {
		return mockVehicles.map((_, index) => {
			return bgColors[index % bgColors.length];
		});
	}, []);
	
	// Get current background color
	const currentBgColor = vehicleBackgrounds[currentIndex];
	
	// Handle refresh
	const onRefresh = useCallback(() => {
		setRefreshing(true);
		// Here you would fetch new data
		setTimeout(() => {
			setRefreshing(false);
		}, 2000);
	}, []);
	
	// Handle page changes with a smoother transition
	const handlePageSelected = (e: any) => {
		const newIndex = e.nativeEvent.position;
		setCurrentIndex(newIndex);
	};
	
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
	
	// Handle manual navigation to specific vehicle
	const goToVehicle = (index: number) => {
		if (pagerRef.current) {
			pagerRef.current.setPage(index);
		}
	};

	return (
			<SafeAreaView edges={["top"]} className="flex-1" style={{ backgroundColor: currentBgColor }}>
				<PagerView
					ref={pagerRef}
					style={{ flex: 1 }}
					initialPage={0}
					onPageSelected={handlePageSelected}
					pageMargin={0}
					overdrag={false}
				>
					{mockVehicles.map((item, index) => {
						return (
							<View key={item.id} style={{ flex: 1 }}>
								<ScrollView 
									showsVerticalScrollIndicator={false}
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={{ 
										paddingBottom: 20, // Reduced padding
										paddingHorizontal: SPACING 
									}}
									refreshControl={
										<RefreshControl
											refreshing={refreshing}
											onRefresh={onRefresh}
											tintColor="#22000A"
											colors={["#22000A"]}
											progressBackgroundColor="#ffffff"
										/>
									}
								>
									{/* Vehicle Info */}
									<AnimatedView entering={FadeIn.delay(100).duration(600)} className="flex-row items-center justify-between mt-8 mb-5">
										<View className="flex-1">
											{/* Nickname */}
											<Text className="text-5xl font-black text-[#33000F] italic mb-1">
												{item.nickname || ''}
											</Text>
											
											{/* Vehicle Details */}
											<View className="flex-row items-center flex-wrap mt-1">
												<Text className="text-lg font-medium text-gray-700 mr-2">
													{item.make} {item.model}
												</Text>
												<View className="bg-white/30 rounded-full px-2.5 py-0.5">
													<Text className="text-sm text-gray-600">
														{item.year}
													</Text>
												</View>
												<View className="bg-white/30 rounded-full px-2.5 py-0.5 ml-1.5">
													<Text className="text-sm text-gray-600">
														{item.licensePlate}
													</Text>
												</View>
											</View>
										</View>

										{/* Icon */}
										<View 
											className={`w-20 h-20 rounded-full ${
												item.type === 'bike' ? 'bg-purple-100' : 'bg-blue-100'
											} items-center justify-center shadow-sm`}
											style={{ elevation: 3 }}
										>
											{item.type === 'bike' ? (
												<Bike size={36} className="text-purple-700" />
											) : (
												<Car size={36} className="text-blue-700" />
											)}
											<View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border border-white items-center justify-center">
												<Sparkles size={12} className="text-white" />
											</View>
										</View>
									</AnimatedView>
									
									{/* Quick Actions */}
									<AnimatedView entering={FadeInDown.delay(200).duration(600)} className="flex-row flex-wrap mt-1 mb-6">
										<QuickAction 
											label="Ny oppgave" 
											icon={<Plus size={18} color="white" />} 
											onPress={() => handleAddTasks(item.id)}
											color="bg-[#22000A]"
										/>
										<QuickAction 
											label="Vedlikehold" 
											icon={<Wrench size={18} color="white" />} 
											onPress={() => handleLogMaintenance(item.id)}
											color="bg-[#22000A]"
										/>
									</AnimatedView>

									{/* Recent To-dos Section */}
									<AnimatedView entering={FadeInDown.delay(300).duration(600)} className="bg-white rounded-2xl p-5 shadow-sm mb-4" style={{ elevation: 2 }}>
										<SectionHeader 
											title="Oppgaver" 
											icon={<Clock size={18} className="text-amber-500" />}
											onViewMore={() => handleViewAllTodos(item.id)} 
										/>
										
										{mockTodos.map((todo, todoIndex) => (
											<TaskItem
												key={todo.id}
												title={todo.title}
												date={todo.dueDate}
												icon={todo.icon}
												color="bg-amber-50"
												textColor="text-amber-700"
											/>
										))}
									</AnimatedView>

									{/* Recently Completed Section */}
									<AnimatedView entering={FadeInDown.delay(400).duration(600)} className="bg-white rounded-2xl p-5 shadow-sm mb-5" style={{ elevation: 2 }}>
										<SectionHeader 
											title="Fullført" 
											icon={<CheckCircle2 size={18} className="text-green-500" />}
											onViewMore={() => handleViewAllCompleted(item.id)} 
										/>
										
										{mockCompletedTasks.map(task => (
											<TaskItem
												key={task.id}
												title={task.title}
												date={task.date}
												icon={task.icon}
												color="bg-green-50"
												textColor="text-green-700"
											/>
										))}
									</AnimatedView>
									
									{/* Stats/Quick Info */}
									<AnimatedView entering={FadeInDown.delay(500).duration(600)} className="mb-6">
										<Text className="text-lg font-bold text-gray-900 mb-3">Statistikk</Text>
										<View className="flex-row">
											<View className="flex-1 bg-white rounded-xl p-4 shadow-sm items-center mr-2" style={{ elevation: 2 }}>
												<Fuel size={22} className="text-blue-500 mb-1.5" />
												<Text className="text-sm text-gray-600 text-center">Neste service</Text>
												<Text className="text-base font-bold text-gray-900">1200 km</Text>
											</View>
											<View className="flex-1 bg-white rounded-xl p-4 shadow-sm items-center mx-2" style={{ elevation: 2 }}>
												<Battery size={22} className="text-blue-500 mb-1.5" />
												<Text className="text-sm text-gray-600 text-center">Batteri</Text>
												<Text className="text-base font-bold text-gray-900">God</Text>
											</View>
											<View className="flex-1 bg-white rounded-xl p-4 shadow-sm items-center ml-2" style={{ elevation: 2 }}>
												<PenLine size={22} className="text-blue-500 mb-1.5" />
												<Text className="text-sm text-gray-600 text-center">Notater</Text>
												<Text className="text-base font-bold text-gray-900">3</Text>
											</View>
										</View>
									</AnimatedView>
									
									{/* Page indicators at bottom */}
									<View className="flex-row justify-center items-center mb-8">
										{mockVehicles.map((_, i) => (
											<AnimatedIndicator 
												key={i}
												isActive={i === currentIndex}
												onPress={() => goToVehicle(i)}
											/>
										))}
									</View>
								</ScrollView>
							</View>
						);
					})}
				</PagerView>
			</SafeAreaView>
	);
}
