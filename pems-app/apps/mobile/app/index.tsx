import { Text, View, Pressable } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className="text-amber-400 font-bold tracking-widest">
        ASTEM SOFTWARE LABS
      </Text>

      <Text className="mt-4 text-center text-4xl font-bold text-white">
        P.E.M.S.
      </Text>

      <Text className="mt-4 text-center text-base text-slate-300">
        Track properties, rooms, tenants, rent payments, and overdue balances.
      </Text>

      <Pressable className="mt-8 rounded-2xl bg-blue-600 px-8 py-4">
        <Text className="font-bold text-white">Get Started</Text>
      </Pressable>
    </View>
  );
}