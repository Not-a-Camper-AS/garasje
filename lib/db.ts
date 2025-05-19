import { supabase } from "@/config/supabase";

const getTodos = async (userId: string, vehicleId: string) => {
	const { data, error } = await supabase
		.from("todos")
		.select("*")
		.eq("user_id", userId)
		.eq("vehicle_id", vehicleId)
		.eq("is_complete", false)
		.throwOnError();

	if (error) throw error;
	return data;
};

const getVehicles = async (userId: string) => {
	const { data, error } = await supabase
		.from("vehicles")
		.select("*")
		.eq("user_id", userId);
	if (error) throw error;
	return data;
};

const getTodoById = async (taskId: string, userId: string) => {
	const { data, error } = await supabase
		.from("todos")
		.select("*")
		.eq("id", taskId)
		.eq("user_id", userId)
		.single();

	if (error) throw error;
	return data;
};

const createTodo = async (
	userId: string,
	vehicleId: string,
	taskData: {
		task: string;
		priority: string;
		dueDate: string;
		notes?: string;
		type?: string;
	},
) => {
	const { data } = await supabase
		.from("todos")
		.insert([
			{
				user_id: userId,
				vehicle_id: vehicleId,
				task: taskData.task,
				priority: taskData.priority,
				dueDate: taskData.dueDate,
				notes: taskData.notes || "",
				type: taskData.type || "general",
				is_complete: false,
			},
		])
		.select()
		.throwOnError();

	return data[0];
};

const completeTodo = async (taskId: string, userId: string) => {
	const { data, error } = await supabase
		.from("todos")
		.update({ is_complete: true })
		.eq("id", taskId)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

const deleteTodo = async (taskId: string, userId: string) => {
	const { error } = await supabase
		.from("todos")
		.delete()
		.eq("id", taskId)
		.eq("user_id", userId)
		.throwOnError();

	if (error) throw error;
};

const updateTodo = async (
	taskId: string,
	userId: string,
	taskData: {
		task?: string;
		priority?: string;
		dueDate?: string;
		notes?: string;
		type?: string;
	},
) => {
	const { data, error } = await supabase
		.from("todos")
		.update(taskData)
		.eq("id", taskId)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

const createVehicle = async (
	userId: string,
	vehicleData: {
		nickname: string;
		vehicle_type?: string;
		make?: string;
		model?: string;
		year?: number;
		color?: string;
		licensePlate?: string;
		imageUrl?: string;
		type: "car" | "bike";
		bgColor: string;
	},
) => {
	const { data, error } = await supabase
		.from("vehicles")
		.insert([
			{
				user_id: userId,
				...vehicleData,
			},
		])
		.select()
		.single()
		.throwOnError();

	return data;
};

const getVehicleById = async (vehicleId: string, userId: string) => {
	const { data, error } = await supabase
		.from("vehicles")
		.select("*")
		.eq("id", vehicleId)
		.eq("user_id", userId)
		.single();
	if (error) throw error;
	return data;
};

const updateVehicle = async (
	vehicleId: string,
	userId: string,
	vehicleData: {
		nickname: string;
		make?: string;
		model?: string;
		year?: number;
		color?: string;
		licensePlate?: string;
		imageUrl?: string;
		type: "car" | "bike";
		bgColor: string;
	},
) => {
	const { data, error } = await supabase
		.from("vehicles")
		.update({
			...vehicleData,
			user_id: userId,
		})
		.eq("id", vehicleId)
		.eq("user_id", userId)
		.select()
		.single()
		.throwOnError();

	return data;
};

const deleteVehicle = async (vehicleId: string) => {
	const { error } = await supabase
		.from("vehicles")
		.delete()
		.eq("id", vehicleId)
		.throwOnError();

	if (error) throw error;
};

const getMaintenance = async (userId: string, vehicleId: string) => {
	const { data, error } = await supabase
		.from("maintenance")
		.select("*")
		.eq("user_id", userId)
		.eq("vehicle_id", vehicleId)
		.order("date_performed", { ascending: false })
		.throwOnError();

	if (error) throw error;
	return data;
};

const getMaintenanceById = async (maintenanceId: string, userId: string) => {
	const { data, error } = await supabase
		.from("maintenance")
		.select("*")
		.eq("id", maintenanceId)
		.eq("user_id", userId)
		.single();

	if (error) throw error;
	return data;
};

const createMaintenance = async (
	userId: string,
	vehicleId: string,
	maintenanceData: {
		title: string;
		description?: string;
		maintenance_type: string;
		cost?: number;
		mileage?: number;
		date_performed: string;
		next_due_date?: string;
		next_due_mileage?: number;
		technician?: string;
		receipt_url?: string;
	},
) => {
	const { data, error } = await supabase
		.from("maintenance")
		.insert([
			{
				user_id: userId,
				vehicle_id: vehicleId,
				...maintenanceData,
			},
		])
		.select()
		.single()
		.throwOnError();

	if (error) throw error;
	return data;
};

const updateMaintenance = async (
	maintenanceId: string,
	userId: string,
	maintenanceData: {
		title?: string;
		description?: string;
		maintenance_type?: string;
		cost?: number;
		mileage?: number;
		date_performed?: string;
		next_due_date?: string;
		next_due_mileage?: number;
		technician?: string;
		receipt_url?: string;
	},
) => {
	const { data, error } = await supabase
		.from("maintenance")
		.update(maintenanceData)
		.eq("id", maintenanceId)
		.eq("user_id", userId)
		.select()
		.single()
		.throwOnError();

	if (error) throw error;
	return data;
};

const deleteMaintenance = async (maintenanceId: string, userId: string) => {
	// First, get all associated files to delete them from storage
	const { data: files } = await supabase
		.from("maintenance_files")
		.select("id, file_url")
		.eq("maintenance_id", maintenanceId)
		.eq("user_id", userId);
	
	// Delete files from storage first
	if (files && files.length > 0) {
		console.log(`Deleting ${files.length} files for maintenance ID ${maintenanceId}`);
		
		// Process each file: delete from storage, then from database
		for (const file of files) {
			// Extract the storage path from the URL
			if (file.file_url) {
				const storagePath = file.file_url.split("/storage/v1/object/public/")[1];
				if (storagePath) {
					console.log("Removing file from storage:", storagePath);
					// Remove from storage
					const { error: storageError } = await supabase.storage
						.from("maintenance")
						.remove([storagePath]);
					
					if (storageError) {
						console.error("Error removing file from storage:", storageError);
					} else {
						console.log("File successfully removed from storage");
					}
				}
			}
		}
		
		// Delete all files from the database in one call
		const { error: filesDeleteError } = await supabase
			.from("maintenance_files")
			.delete()
			.eq("maintenance_id", maintenanceId)
			.eq("user_id", userId);
		
		if (filesDeleteError) {
			console.error("Error deleting maintenance files:", filesDeleteError);
			// Continue with maintenance deletion even if file deletion fails
		} else {
			console.log("All files deleted from database for maintenance ID:", maintenanceId);
		}
	}
	
	// Finally delete the maintenance record itself
	const { error } = await supabase
		.from("maintenance")
		.delete()
		.eq("id", maintenanceId)
		.eq("user_id", userId)
		.throwOnError();

	if (error) throw error;
	
	return true;
};

// Add a file to a maintenance record
const addMaintenanceFile = async (
	maintenanceId: string,
	userId: string,
	fileUrl: string
) => {
	console.log(`Adding file for maintenance ID: ${maintenanceId}, user ID: ${userId}, URL: ${fileUrl}`);
	const { data, error } = await supabase
		.from("maintenance_files")
		.insert([
			{
				maintenance_id: maintenanceId,
				user_id: userId,
				file_url: fileUrl,
			},
		])
		.select()
		.single();
	
	if (error) {
		console.error("Error adding maintenance file:", error);
		throw error;
	}
	
	console.log("File added successfully:", data?.id);
	return data;
};

// Get all files for a maintenance record
const getMaintenanceFiles = async (
	maintenanceId: string,
	userId: string
) => {
	console.log(`Getting files for maintenance ID: ${maintenanceId} and user ID: ${userId}`);
	const { data, error } = await supabase
		.from("maintenance_files")
		.select("*")
		.eq("maintenance_id", maintenanceId)
		.eq("user_id", userId)
		.order("uploaded_at", { ascending: true });
	
	if (error) {
		console.error("Error fetching maintenance files:", error);
		throw error;
	}
	
	console.log(`Found ${data?.length || 0} files for maintenance ID: ${maintenanceId}`);
	return data;
};

// Delete a file from a maintenance record
const deleteMaintenanceFile = async (
	fileId: string,
	userId: string
) => {
	// First get the file record to extract the URL
	const { data: fileRecord, error: fetchError } = await supabase
		.from("maintenance_files")
		.select("file_url")
		.eq("id", fileId)
		.eq("user_id", userId)
		.single();
	
	if (fetchError) {
		console.error("Error fetching file record:", fetchError);
		throw fetchError;
	}
	
	// Extract the storage path from the URL
	if (fileRecord && fileRecord.file_url) {
		const storagePath = fileRecord.file_url.split("/storage/v1/object/public/")[1];
		if (storagePath) {
			console.log("Removing file from storage:", storagePath);
			// Remove from storage
			const { error: storageError } = await supabase.storage
				.from("maintenance")
				.remove([storagePath]);
			
			if (storageError) {
				console.error("Error removing file from storage:", storageError);
				// Continue with database deletion even if storage deletion fails
			} else {
				console.log("File successfully removed from storage");
			}
		}
	}
	
	// Now delete the database record
	const { error } = await supabase
		.from("maintenance_files")
		.delete()
		.eq("id", fileId)
		.eq("user_id", userId)
		.throwOnError();
	
	if (error) throw error;
	
	return true;
};

export {
	getTodos,
	getVehicles,
	getTodoById,
	createTodo,
	completeTodo,
	deleteTodo,
	updateTodo,
	createVehicle,
	getVehicleById,
	updateVehicle,
	deleteVehicle,
	getMaintenance,
	getMaintenanceById,
	createMaintenance,
	updateMaintenance,
	deleteMaintenance,
	addMaintenanceFile,
	getMaintenanceFiles,
	deleteMaintenanceFile,
};
