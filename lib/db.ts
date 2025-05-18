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
};
