import { router } from "expo-router";
import {
	View,
	useWindowDimensions,
	Pressable,
	ScrollView,
	RefreshControl,
	Alert,
} from "react-native";
import { useState, useRef, useMemo, useCallback } from "react";
import Animated, {
	FadeInDown,
	FadeIn,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import PagerView from "react-native-pager-view";

import { Text } from "@/components/ui/text";
import { Vehicle } from "@/types/vehicle";
import { SafeAreaView } from "@/components/safe-area-view";
import { formatRelativeDate } from "@/lib/date-utils";
import {
	ClipboardList,
	Wrench,
	ChevronRight,
	Car,
	Bike,
	CheckCircle2,
	Clock,
	ArrowRight,
	Plus,
	Calendar,
	DropletIcon,
	Fuel,
	Battery,
	PenLine,
	Sparkles,
	WrenchIcon,
	Users,
	ArrowLeftRight,
	MoreVertical,
	Pencil,
	FileText,
} from "lucide-react-native";
import { ActionSheet } from "../../../components/action-sheet";
import { useQuery } from "@tanstack/react-query";
import { getTodos, getVehicles } from "@/lib/db";
import { useAuth } from "@/context/supabase-provider";

// Animated components
const AnimatedView = Animated.createAnimatedComponent(View);



const mockCompletedTasks = [
	{
		id: "1",
		title: "Byttet bremseklosser",
		date: "2d",
		rawDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
		icon: <Wrench size={14} className="text-green-600" />,
	},
	{
		id: "2",
		title: "Fylt spylervæske",
		date: "1u",
		rawDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
		icon: <DropletIcon size={14} className="text-green-600" />,
	},
];

// Mock notes data
const mockNotes = [
	{
		id: "1",
		title: "Riper i lakken",
		date: "3d",
		rawDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
		icon: <Pencil size={14} className="text-indigo-600" />,
	},
	{
		id: "2",
		title: "Kjøring i utlandet",
		date: "2u",
		rawDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
		icon: <FileText size={14} className="text-indigo-600" />,
	},
];

// Quick action button component with new design
const QuickAction = ({
	label,
	icon,
	onPress,
	color = "bg-indigo-500",
	textColor = "text-white",
}: {
	label: string;
	icon: React.ReactNode;
	onPress: () => void;
	color?: string;
	textColor?: string;
}) => (
	<Pressable
		className={`${color} rounded-lg py-2.5 px-3 flex-row items-center shadow-sm flex-1`}
		style={{ elevation: 2 }}
		onPress={onPress}
		android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: false, radius: 20 }}
	>
		<View className="bg-white/20 rounded-md p-1.5 mr-2">
			{icon}
		</View>
		<Text className={`text-sm font-medium ${textColor}`}>
			{label}
		</Text>
	</Pressable>
);

// Get icon for todo task based on task type
const getTodoIcon = (taskType: string | undefined, isCompleted = false) => {
	const color = isCompleted ? "text-green-600" : "text-amber-600";
	
	switch (taskType) {
		case "oil":
			return <DropletIcon size={14} className={color} />;
		case "maintenance":
			return <WrenchIcon size={14} className={color} />;
		case "wash":
			return <DropletIcon size={14} className={color} />;
		case "inspection":
			return <Wrench size={14} className={color} />;
		case "battery":
			return <Battery size={14} className={color} />;
		case "fuel":
			return <Fuel size={14} className={color} />;
		default:
			return <Clock size={14} className={color} />;
	}
};

// Section Header component
const SectionHeader = ({
	title,
	onViewMore,
	icon,
}: {
	title: string;
	onViewMore: () => void;
	icon: React.ReactNode;
}) => (
	<View className="flex-row items-center justify-between mb-3 px-3 py-3">
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
	textColor = "text-amber-700",
	taskId,
	vehicleId,
	rawDate,
	onPress,
	isLast = false,
}: {
	title: string;
	date: string;
	icon: React.ReactNode;
	color?: string;
	textColor?: string;
	taskId?: string;
	vehicleId?: string;
	rawDate?: string | Date;
	onPress?: () => void;
	isLast?: boolean;
}) => {
	// Format date if rawDate is provided, otherwise use the provided date string
	const displayDate = rawDate ? formatRelativeDate(rawDate) : date;

	// Default navigation handler if onPress is not provided
	const handlePress = () => {
		if (onPress) {
			onPress();
		} else if (taskId && vehicleId) {
			router.push(`/vehicle/${vehicleId}/tasks/${taskId}`);
		}
	};

	return (
		<View className={!isLast ? "border-b border-gray-50" : ""}>
			<Pressable
				className="flex-row items-center py-3 px-3 active:bg-gray-50 active:rounded-xl my-0.5"
				onPress={handlePress}
			>
				<View
					className={`w-8 h-8 rounded-lg ${color} items-center justify-center mr-3`}
				>
					{icon}
				</View>
				<View className="flex-1">
					<Text className="text-base font-medium text-gray-900" numberOfLines={1}>
						{title}
					</Text>
					<Text className="text-sm text-gray-500 mt-0.5">
						{displayDate}
					</Text>
				</View>
				<ChevronRight size={18} className="text-gray-400 ml-2" />
			</Pressable>
		</View>
	);
};

// Indicator component with animation
const AnimatedIndicator = ({
	isActive,
	onPress,
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
	const { session } = useAuth();

	const vehicles = useQuery({
		queryKey: ["vehicles"],
		queryFn: () => getVehicles(session?.user.id || ""),
		// Transform the data to ensure it has the required fields
		select: (data) => {
			return data?.map(vehicle => ({
				...vehicle,
				// Ensure vehicle type is set (default to 'car' if not specified)
				type: vehicle.type || 'car',
				// Ensure bgColor is set (default to light amber for cars, light green for bikes)
				bgColor: vehicle.bgColor || (vehicle.type === 'bike' ? '#B9FFC2' : '#FFC193')
			})) || [];
		}
	});

	const { width } = useWindowDimensions();
	const SPACING = 24; // Padding for content

	const [currentIndex, setCurrentIndex] = useState(0);
	const currentVehicle = vehicles.data?.[currentIndex];
	const [refreshing, setRefreshing] = useState(false);
	const [showActionMenu, setShowActionMenu] = useState(false);
	const pagerRef = useRef<PagerView>(null);

	// Query for todos (uncompleted tasks)
	const todos = useQuery({
		queryKey: ["todos", currentVehicle?.id, currentIndex],
		queryFn: () => getTodos(session?.user.id || "", currentVehicle?.id || ""),
		enabled: !!currentVehicle?.id,
	});

	// Query for completed tasks
	const completedTasks = useQuery({
		queryKey: ["completedTasks", currentVehicle?.id, currentIndex],
		queryFn: () => {
			// For now, using mock data as there's no completed tasks API yet
			// In a real implementation, you would have a getCompletedTasks function
			return Promise.resolve(mockCompletedTasks);
		},
		enabled: !!currentVehicle?.id,
	});

	// Query for notes
	const notes = useQuery({
		queryKey: ["notes", currentVehicle?.id, currentIndex],
		queryFn: () => {
			// For now, using mock data as there's no notes API yet
			// In a real implementation, you would have a getNotes function
			return Promise.resolve(mockNotes);
		},
		enabled: !!currentVehicle?.id,
	});

	// Get current background color
	const currentBgColor = currentVehicle?.bgColor || "#FFFFFF";

	// Handle refresh
	const onRefresh = useCallback(() => {
		setRefreshing(true);
		
		// Refresh vehicles first
		vehicles.refetch()
			.then(() => {
				// Only refresh the other queries if we have a current vehicle
				if (currentVehicle?.id) {
					return Promise.all([
						todos.refetch(),
						completedTasks.refetch(),
						notes.refetch()
					]);
				}
			})
			.catch(error => {
				console.error("Error refreshing data:", error);
			})
			.finally(() => {
				setRefreshing(false);
			});
	}, [vehicles, todos, completedTasks, notes, currentVehicle]);

	// Handle page changes with a smoother transition
	const handlePageSelected = (e: any) => {
		const newIndex = e.nativeEvent.position;
		setCurrentIndex(newIndex);
		
		// Refresh todos, completed tasks and notes for the newly selected vehicle
		const selectedVehicle = vehicles.data?.[newIndex];
		if (selectedVehicle?.id) {
			todos.refetch();
			completedTasks.refetch();
			notes.refetch();
		}
	};

	// Handle action button presses
	const handleAddTasks = (vehicleId: string) => {
		router.push(`/vehicle/${vehicleId}/tasks/new`);
	};

	const handleLogMaintenance = (vehicleId: string) => {
		router.push(`/vehicle/${vehicleId}/maintenance/log`);
	};

	const handleViewAllTodos = (vehicleId: string) => {
		router.push(`/vehicle/${vehicleId}/tasks`);
	};

	const handleViewAllCompleted = (vehicleId: string) => {
		router.push(`/vehicle/${vehicleId}/maintenance/history`);
	};

	// New handlers for notes
	const handleAddNote = (vehicleId: string) => {
		router.push(`/vehicle/${vehicleId}/notes/new`);
	};

	const handleViewAllNotes = (vehicleId: string) => {
		router.push(`/vehicle/${vehicleId}/notes`);
	};

	// Handle manual navigation to specific vehicle
	const goToVehicle = (index: number) => {
		if (pagerRef.current) {
			pagerRef.current.setPage(index);
		}
	};

	// Handle action menu options
	const handleAddPeople = (vehicleId: string) => {
		router.push(`/vehicle/${vehicleId}/people/add`);
		setShowActionMenu(false);
	};

	const handleTransferVehicle = (vehicleId: string) => {
		router.push(`/vehicle/${vehicleId}/transfer`);
		setShowActionMenu(false);
	};

	const handleEditVehicle = (vehicleId: string) => {
		router.push(`/vehicle/${vehicleId}/edit`);
		setShowActionMenu(false);
	};

	// Menu toggle function
	const toggleActionMenu = () => {
		setShowActionMenu((prev) => !prev);
	};

	const actionMenuOptions = [
		{
			id: "edit",
			label: "Rediger kjøretøy",
			icon: <Pencil size={20} className="text-blue-600" />,
			onPress: () => handleEditVehicle(currentVehicle.id),
		},
		{
			id: "add-people",
			label: "Legg til personer",
			icon: <Users size={20} className="text-indigo-600" />,
			onPress: () => handleAddPeople(currentVehicle.id),
		},
		{
			id: "transfer",
			label: "Overfør kjøretøy",
			icon: <ArrowLeftRight size={20} className="text-purple-600" />,
			onPress: () => handleTransferVehicle(currentVehicle.id),
		},
	];

	return (
		<SafeAreaView
			edges={["top"]}
			className="flex-1"
			style={{ backgroundColor: currentBgColor }}
		>
			{vehicles.data && vehicles.data.length > 0 ? (
				<PagerView
					ref={pagerRef}
					style={{ flex: 1 }}
					initialPage={0}
					onPageSelected={handlePageSelected}
					pageMargin={0}
					overdrag={false}
				>
					{vehicles.data.map((item, index) => {
						return (
							<View key={item.id} style={{ flex: 1 }}>
								<ScrollView
									showsVerticalScrollIndicator={false}
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={{
										paddingBottom: 20, // Reduced padding
										paddingHorizontal: SPACING,
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
									<AnimatedView
										entering={FadeIn.delay(100).duration(600)}
										className="flex-row items-center justify-between mt-8 mb-5"
									>
										<View className="flex-1">
											{/* Nickname */}
											<Text className="text-5xl font-black text-[#33000F] italic mb-1">
												{item.nickname || ""}
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

										{/* Icon as Menu Trigger - Clean Design */}
										<Pressable
											onPress={() => toggleActionMenu()}
											className="relative"
											android_ripple={{
												color: "rgba(0,0,0,0.2)",
												borderless: false,
												radius: 42,
											}}
											hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
											style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
										>
											<View
												className={`w-20 h-20 rounded-full ${
													item.type === "bike" ? "bg-purple-100" : "bg-blue-100"
												} items-center justify-center`}
												style={{ elevation: 3 }}
											>
												{item.type === "bike" ? (
													<Bike size={36} className="text-purple-700" />
												) : (
													<Car size={36} className="text-blue-700" />
												)}

												{/* Indicator dot */}
												<View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border border-white items-center justify-center">
													<Sparkles size={12} className="text-white" />
												</View>
											</View>
										</Pressable>
									</AnimatedView>

									{/* Quick Actions */}
									<AnimatedView
										entering={FadeInDown.delay(200).duration(600)}
										className="mt-1 mb-4"
									>
										<View className="flex-row gap-2">
											<View className="flex-1">
												<QuickAction
													label="Ny oppgave"
													icon={<Plus size={16} color="white" />}
													onPress={() => handleAddTasks(item.id)}
													color="bg-[#22000A]"
												/>
											</View>
											<View className="flex-1">
												<QuickAction
													label="Logg vedlikehold"
													icon={<Wrench size={16} color="white" />}
													onPress={() => handleLogMaintenance(item.id)}
													color="bg-[#22000A]"
												/>
											</View>
										</View>
										<View className="flex-row gap-2 mt-2">
											<View className="flex-1">
												<QuickAction
													label="Nytt notat"
													icon={<Pencil size={16} color="white" />}
													onPress={() => handleAddNote(item.id)}
													color="bg-[#22000A]"
												/>
											</View>
											<View className="flex-1">
												<QuickAction
													label="Se historikk"
													icon={<Clock size={16} color="white" />}
													onPress={() => handleViewAllCompleted(item.id)}
													color="bg-[#22000A]"
												/>
											</View>
										</View>
									</AnimatedView>

									{/* Recent To-dos Section */}
									<AnimatedView
										entering={FadeInDown.delay(300).duration(600)}
										className="bg-white rounded-2xl mb-4 p-2"
										style={{ elevation: 2 }}
									>
										<SectionHeader
											title="Planlagte oppgaver"
											icon={<Clock size={18} className="text-amber-500" />}
											onViewMore={() => handleViewAllTodos(item.id)}
										/>

										{todos.data?.length === 0 ? (
											<Pressable
												onPress={() => handleAddTasks(item.id)}
												className="py-6 px-3 items-center"
											>
												<Clock size={24} className="text-gray-400 mb-2" />
												<Text className="text-gray-500 text-center mb-1">
													Ingen planlagte oppgaver
												</Text>
												<Text className="text-indigo-600 font-medium">
													Legg til en oppgave
												</Text>
											</Pressable>
										) : (
											todos.data?.map((todo, todoIndex) => (
												<TaskItem
													key={todo.id}
													title={todo.task}
													date={todo.dueDate}
													icon={getTodoIcon(todo.type, todo.completed)}
													color="bg-amber-50"
													textColor="text-amber-700"
													taskId={todo.id}
													vehicleId={item.id}
													rawDate={todo.dueDate}
													isLast={todoIndex === todos.data.length - 1}
												/>
											))
										)}
									</AnimatedView>

									{/* Recently Completed Section */}
									<AnimatedView
										entering={FadeInDown.delay(400).duration(600)}
										className="bg-white rounded-2xl mb-4 p-2"
										style={{ elevation: 2 }}
									>
										<SectionHeader
											title="Utført vedlikehold"
											icon={
												<CheckCircle2 size={18} className="text-green-500" />
											}
											onViewMore={() => handleViewAllCompleted(item.id)}
										/>

										{completedTasks.data?.length === 0 ? (
											<Pressable
												onPress={() => handleLogMaintenance(item.id)}
												className="py-6 px-3 items-center"
											>
												<CheckCircle2 size={24} className="text-gray-400 mb-2" />
												<Text className="text-gray-500 text-center mb-1">
													Ingen utført vedlikehold
												</Text>
												<Text className="text-indigo-600 font-medium">
													Logg vedlikehold
												</Text>
											</Pressable>
										) : (
											completedTasks.data?.map((task, taskIndex) => (
												<TaskItem
													key={task.id}
													title={task.title}
													date={task.date}
													icon={task.icon}
													color="bg-green-50"
													textColor="text-green-700"
													taskId={task.id}
													vehicleId={item.id}
													rawDate={task.rawDate}
													isLast={taskIndex === completedTasks.data.length - 1}
												/>
											))
										)}
									</AnimatedView>

									{/* Notes Section */}
									<AnimatedView
										entering={FadeInDown.delay(450).duration(600)}
										className="bg-white rounded-2xl mb-4 p-2"
										style={{ elevation: 2 }}
									>
										<SectionHeader
											title="Notater"
											icon={<FileText size={18} className="text-indigo-500" />}
											onViewMore={() => handleViewAllNotes(item.id)}
										/>

										{notes.data?.length === 0 ? (
											<Pressable
												onPress={() => handleAddNote(item.id)}
												className="py-6 px-3 items-center"
											>
												<FileText size={24} className="text-gray-400 mb-2" />
												<Text className="text-gray-500 text-center mb-1">
													Ingen notater
												</Text>
												<Text className="text-indigo-600 font-medium">
													Legg til et notat
												</Text>
											</Pressable>
										) : (
											notes.data?.map((note, noteIndex) => (
												<TaskItem
													key={note.id}
													title={note.title}
													date={note.date}
													icon={note.icon}
													color="bg-indigo-50"
													textColor="text-indigo-700"
													taskId={note.id}
													vehicleId={item.id}
													rawDate={note.rawDate}
													onPress={() =>
														router.push(`/vehicle/${item.id}/notes/${note.id}`)
													}
													isLast={noteIndex === notes.data.length - 1}
												/>
											))
										)}
									</AnimatedView>

									{/* Stats/Quick Info */}
									<AnimatedView
										entering={FadeInDown.delay(500).duration(600)}
										className="mb-6"
									>
										<Text className="text-lg font-bold text-gray-900 mb-3">
											Statistikk
										</Text>
										<View className="flex-row flex-wrap">
											<View className="w-1/3 pr-2 mb-4">
												<View
													className="bg-white rounded-xl p-4 items-center"
													style={{ elevation: 2 }}
												>
													<Fuel size={22} className="text-blue-500 mb-1.5" />
													<Text className="text-sm text-gray-600 text-center">
														Neste service
													</Text>
													<Text className="text-base font-bold text-gray-900">
														1200 km
													</Text>
												</View>
											</View>
											<View className="w-1/3 px-1 mb-4">
												<View
													className="bg-white rounded-xl p-4 items-center"
													style={{ elevation: 2 }}
												>
													<Battery size={22} className="text-blue-500 mb-1.5" />
													<Text className="text-sm text-gray-600 text-center">
														Batteri
													</Text>
													<Text className="text-base font-bold text-gray-900">
														God
													</Text>
												</View>
											</View>
											<View className="w-1/3 pl-2 mb-4">
												<View
													className="bg-white rounded-xl p-4 items-center"
													style={{ elevation: 2 }}
												>
													<PenLine size={22} className="text-blue-500 mb-1.5" />
													<Text className="text-sm text-gray-600 text-center">
														Notater
													</Text>
													<Text className="text-base font-bold text-gray-900">
														3
													</Text>
												</View>
											</View>
											<View className="w-1/3 pr-2">
												<View
													className="bg-white rounded-xl p-4 items-center"
													style={{ elevation: 2 }}
												>
													<WrenchIcon
														size={22}
														className="text-blue-500 mb-1.5"
													/>
													<Text className="text-sm text-gray-600 text-center">
														EU-kontroll
													</Text>
													<Text className="text-base font-bold text-gray-900">
														Om 5 mnd
													</Text>
												</View>
											</View>
										</View>
									</AnimatedView>

									{/* Page indicators at bottom */}
									<View className="flex-row justify-center items-center mb-8">
										{vehicles.data.map((_, i) => (
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
			) : (
				<View className="flex-1 items-center justify-center p-4">
					<Text className="text-xl font-bold text-gray-800 mb-4">
						Ingen kjøretøy funnet
					</Text>
					<Pressable
						className="bg-[#22000A] py-3 px-5 rounded-xl"
						onPress={() => router.push("/new-vehicle")}
					>
						<Text className="text-white font-bold">
							Legg til ditt første kjøretøy
						</Text>
					</Pressable>
				</View>
			)}

			{/* Action Menu */}
			{showActionMenu && (
				<ActionSheet
					title="Administrer kjøretøy"
					options={actionMenuOptions}
					onClose={() => setShowActionMenu(false)}
				/>
			)}
		</SafeAreaView>
	);
}
