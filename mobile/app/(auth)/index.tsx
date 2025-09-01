import { useSocialAuth } from "@/hooks/useSocialAuth";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const { handleSocialAuth, isLoading } = useSocialAuth();
  return (
    <View className="flex-1 bg-gray-950">
      <View className="flex-1 justify-center items-center">
        <View className="flex-1 justify-center">
          {/* DEMO IMAGE */}
          <View className="items-center">
            <Image
              source={require("../../assets/images/auth1.png")}
              className="size-96"
              resizeMode="contain"
            />
          </View>
          <View className="flex-col gap-2">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white border border-gray-200 rounded-full py-3 px-6"
              onPress={() => handleSocialAuth("oauth_google")}
              disabled={isLoading}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 2, // Only for android
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Image
                    source={require("../../assets/images/google.png")}
                    className="size-10 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="text-black font-medium text-base">
                    Continue with Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white border border-gray-200 rounded-full py-3 px-6"
              onPress={() => handleSocialAuth("oauth_apple")}
              disabled={isLoading}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 2, // Only for android
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Image
                    source={require("../../assets/images/apple.png")}
                    className="size-8 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="text-black font-medium text-base">
                    Continue with Apple
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text className="text-center text-gray-500 text-xs leading-4 mt-6 px-2">
            By continuing, you agree to our{" "}
            <Text className="text-blue-500 text-xs leading-4 mt-6 px-2">
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text className="text-blue-500 text-xs leading-4 mt-6 px-2">
              Privacy Policy.
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
