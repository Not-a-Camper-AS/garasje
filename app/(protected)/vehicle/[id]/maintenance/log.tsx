import { View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/supabase-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMaintenance, addMaintenanceFile } from "@/lib/db";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, DollarSign, Gauge } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Alert, TextInput } from "react-native";
import { FileUpload } from "@/components/ui/file-upload";
import { supabase } from "@/config/supabase";

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

	// Log vehicleId for debugging
	useEffect(() => {
		console.log("LogMaintenance vehicleId:", vehicleId);
	}, [vehicleId]);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [maintenanceType, setMaintenanceType] = useState("");
	const [cost, setCost] = useState("");
	const [mileage, setMileage] = useState("");
	const [technician, setTechnician] = useState("");
	const [datePerformed, setDatePerformed] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [fileUrls, setFileUrls] = useState<{url: string, path: string}[]>([]);

	const createMaintenanceMutation = useMutation({
		mutationFn: async () => {
			// First create the maintenance record without files
			console.log("Creating maintenance record");
			const maintenanceRecord = await createMaintenance(session?.user.id || "", vehicleId as string, {
				title,
				description,
				maintenance_type: maintenanceType,
				cost: cost ? parseFloat(cost) : undefined,
				mileage: mileage ? parseInt(mileage) : undefined,
				date_performed: datePerformed.toISOString(),
				technician: technician || undefined,
			});
			
			console.log("Maintenance record created:", maintenanceRecord.id);
			console.log("Files to add:", JSON.stringify(fileUrls));

			// Then add each file to the maintenance_files table
			const filePromises = fileUrls.map(file => {
				console.log("Adding file to DB:", file.url);
				return addMaintenanceFile(maintenanceRecord.id, session?.user.id || "", file.url)
					.then(result => {
						console.log("File added successfully:", result);
						return result;
					})
					.catch(error => {
						console.error("Error adding file:", error);
						throw error;
					});
			});
			
			if (filePromises.length > 0) {
				console.log(`Adding ${filePromises.length} files to maintenance record`);
				const results = await Promise.all(filePromises);
				console.log("All files added successfully:", results.length);
			} else {
				console.log("No files to add");
			}
			
			return maintenanceRecord;
		},
		onSuccess: (data) => {
			console.log("Maintenance record creation successful, ID:", data.id);
			queryClient.invalidateQueries({ queryKey: ["completedTasks"] });
			router.back();
		},
		onError: (error) => {
			console.error("Error in createMaintenanceMutation:", error);
		}
	});

	const handleSubmit = async () => {
		if (!title || !maintenanceType || !datePerformed) {
			Alert.alert("Feil", "Vennligst fyll ut alle påkrevde felt");
			return;
		}

		setIsSubmitting(true);
		try {
			await createMaintenanceMutation.mutateAsync();
		} catch (error) {
			console.error("Error creating maintenance record:", error);
			Alert.alert("Feil", "Kunne ikke opprette vedlikeholdslogg");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<SafeAreaView edges={["top", "bottom", "left", "right"]} className="flex-1 bg-white">
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
				<View className="space-y-4 pb-8">
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

					<View className="mb-6">
						<Text className="text-sm font-medium text-gray-700 mb-2">
							Kilometerstand
						</Text>
						<TextInput
							className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
							placeholder="F.eks. 50000"
							value={mileage}
							onChangeText={setMileage}
							keyboardType="numeric"
						/>
					</View>

					<View className="mb-6">
						<Text className="text-sm font-medium text-gray-700 mb-2">
							Utført av
						</Text>
						<TextInput
							className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
							placeholder="F.eks. Mekaniker AS"
							value={technician}
							onChangeText={setTechnician}
						/>
					</View>

					<View className="mb-6">
						<Text className="text-sm font-medium text-gray-700 mb-2">
							Kvittering eller bilde
						</Text>
						<FileUpload
							onUploadComplete={(url, path) => {
								console.log("File uploaded with vehicleId:", vehicleId);
								setFileUrls((prev) => [...prev, {url, path}]);
							}}
							onUploadError={(error) => Alert.alert("Feil", error)}
							onRemove={(url) => {
								// For new uploads that haven't been saved to the DB yet, we need to remove them from storage
								const file = fileUrls.find(f => f.url === url);
								if (file && file.path) {
									console.log("Removing file from storage during creation:", file.path);
									// Remove from Supabase Storage
									supabase.storage
										.from("maintenance")
										.remove([file.path])
										.then(() => {
											console.log("File successfully removed from storage during creation");
										})
										.catch(error => {
											console.error("Error removing file from storage during creation:", error);
										});
								}
								// Remove from local state
								setFileUrls((prev) => prev.filter((f) => f.url !== url));
							}}
							existingUrls={fileUrls.map(f => f.url)}
							userId={String(session?.user.id)}
							vehicleId={vehicleId as string}
						/>
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
						disabled={!title || !maintenanceType || !datePerformed || isSubmitting}
						className="mt-4"
					>
						<Text className="text-white font-medium">
							{isSubmitting ? "Logger..." : "Logg vedlikehold"}
						</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
} 