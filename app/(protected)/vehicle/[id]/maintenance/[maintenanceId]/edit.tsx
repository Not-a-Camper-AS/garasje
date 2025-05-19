import { View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/supabase-provider";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getMaintenanceById, updateMaintenance, getMaintenanceFiles, addMaintenanceFile, deleteMaintenanceFile } from "@/lib/db";
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

interface MaintenanceRecord {
	title: string;
	description?: string;
	maintenance_type: string;
	cost?: number;
	mileage?: number;
	date_performed: string;
	technician?: string;
	file_url?: string;
}

interface MaintenanceFile {
	id: string;
	maintenance_id: string;
	user_id: string;
	file_url: string;
	uploaded_at: string;
}

export default function EditMaintenance() {
	const { id: vehicleId, maintenanceId } = useLocalSearchParams();
	const { session } = useAuth();
	const queryClient = useQueryClient();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [maintenanceType, setMaintenanceType] = useState("");
	const [cost, setCost] = useState("");
	const [mileage, setMileage] = useState("");
	const [technician, setTechnician] = useState("");
	const [datePerformed, setDatePerformed] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [fileUrls, setFileUrls] = useState<{url: string, path: string, id?: string}[]>([]);

	// Fetch existing maintenance record
	const maintenance = useQuery<MaintenanceRecord>({
		queryKey: ["maintenance", maintenanceId],
		queryFn: () => getMaintenanceById(maintenanceId as string, session?.user.id || ""),
	});

	// Fetch existing files
	const files = useQuery<MaintenanceFile[]>({
		queryKey: ["maintenanceFiles", maintenanceId],
		queryFn: () => getMaintenanceFiles(maintenanceId as string, session?.user.id || ""),
	});

	// Initialize form with existing data
	useEffect(() => {
		if (maintenance.data) {
			setTitle(maintenance.data.title);
			setDescription(maintenance.data.description || "");
			setMaintenanceType(maintenance.data.maintenance_type);
			setCost(maintenance.data.cost?.toString() || "");
			setMileage(maintenance.data.mileage?.toString() || "");
			setTechnician(maintenance.data.technician || "");
			setDatePerformed(new Date(maintenance.data.date_performed));
		}
	}, [maintenance.data]);

	// Initialize files when they're loaded
	useEffect(() => {
		if (files.data) {
			setFileUrls(files.data.map(file => ({
				url: file.file_url,
				path: file.file_url.split("/storage/v1/object/public/")[1] || "",
				id: file.id
			})));
		}
	}, [files.data]);

	const updateMaintenanceMutation = useMutation({
		mutationFn: async () => {
			// First update the maintenance record details
			await updateMaintenance(maintenanceId as string, session?.user.id || "", {
				title,
				description,
				maintenance_type: maintenanceType,
				cost: cost ? parseFloat(cost) : undefined,
				mileage: mileage ? parseInt(mileage) : undefined,
				date_performed: datePerformed.toISOString(),
				technician: technician || undefined,
			});

			// For new files (those without an id), add them to the maintenance_files table
			const newFilePromises = fileUrls
				.filter(file => !file.id)
				.map(file => addMaintenanceFile(maintenanceId as string, session?.user.id || "", file.url));
			
			if (newFilePromises.length > 0) {
				await Promise.all(newFilePromises);
			}
			
			return true;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["maintenance", maintenanceId] });
			queryClient.invalidateQueries({ queryKey: ["maintenanceFiles", maintenanceId] });
			queryClient.invalidateQueries({ queryKey: ["completedTasks"] });
			router.back();
		},
	});

	const handleRemoveFile = async (url: string) => {
		// Find the file in our list
		const file = fileUrls.find(f => f.url === url);
		if (!file) return;

		// If file has an ID, it's stored in the database and needs to be removed
		if (file.id) {
			try {
				// This function already handles storage deletion
				await deleteMaintenanceFile(file.id, session?.user.id || "");
				
				// Remove it from our state
				setFileUrls(prev => prev.filter(f => f.url !== url));
			} catch (error) {
				console.error("Failed to delete file:", error);
				Alert.alert("Feil", "Kunne ikke slette filen");
			}
		} else {
			// For new files, still try to remove from storage if possible
			const extractedPath = url.split("/storage/v1/object/public/")[1];
			if (extractedPath) {
				console.log("Removing new file from storage:", extractedPath);
				try {
					await supabase.storage.from("maintenance").remove([extractedPath]);
					console.log("New file successfully removed from storage");
				} catch (storageError) {
					console.error("Error removing new file from storage:", storageError);
				}
			}
			
			// Just remove it from our state (it's not in the database yet)
			setFileUrls(prev => prev.filter(f => f.url !== url));
		}
	};

	const handleSubmit = async () => {
		if (!title || !maintenanceType || !datePerformed) {
			Alert.alert("Feil", "Vennligst fyll ut alle påkrevde felt");
			return;
		}

		setIsSubmitting(true);
		try {
			await updateMaintenanceMutation.mutateAsync();
		} catch (error) {
			console.error("Error updating maintenance record:", error);
			Alert.alert("Feil", "Kunne ikke oppdatere vedlikeholdslogg");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (maintenance.isLoading || files.isLoading) {
		return (
			<SafeAreaView edges={["top", "bottom", "left", "right"]} className="flex-1 bg-white">
				<View className="flex-1 items-center justify-center">
					<Text>Laster...</Text>
				</View>
			</SafeAreaView>
		);
	}

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
				<Text className="text-xl font-bold">Rediger vedlikehold</Text>
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
							onUploadComplete={(url, path) => setFileUrls((prev) => [...prev, {url, path}])}
							onUploadError={(error) => Alert.alert("Feil", error)}
							onRemove={(url) => handleRemoveFile(url)}
							existingUrls={fileUrls.map(f => f.url)}
							userId={String(session?.user.id)}
							vehicleId={vehicleId as string}
							maintenanceId={maintenanceId as string}
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
							{isSubmitting ? "Lagrer..." : "Lagre endringer"}
						</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
} 