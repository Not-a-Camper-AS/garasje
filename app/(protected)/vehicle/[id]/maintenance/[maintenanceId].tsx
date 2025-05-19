import React, { useState } from "react";
import { View, ScrollView, Pressable, Alert, Image, Linking, Modal, Dimensions, StatusBar } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/supabase-provider";
import { getMaintenanceById, getVehicleById, deleteMaintenance, getMaintenanceFiles } from "@/lib/db";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Calendar, DollarSign, Gauge, DropletIcon, Wrench, Battery, Fuel, Pencil, User, Trash2, FileText, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react-native";
import { format } from "date-fns";
import ImageView from "react-native-image-viewing";

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

// Lightbox component for image gallery
const Lightbox = ({ 
	visible, 
	onClose, 
	images, 
	initialIndex = 0 
}: { 
	visible: boolean; 
	onClose: () => void; 
	images: string[]; 
	initialIndex?: number 
}) => {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const screenWidth = Dimensions.get('window').width;
	const screenHeight = Dimensions.get('window').height;

	const goToPrevious = () => {
		setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
	};

	const goToNext = () => {
		setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
	};

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<StatusBar backgroundColor="black" barStyle="light-content" />
			<View className="flex-1 bg-black">
				<Pressable 
					onPress={onClose}
					className="absolute top-12 right-4 z-10 w-10 h-10 bg-gray-800 rounded-full items-center justify-center"
				>
					<X size={24} color="white" />
				</Pressable>
				
				<View className="flex-1 items-center justify-center">
					<Image
						source={{ uri: images[currentIndex] }}
						style={{ width: screenWidth, height: screenHeight * 0.7 }}
						resizeMode="contain"
					/>
				</View>
				
				{images.length > 1 && (
					<View className="flex-row justify-between absolute bottom-8 left-0 right-0 px-4">
						<Pressable 
							onPress={goToPrevious}
							className="w-12 h-12 rounded-full bg-gray-800 items-center justify-center"
						>
							<ChevronLeft size={24} color="white" />
						</Pressable>
						<Text className="text-white self-center">
							{currentIndex + 1} / {images.length}
						</Text>
						<Pressable 
							onPress={goToNext}
							className="w-12 h-12 rounded-full bg-gray-800 items-center justify-center"
						>
							<ChevronRight size={24} color="white" />
						</Pressable>
					</View>
				)}
			</View>
		</Modal>
	);
};

const FileDisplay = ({ url, onImagePress }: { url: string; onImagePress?: (url: string) => void }) => {
	const isImage = url.match(/\.(jpg|jpeg|png|gif|heic|webp)$/i);

	const handlePress = async () => {
		if (isImage && onImagePress) {
			onImagePress(url);
		} else {
			try {
				await Linking.openURL(url);
			} catch (error) {
				console.error("Error opening URL:", error);
				Alert.alert("Feil", "Kunne ikke åpne filen");
			}
		}
	};

	return (
		<Pressable
			onPress={handlePress}
			className="w-full md:w-1/2 h-40 bg-gray-100 rounded-lg overflow-hidden mb-2"
		>
			{isImage ? (
				<Image
					source={{ uri: url }}
					className="w-full h-full"
					resizeMode="cover"
				/>
			) : (
				<View className="w-full h-full items-center justify-center">
					<FileText size={32} className="text-gray-400" />
					<Text className="text-gray-500 mt-2">PDF dokument</Text>
					<View className="flex-row items-center mt-2">
						<Text className="text-[#22000A] mr-1">Åpne fil</Text>
						<ExternalLink size={16} className="text-[#22000A]" />
					</View>
				</View>
			)}
		</Pressable>
	);
};

interface MaintenanceFile {
	id: string;
	maintenance_id: string;
	user_id: string;
	file_url: string;
	uploaded_at: string;
}

export default function MaintenanceDetails() {
	const { id: vehicleId, maintenanceId } = useLocalSearchParams();
	const { session } = useAuth();
	const queryClient = useQueryClient();
	
	// State for lightbox
	const [lightboxVisible, setLightboxVisible] = useState(false);
	const [imageIndex, setImageIndex] = useState(0);
	const [galleryImages, setGalleryImages] = useState<{ uri: string }[]>([]);

	const vehicle = useQuery({
		queryKey: ["vehicle", vehicleId],
		queryFn: () => getVehicleById(vehicleId as string, session?.user.id || ""),
	});

	const maintenance = useQuery({
		queryKey: ["maintenance", maintenanceId],
		queryFn: () => getMaintenanceById(maintenanceId as string, session?.user.id || ""),
	});
	
	// Fetch files from maintenance_files table
	const files = useQuery<MaintenanceFile[]>({
		queryKey: ["maintenanceFiles", maintenanceId],
		queryFn: () => {
			console.log("Fetching files for maintenance ID:", maintenanceId);
			return getMaintenanceFiles(maintenanceId as string, session?.user.id || "")
				.then(result => {
					console.log("Files fetched:", JSON.stringify(result));
					return result;
				})
				.catch(error => {
					console.error("Error fetching files:", error);
					throw error;
				});
		},
	});

	const deleteMaintenanceMutation = useMutation({
		mutationFn: () => deleteMaintenance(maintenanceId as string, session?.user.id || ""),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["completedTasks"] });
			router.back();
		},
	});

	const handleDelete = () => {
		Alert.alert(
			"Slett vedlikehold",
			"Er du sikker på at du vil slette dette vedlikeholdet?",
			[
				{
					text: "Avbryt",
					style: "cancel",
				},
				{
					text: "Slett",
					style: "destructive",
					onPress: () => {
						deleteMaintenanceMutation.mutate();
					},
				},
			]
		);
	};

	// Function to handle image press
	const handleImagePress = (url: string) => {
		// Filter out only image files
		const allImageUrls: string[] = [];
		
		// Add legacy image if it exists and is an image
		if (maintenance.data?.receipt_url && maintenance.data.receipt_url.match(/\.(jpg|jpeg|png|gif|heic|webp)$/i)) {
			allImageUrls.push(maintenance.data.receipt_url);
		}
		
		// Add images from maintenance_files
		if (files.data) {
			files.data.forEach(file => {
				if (file.file_url.match(/\.(jpg|jpeg|png|gif|heic|webp)$/i)) {
					allImageUrls.push(file.file_url);
				}
			});
		}
		
		// Find the index of the clicked image
		const index = allImageUrls.findIndex(img => img === url);
		
		// Format images for the library
		const formattedImages = allImageUrls.map(uri => ({ uri }));
		
		setGalleryImages(formattedImages);
		setImageIndex(index >= 0 ? index : 0);
		setLightboxVisible(true);
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			{/* Image Viewing Gallery */}
			<ImageView
				images={galleryImages}
				imageIndex={imageIndex}
				visible={lightboxVisible}
				onRequestClose={() => setLightboxVisible(false)}
				swipeToCloseEnabled={true}
				doubleTapToZoomEnabled={true}
			/>
			
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
					<View className="flex-row">
						<Pressable 
							onPress={() => router.push(`/vehicle/${vehicleId}/maintenance/${maintenanceId}/edit`)}
							className="w-10 h-10 rounded-full bg-[#22000A] items-center justify-center active:opacity-90 mr-2"
						>
							<Pencil size={20} color="#fff" />
						</Pressable>
						<Pressable 
							onPress={handleDelete}
							className="w-10 h-10 rounded-full bg-red-50 items-center justify-center active:opacity-90"
						>
							<Trash2 size={20} color="#ef4444" />
						</Pressable>
					</View>
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
								<InfoRow
									label="Utført av"
									value={maintenance.data.technician}
									icon={<User size={16} className="text-gray-400" />}
								/>
							</View>

							{/* Legacy support for old files stored in receipt_url */}
							{maintenance.data.receipt_url && (
								<View className="mb-6">
									<Text className="text-sm font-medium text-gray-700 mb-2">
										Kvittering eller bilde
									</Text>
									<FileDisplay 
										url={maintenance.data.receipt_url} 
										onImagePress={handleImagePress}
									/>
								</View>
							)}
							
							{/* Display files from maintenance_files table */}
							{files.data && files.data.length > 0 && (
								<View className="mb-6">
									<Text className="text-sm font-medium text-gray-700 mb-2">
										Filer og bilder ({files.data.length})
									</Text>
									<View className="flex-row flex-wrap">
										{files.data.map(file => {
											console.log("Rendering file:", file.id, file.file_url);
											return (
												<FileDisplay 
													key={file.id} 
													url={file.file_url} 
													onImagePress={handleImagePress}
												/>
											);
										})}
									</View>
								</View>
							)}
							{/* Log when no files are found */}
							{files.data && files.data.length === 0 && (
								console.log("No files found for this maintenance record")
							)}
						</>
					)}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
} 