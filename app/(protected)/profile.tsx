import { View } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "@/components/safe-area-view";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  updated_at: string | null;
};

export default function Profile() {
  const { session } = useAuth();
  const router = useRouter();

  const { data: profile, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center p-4">
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <View className="flex-1 items-center justify-center gap-y-4 p-4">
        <Button
          variant="ghost"
          size="icon"
          onPress={() => router.back()}
          className="absolute top-0 left-0 h-10 w-10"
        >
          <ArrowLeft size={24} />
        </Button>

        <H1 className="text-center">Profil</H1>
        <Muted className="text-center">
          Din personlige informasjon
        </Muted>

        <View className="w-full space-y-4 mt-6">
          <View className="bg-muted/10 p-4 rounded-lg">
            <Muted>Brukernavn</Muted>
            <Text className="text-base mt-1">{profile?.username || "Ikke satt"}</Text>
          </View>

          <View className="bg-muted/10 p-4 rounded-lg">
            <Muted>Navn</Muted>
            <Text className="text-base mt-1">{profile?.full_name || "Ikke satt"}</Text>
          </View>

          <View className="bg-muted/10 p-4 rounded-lg">
            <Muted>Nettside</Muted>
            <Text className="text-base mt-1">{profile?.website || "Ikke satt"}</Text>
          </View>
        </View>

        <Button
          className="w-full mt-6"
          size="default"
          variant="default"
          onPress={() => router.push("/(protected)/profile/edit")}
        >
          <Text>Rediger profil</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
} 