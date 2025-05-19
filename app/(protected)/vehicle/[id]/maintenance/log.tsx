import { View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/context/supabase-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMaintenance } from "@/lib/db";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, DollarSign, Gauge } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

const maintenanceTypes = [
	{ id: "oil", label: "Oljeskift" },
	{ id: "maintenance", label: "Vedlikehold" },
	{ id: "wash", label: "Vask" },
	{ id: "inspection", label: "Inspeksjon" },
	{ id: "battery", label: "Batteri" },
	{ id: "fuel", label: "Drivstoff" },
	{ id: "general", label: "Annet" },
];

export default function LogMaintenance() {
	const { id: vehicleId } = useLocalSearchParams();
	const { session } = useAuth();
	const queryClient = useQueryClient();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [maintenanceType, setMaintenanceType] = useState("general");
	const [cost, setCost] = useState("");
	const [mileage, setMileage] = useState("");
	const [datePerformed, setDatePerformed] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);

	const createMaintenanceMutation = useMutation({
		mutationFn: () =>
			createMaintenance(session?.user.id || "", vehicleId as string, {
				title,
				description,
				maintenance_type: maintenanceType,
				cost: cost ? parseFloat(cost) : undefined,
				mileage: mileage ? parseInt(mileage) : undefined,
				date_performed: datePerformed.toISOString(),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["completedTasks"] });
			router.back();
		},
	});

	const handleSubmit = () => {
		if (!title) return;
		createMaintenanceMutation.mutate();
	};

	return (
		<SafeAreaView edges={["top"]} className="flex-1 bg-white">
			<View className="flex-row items-center p-4 border-b border-gray-200">
				<Pressable
					onPress={() => router.back()}
					className="mr-4"
					hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
				>
					<ArrowLeft size={24} className="text-gray-900" />
				</Pressable>
				<Text className="text-xl font-bold">Logg vedlikehold</Text>
			</View>

			<ScrollView className="flex-1 p-4">
				<View className="space-y-4">
					<View>
						<Text className="text-sm font-medium text-gray-700 mb-1">
							Tittel
						</Text>
						<Input
							value={title}
							onChangeText={setTitle}
							placeholder="F.eks. Oljeskift"
						/>
					</View>

					<View>
						<Text className="text-sm font-medium text-gray-700 mb-1">
							Beskrivelse
						</Text>
						<Input
							value={description}
							onChangeText={setDescription}
							placeholder="Legg til detaljer om vedlikeholdet"
							multiline
							numberOfLines={3}
						/>
					</View>

					<View>
						<Text className="text-sm font-medium text-gray-700 mb-1">
							Type vedlikehold
						</Text>
						<View className="flex-row flex-wrap gap-2">
							{maintenanceTypes.map((type) => (
								<Pressable
									key={type.id}
									onPress={() => setMaintenanceType(type.id)}
									className={`px-3 py-2 rounded-full border ${
										maintenanceType === type.id
											? "bg-[#22000A] border-[#22000A]"
											: "bg-white border-gray-300"
									}`}
								>
									<Text
										className={`text-sm ${
											maintenanceType === type.id
												? "text-white"
												: "text-gray-700"
										}`}
									>
										{type.label}
									</Text>
								</Pressable>
							))}
						</View>
					</View>

					<View>
						<Text className="text-sm font-medium text-gray-700 mb-1">
							Kostnad
						</Text>
						<View className="flex-row items-center border border-gray-300 rounded-lg">
							<View className="pl-3">
								<DollarSign size={16} className="text-gray-400" />
							</View>
							<Input
								value={cost}
								onChangeText={setCost}
								placeholder="0"
								keyboardType="numeric"
								className="flex-1"
							/>
						</View>
					</View>

					<View>
						<Text className="text-sm font-medium text-gray-700 mb-1">
							Kilometerstand
						</Text>
						<View className="flex-row items-center border border-gray-300 rounded-lg">
							<View className="pl-3">
								<Gauge size={16} className="text-gray-400" />
							</View>
							<Input
								value={mileage}
								onChangeText={setMileage}
								placeholder="0"
								keyboardType="numeric"
								className="flex-1"
							/>
						</View>
					</View>

					<View>
						<Text className="text-sm font-medium text-gray-700 mb-1">
							Dato utført
						</Text>
						<Pressable
							onPress={() => setShowDatePicker(true)}
							className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2.5"
						>
							<Calendar size={16} className="text-gray-400 mr-2" />
							<Text className="text-gray-900">
								{format(datePerformed, "dd.MM.yyyy")}
							</Text>
						</Pressable>
					</View>

					{showDatePicker && (
						<DateTimePicker
							value={datePerformed}
							mode="date"
							display="default"
							onChange={(event, selectedDate) => {
								setShowDatePicker(false);
								if (selectedDate) {
									setDatePerformed(selectedDate);
								}
							}}
						/>
					)}

					<Button
						onPress={handleSubmit}
						disabled={!title || createMaintenanceMutation.isPending}
						className="mt-4"
					>
						<Text className="text-white font-medium">
							{createMaintenanceMutation.isPending
								? "Logger..."
								: "Logg vedlikehold"}
						</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
} 