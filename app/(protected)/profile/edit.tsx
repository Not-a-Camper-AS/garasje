import { View, TextInput } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function EditProfile() {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session?.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", session?.user.id] });
      router.back();
    },
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

        <H1 className="text-center">Rediger profil</H1>
        <Muted className="text-center">
          Oppdater din personlige informasjon
        </Muted>

        <View className="w-full space-y-4 mt-6">
          <View className="bg-muted/10 p-4 rounded-lg">
            <Muted>Brukernavn</Muted>
            <TextInput
              className="text-base mt-1 text-foreground"
              defaultValue={profile?.username || ""}
              placeholder="Skriv inn brukernavn"
              onChangeText={(text) => updateProfile.mutate({ username: text })}
            />
          </View>

          <View className="bg-muted/10 p-4 rounded-lg">
            <Muted>Navn</Muted>
            <TextInput
              className="text-base mt-1 text-foreground"
              defaultValue={profile?.full_name || ""}
              placeholder="Skriv inn navn"
              onChangeText={(text) => updateProfile.mutate({ full_name: text })}
            />
          </View>

          <View className="bg-muted/10 p-4 rounded-lg">
            <Muted>Nettside</Muted>
            <TextInput
              className="text-base mt-1 text-foreground"
              defaultValue={profile?.website || ""}
              placeholder="Skriv inn nettside"
              onChangeText={(text) => updateProfile.mutate({ website: text })}
            />
          </View>
        </View>

        <Button
          className="w-full mt-6"
          size="default"
          variant="default"
          onPress={() => router.back()}
        >
          <Text>Lagre endringer</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
} 