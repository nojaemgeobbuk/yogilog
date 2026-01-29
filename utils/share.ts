import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { RefObject } from "react";
import { View } from "react-native";

export async function shareViewAsImage(viewRef: RefObject<View | null>) {
  try {
    if (!viewRef.current) {
      throw new Error("View reference is not available");
    }

    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
    });

    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share your yoga session",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }

    return uri;
  } catch (error) {
    console.error("Error sharing view:", error);
    throw error;
  }
}
