import React from "react";
import { Tabs } from "expo-router";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { Car } from "lucide-react-native";

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
			<Tabs.Screen name="index" options={{ title: "Fremside", tabBarIcon: ({ color, size }) => (
					<Car  color={color} size={size} />
				),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{ title: "Innstillinger" }}
		</Tabs>
	);
}
