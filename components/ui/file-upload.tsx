import React, { useState, useEffect } from "react";
import { View, Pressable, Image, Modal, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import { Text } from "./text";
import { FileText, Upload, X, Camera, Image as ImageIcon, File as FileIcon } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/config/supabase";
import { decode } from "base64-arraybuffer";

interface FileUploadProps {
	onUploadComplete: (url: string, path: string) => void;
	onUploadError: (error: string) => void;
	onRemove: (url: string, path?: string) => void;
	onRemoveFromDb?: (url: string) => Promise<void>;
	existingUrls?: string[];
	className?: string;
	userId: string;
	vehicleId?: string;
	maintenanceId?: string;
}

export function FileUpload({
	onUploadComplete,
	onUploadError,
	onRemove,
	onRemoveFromDb,
	existingUrls = [],
	className = "",
	userId,
	vehicleId,
	maintenanceId,
}: FileUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [showSourceModal, setShowSourceModal] = useState(false);
	
	// Log props on mount
	useEffect(() => {
		console.log("FileUpload component props:", { userId, vehicleId, maintenanceId });
	}, [userId, vehicleId, maintenanceId]);
	
	const handleUpload = () => {
		setShowSourceModal(true);
	};

	const handlePickFile = async () => {
		setShowSourceModal(false);
		console.log("File picker pressed");
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: ["application/pdf", "image/*"],
				copyToCacheDirectory: true,
				multiple: true,
			});
			console.log("File picker result", result);
			if (result.canceled) return;
			for (const asset of result.assets) {
				await uploadFile({
					uri: asset.uri,
					name: asset.name || `file_${Date.now()}`,
					mimeType: asset.mimeType ? asset.mimeType : 'application/octet-stream',
				});
			}
		} catch (error) {
			console.error("Error in file picker:", error);
			Alert.alert("Feil", "Kunne ikke laste opp filen");
			onUploadError("Kunne ikke laste opp filen");
		}
	};

	const handlePickGallery = async () => {
		setShowSourceModal(false);
		console.log("Gallery picker pressed");
		
		try {
			// Request permissions if needed
			const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!permission.granted) {
				Alert.alert("Feil", "Galleri-tilgang er nødvendig");
				return;
			}
			
			// Launch the image picker
			const result = await ImagePicker.launchImageLibraryAsync({
				quality: 0.8,
				allowsMultipleSelection: true,
				mediaTypes: ImagePicker.MediaTypeOptions.Images
			});
			
			console.log("Gallery result:", result);
			if (result.canceled) return;
			
			// Upload each selected asset
			for (const asset of result.assets) {
				await uploadFile({
					uri: asset.uri,
					name: asset.fileName || `gallery_${Date.now()}.${asset.uri.split('.').pop() || 'jpg'}`,
					mimeType: asset.type || 'image/jpeg',
				});
			}
		} catch (error) {
			console.error("Error in gallery picker:", error);
			Alert.alert("Feil", "Kunne ikke laste opp bilde fra galleri");
			onUploadError("Kunne ikke laste opp bilde fra galleri");
		}
	};

	const handlePickCamera = async () => {
		setShowSourceModal(false);
		console.log("Camera picker pressed");
		try {
			const permission = await ImagePicker.requestCameraPermissionsAsync();
			if (!permission.granted) {
				Alert.alert("Feil", "Kamera-tilgang er nødvendig");
				return;
			}
			const result = await ImagePicker.launchCameraAsync({
				quality: 0.8,
			});
			console.log("Camera result:", result);
			if (result.canceled) return;
			const asset = result.assets[0] as ImagePicker.ImagePickerAsset;
			await uploadFile({
				uri: asset.uri,
				name: asset.fileName || `camera_${Date.now()}.jpg`,
				mimeType: asset.type || 'image/jpeg',
			});
		} catch (error) {
			console.error("Error in camera picker:", error);
			Alert.alert("Feil", "Kunne ikke laste opp bilde fra kamera");
			onUploadError("Kunne ikke laste opp bilde fra kamera");
		}
	};

	const uploadFile = async (file: { uri: string; name: string; mimeType: string }) => {
		try {
			setIsUploading(true);
			// Generate a unique file name
			const fileExt = file.name.split(".").pop();
			const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
			
			// Create a better organized path structure
			let filePath = `maintenance/${userId}`;
			
			// Add vehicle ID if provided
			if (vehicleId) {
				console.log("Using vehicleId in path:", vehicleId);
				filePath += `/${vehicleId}`;
			} else {
				console.log("No vehicleId provided for file path");
			}
			
			// Add maintenance ID if available
			if (maintenanceId) {
				filePath += `/${maintenanceId}`;
			}
			
			// Add the filename
			filePath += `/${fileName}`;

			console.log("Uploading file to path:", filePath);

			const response = await fetch(file.uri);
			const blob = await response.blob();
			const reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = async () => {
				const base64data = reader.result as string;
				const base64 = base64data.split(",")[1];
				const { data, error } = await supabase.storage
					.from("maintenance")
					.upload(filePath, decode(base64), {
						contentType: file.mimeType,
						upsert: true,
					});
				if (error) throw error;
				const { data: { publicUrl } } = supabase.storage
					.from("maintenance")
					.getPublicUrl(filePath);
				
				// Pass both URL and path
				onUploadComplete(publicUrl, filePath);
				setIsUploading(false);
			};
		} catch (error) {
			console.error("Error uploading file:", error);
			onUploadError("Kunne ikke laste opp filen");
			setIsUploading(false);
		}
	};

	const handleRemove = async (url: string) => {
		// Call the parent component's onRemove handler
		onRemove(url);
		
		// If there's a dedicated database removal function, use it
		// This should already handle storage deletion
		if (onRemoveFromDb) {
			await onRemoveFromDb(url);
		}
		// We don't need to manually delete from storage here
		// as that's handled by the deleteMaintenanceFile function
	};

	const isImage = (url: string) => url.match(/\.(jpg|jpeg|png|gif|heic|webp)$/i);

	return (
		<SafeAreaView className={`${className}`}>
			{existingUrls.length > 0 && (
				<View className="flex-row flex-wrap gap-2 mb-2">
					{existingUrls.map((url) => (
						<View key={url} className="relative w-24 h-24 mb-2">
							{isImage(url) ? (
								<Image source={{ uri: url }} className="w-full h-full rounded-lg" resizeMode="cover" />
							) : (
								<View className="w-full h-full bg-gray-100 rounded-lg items-center justify-center">
									<FileText size={32} className="text-gray-400" />
									<Text className="text-gray-500 mt-2">PDF</Text>
								</View>
							)}
							<Pressable
								onPress={() => handleRemove(url)}
								className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
							>
								<X size={16} color="white" />
							</Pressable>
						</View>
					))}
				</View>
			)}
			<Pressable
				onPress={handleUpload}
				disabled={isUploading}
				className={`w-full h-24 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center ${isUploading ? "opacity-50" : ""}`}
			>
				<Upload size={32} className="text-gray-400" />
				<Text className="text-gray-500 mt-2">
					{isUploading ? "Laster opp..." : "Last opp filer"}
				</Text>
				{isUploading && (
					<View className="w-32 h-1 bg-gray-200 rounded-full mt-2">
						<View
							className="h-full bg-[#22000A] rounded-full"
							style={{ width: `${uploadProgress}%` }}
						/>
					</View>
				)}
			</Pressable>
			
			{/* Source selection modal */}
			<Modal
				visible={showSourceModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowSourceModal(false)}
			>
				<SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}>
					<View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6">
						<Text className="text-base font-bold mb-4">Velg kilde</Text>
						<View className="flex-row justify-around">
							<Pressable 
								onPress={() => {
									console.log("Camera button pressed directly");
									// Don't hide modal yet
									ImagePicker.launchCameraAsync({
										quality: 0.8,
										mediaTypes: ImagePicker.MediaTypeOptions.Images
									}).then(result => {
										console.log("Camera result:", result);
										setShowSourceModal(false);
										if (!result.canceled && result.assets && result.assets.length > 0) {
											const asset = result.assets[0];
											uploadFile({
												uri: asset.uri,
												name: asset.fileName || `camera_${Date.now()}.${asset.uri.split('.').pop() || 'jpg'}`,
												mimeType: asset.type || 'image/jpeg',
											});
										}
									}).catch(err => {
										console.error("Camera error:", err);
										setShowSourceModal(false);
										Alert.alert("Feil", "Kunne ikke åpne kamera");
									});
								}} 
								className="items-center"
							>
								<Camera size={32} className="text-gray-700" />
								<Text className="mt-2">Kamera</Text>
							</Pressable>
							<Pressable 
								onPress={() => {
									console.log("Gallery button pressed directly");
									// Don't hide modal yet
									ImagePicker.launchImageLibraryAsync({
										quality: 0.8,
										allowsMultipleSelection: true,
										mediaTypes: ImagePicker.MediaTypeOptions.Images
									}).then(result => {
										console.log("Gallery result:", result);
										setShowSourceModal(false);
										if (!result.canceled && result.assets && result.assets.length > 0) {
											result.assets.forEach(asset => {
												uploadFile({
													uri: asset.uri,
													name: asset.fileName || `gallery_${Date.now()}.${asset.uri.split('.').pop() || 'jpg'}`,
													mimeType: asset.type || 'image/jpeg',
												});
											});
										}
									}).catch(err => {
										console.error("Gallery error:", err);
										setShowSourceModal(false);
										Alert.alert("Feil", "Kunne ikke åpne galleri");
									});
								}} 
								className="items-center"
							>
								<ImageIcon size={32} className="text-gray-700" />
								<Text className="mt-2">Galleri</Text>
							</Pressable>
							<Pressable 
								onPress={() => {
									console.log("File button pressed directly");
									// Don't hide modal yet
									DocumentPicker.getDocumentAsync({
										type: ["application/pdf", "image/*"],
									}).then(result => {
										console.log("File result:", result);
										setShowSourceModal(false);
										if (!result.canceled && result.assets && result.assets.length > 0) {
											const asset = result.assets[0];
											uploadFile({
												uri: asset.uri,
												name: asset.name || `file_${Date.now()}`,
												mimeType: asset.mimeType || 'application/octet-stream',
											});
										}
									}).catch(err => {
										console.error("File error:", err);
										setShowSourceModal(false);
										Alert.alert("Feil", "Kunne ikke åpne filer");
									});
								}} 
								className="items-center"
							>
								<FileIcon size={32} className="text-gray-700" />
								<Text className="mt-2">Fil</Text>
							</Pressable>
						</View>
						<Pressable 
							onPress={() => setShowSourceModal(false)}
							className="mt-6 p-3 bg-gray-200 rounded-lg items-center"
						>
							<Text>Avbryt</Text>
						</Pressable>
					</View>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	);
} 