import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Pressable, Alert, Animated } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/supabase-provider";
import { getMaintenance, getVehicleById, deleteMaintenance } from "@/lib/db";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { CheckCircle2, Plus, DropletIcon, Wrench, ArrowLeft, Calendar, Battery, Fuel, Trash2, Edit } from "lucide-react-native";
import { format } from "date-fns";
import { Swipeable, GestureHandlerRootView, RectButton } from "react-native-gesture-handler";
import * as Haptics from 'expo-haptics';

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

const SwipeableMaintenanceItem = ({ 
	id,
	vehicleId,
	title, 
	date, 
	icon, 
	color = "bg-green-50",
	textColor = "text-green-700",
	onPress,
	onDelete,
	onEdit
}: { 
	id: string;
	vehicleId: string;
	title: string; 
	date: string;
	icon: React.ReactNode;
	color?: string;
	textColor?: string;
	onPress?: () => void;
	onDelete?: (id: string) => void;
	onEdit?: (id: string) => void;
}) => {
	const swipeableRef = useRef<Swipeable>(null);
	const [swipeOpen, setSwipeOpen] = useState(false);
	const [fullSwipe, setFullSwipe] = useState(false);
	// Store drag value listener ID
	const dragListenerRef = useRef<string | null>(null);

	const closeSwipeable = () => {
		if (swipeableRef.current) {
			swipeableRef.current.close();
		}
		setSwipeOpen(false);
	};

	const handleDelete = useCallback(() => {
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
		closeSwipeable();
		onDelete?.(id);
	}, [id, onDelete]);

	const handleEdit = useCallback(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		closeSwipeable();
		onEdit?.(id);
	}, [id, onEdit]);

	// Track swipe progress to detect full swipe
	const onSwipeableWillOpen = (direction: 'left' | 'right') => {
		if (direction === 'right') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
	};

	// Check for full swipe
	const checkForFullSwipe = useCallback((value: number) => {
		const FULL_SWIPE_THRESHOLD = -150;
		if (value < FULL_SWIPE_THRESHOLD && !fullSwipe) {
			setFullSwipe(true);
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			// Small delay for haptic to complete before triggering delete
			setTimeout(() => handleDelete(), 50);
		}
	}, [fullSwipe, handleDelete]);

	// Right side actions - Apple Mail style exactly
	const renderRightActions = (
		progress: Animated.AnimatedInterpolation<number>,
		dragX: Animated.AnimatedInterpolation<number>
	): React.ReactNode => {
		// Set up listener on dragX - we'll clean it up in useEffect
		if (dragListenerRef.current === null) {
			dragListenerRef.current = dragX.addListener(({value}: {value: number}) => {
				checkForFullSwipe(value);
			});
		}

		return (
			<View style={{ width: 200, flexDirection: 'row' }}>
				{/* First swipe shows Delete */}
				<RectButton 
					style={{
						flex: 1,
						backgroundColor: '#ef4444',
						justifyContent: 'center',
						alignItems: 'center',
					}}
					onPress={handleDelete}
				>
					<Trash2 size={22} color="#fff" />
					<Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>Delete</Text>
				</RectButton>
				
				{/* Swipe more to see Edit */}
				<RectButton
					style={{
						flex: 1,
						backgroundColor: '#3b82f6',
						justifyContent: 'center',
						alignItems: 'center',
					}}
					onPress={handleEdit}
				>
					<Edit size={22} color="#fff" />
					<Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>Edit</Text>
				</RectButton>
			</View>
		);
	};
	
	// Clean up the animation listener
	useEffect(() => {
		return () => {
			// Clean up when component unmounts
			if (dragListenerRef.current !== null) {
				// We can't remove the listener here because we don't have the dragX ref
				// This is just a placeholder for cleanup
				dragListenerRef.current = null;
			}
		};
	}, []);

	return (
		<Swipeable
			ref={swipeableRef}
			renderRightActions={renderRightActions}
			friction={1} // Lower friction for easier swiping
			enableTrackpadTwoFingerGesture
			leftThreshold={30}
			rightThreshold={40}
			overshootRight={true} // Enable overshoot for full swipe
			overshootFriction={8}
			containerStyle={{
				backgroundColor: '#ef4444', // First visible action color
			}}
			childrenContainerStyle={{
				backgroundColor: 'white',
			}}
			onSwipeableOpen={(direction) => {
				if (direction === 'right') {
					setSwipeOpen(true);
				}
			}}
			onSwipeableClose={() => {
				setSwipeOpen(false);
				setFullSwipe(false); // Reset full swipe flag when closed
			}}
			onSwipeableWillOpen={onSwipeableWillOpen}
		>
			<Pressable 
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingVertical: 12,
					paddingHorizontal: 16,
					backgroundColor: 'white',
					borderBottomWidth: 1,
					borderBottomColor: '#f3f4f6',
				}}
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
		</Swipeable>
	);
};

export default function MaintenanceHistory() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { session } = useAuth();
	const queryClient = useQueryClient();

	const vehicle = useQuery({
		queryKey: ["vehicle", id],
		queryFn: () => getVehicleById(id as string, session?.user.id || ""),
	});

	const maintenance = useQuery({
		queryKey: ["maintenance", id],
		queryFn: () => getMaintenance(session?.user.id || "", id as string),
	});

	const deleteMaintenanceMutation = useMutation({
		mutationFn: (maintenanceId: string) => deleteMaintenance(maintenanceId, session?.user.id || ""),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["maintenance", id] });
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		},
	});

	const handleDelete = (maintenanceId: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		Alert.alert(
			"Delete Maintenance",
			"Are you sure you want to delete this maintenance record?",
			[
				{ 
					text: "Cancel", 
					style: "cancel",
					onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
				},
				{ 
					text: "Delete", 
					style: "destructive",
					onPress: () => {
						Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
						deleteMaintenanceMutation.mutate(maintenanceId);
					}
				}
			]
		);
	};

	const handleEdit = (maintenanceId: string) => {
		router.push({
			pathname: "/vehicle/[id]/maintenance/[maintenanceId]/edit",
			params: { id: id as string, maintenanceId }
		});
	};

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
						<Text className="text-xs text-gray-500 ml-auto">Swipe for options</Text>
					</View>
					
					<GestureHandlerRootView style={{ flex: 1 }}>
						{maintenance.data?.map(task => (
							<SwipeableMaintenanceItem
								key={task.id}
								id={task.id}
								vehicleId={id as string}
								title={task.title}
								date={format(new Date(task.date_performed), "dd. MMMM yyyy")}
								icon={getMaintenanceIcon(task.maintenance_type)}
								color="bg-green-50"
								textColor="text-green-700"
								onPress={() => router.push({
									pathname: "/vehicle/[id]/maintenance/[maintenanceId]",
									params: { id: id as string, maintenanceId: task.id }
								})}
								onDelete={handleDelete}
								onEdit={handleEdit}
							/>
						))}

						{(!maintenance.data || maintenance.data.length === 0) && (
							<View className="py-10 items-center">
								<Text className="text-gray-500 text-center">Ingen vedlikeholdshistorikk.</Text>
							</View>
						)}
					</GestureHandlerRootView>
				</ScrollView>
			</View>
		</SafeAreaView>
	);
} 