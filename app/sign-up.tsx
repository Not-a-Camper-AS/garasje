import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";

const formSchema = z
	.object({
		email: z.string().email("Vennligst skriv inn en gyldig e-postadresse."),
		password: z
			.string()
			.min(8, "Vennligst skriv inn minst 8 tegn.")
			.max(64, "Vennligst skriv inn færre enn 64 tegn.")
			.regex(
				/^(?=.*[a-z])/,
				"Passordet ditt må ha minst én liten bokstav.",
			)
			.regex(
				/^(?=.*[A-Z])/,
				"Passordet ditt må ha minst én stor bokstav.",
			)
			.regex(/^(?=.*[0-9])/, "Passordet ditt må ha minst ett tall.")
			.regex(
				/^(?=.*[!@#$%^&*])/,
				"Passordet ditt må ha minst ett spesialtegn.",
			),
		confirmPassword: z.string().min(8, "Vennligst skriv inn minst 8 tegn."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passordene dine stemmer ikke overens.",
		path: ["confirmPassword"],
	});

export default function SignUp() {
	const { signUp } = useAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signUp(data.email, data.password);

			form.reset();
		} catch (error: Error | any) {
			console.error(error.message);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 web:m-4">
				<H1 className="self-start">Registrer deg</H1>
				<Form {...form}>
					<View className="gap-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormInput
									label="E-post"
									placeholder="E-post"
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect={false}
									keyboardType="email-address"
									{...field}
								/>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormInput
									label="Passord"
									placeholder="Passord"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
									{...field}
								/>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormInput
									label="Bekreft passord"
									placeholder="Bekreft passord"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
									{...field}
								/>
							)}
						/>
					</View>
				</Form>
			</View>
			<Button
				size="default"
				variant="default"
				onPress={form.handleSubmit(onSubmit)}
				disabled={form.formState.isSubmitting}
				className="web:m-4"
			>
				{form.formState.isSubmitting ? (
					<ActivityIndicator size="small" />
				) : (
					<Text>Registrer deg</Text>
				)}
			</Button>
		</SafeAreaView>
	);
}
