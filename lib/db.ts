import { supabase } from "@/config/supabase";
import { Profile } from "@/types/user";
import { Vehicle } from "@/types/vehicle";

const getTodos = async (userId: string, vehicleId: string) => {
	const { data, error } = await supabase
		.from("todos")
		.select("*")
		.eq("user_id", userId)
		.eq("vehicle_id", vehicleId)
        .eq('is_complete', false)
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
	}
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

export { getTodos, getVehicles, getTodoById, createTodo, completeTodo, deleteTodo, updateTodo };
