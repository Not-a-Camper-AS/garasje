import React from "react";
import { router, Tabs } from "expo-router";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { Car, House, Plus, Settings } from "lucide-react-native";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				tabBarActiveTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
				tabBarShowLabel: true,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Min garasje",
					tabBarIcon: ({ color, size }) => (
						<House size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="add"
				listeners={{
					tabPress: (e) => {
						e.preventDefault();
						router.push("/new-vehicle");
					},
				}}
				options={{
					title: "Nytt kjøretøy",
					tabBarIcon: ({ color, size }) => (
						<Plus size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Innstillinger",
					tabBarIcon: ({ color, size }) => (
						<Settings size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
