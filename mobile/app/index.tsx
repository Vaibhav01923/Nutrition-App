import { useClerk } from "@clerk/clerk-expo";
import { Button } from "@react-navigation/elements";
import { View, Text } from "react-native";

function HomeScreen() {
  const { signOut } = useClerk();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>Home</Text>
      <Button onPress={() => signOut()}>Sign Out</Button>
    </View>
  );
}

export default HomeScreen;
