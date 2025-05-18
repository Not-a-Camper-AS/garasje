import { View, Image } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { User, ChevronRight } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { SafeAreaView } from "@/components/safe-area-view";

type Profile = {
	id: string;
	username: string | null;
	full_name: string | null;
	avatar_url: string | null;
	website: string | null;
	updated_at: string | null;
};

export default function Settings() {
	const { signOut, session } = useAuth();
	const router = useRouter();

	const { data: profile } = useQuery({
		queryKey: ["profile", session?.user.id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", session?.user.id)
				.single();

			if (error) throw error;
			return data as Profile;
		},
		enabled: !!session?.user.id,
	});

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<View className="flex-1 p-4">
				<View>
					<View className="mb-8">
						<H1 className="text-center mb-2">Innstillinger</H1>
						<Muted className="text-center">
							Administrer din konto og app-innstillinger
						</Muted>
					</View>

					<View className="bg-card p-6 rounded-xl border border-border">
						<View className="flex-row items-center gap-4">
							<View className="h-16 w-16 rounded-full bg-muted/50 overflow-hidden border border-border">
								{profile?.avatar_url ? (
									<Image
										source={{ uri: profile.avatar_url }}
										className="h-full w-full"
										resizeMode="cover"
									/>
								) : (
									<View className="h-full w-full items-center justify-center">
										<User size={24} />
									</View>
								)}
							</View>
							<View className="flex-1">
								<Text className="text-lg font-medium">{profile?.full_name || "Ikke satt"}</Text>
								<Muted>{profile?.username || "Ikke satt"}</Muted>
							</View>
							<Button
								variant="ghost"
								size="icon"
								onPress={() => router.push("/(protected)/profile")}
							>
								<ChevronRight size={20} />
							</Button>
						</View>
					</View>
				</View>

				<View className="flex-1" />

				<Button
					className="w-full"
					size="default"
					variant="default"
					onPress={async () => {
						await signOut();
					}}
				>
					<Text>Logg ut</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
