import fetcher from "@/domains/fetcher";
import { UpdatePhotoRequest, UploadThingRes } from "@/domains/uploadThing";
import { useMutation } from "@tanstack/react-query";
import {
  CameraPictureOptions,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Button,
  TouchableOpacity,
} from "react-native";

export default function HomeScreen() {
  const cameraRef = useRef<CameraView | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const uploadPhotoMutation = useMutation({
    mutationFn: (params: UpdatePhotoRequest): Promise<UploadThingRes> => {
      return fetcher(`${process.env.EXPO_PUBLIC_PHOTO_API_URL}`, {
        method: "POST",
        body: JSON.stringify(params),
      });
    },
  });

  if (!permission) {
    return (
      <ActivityIndicator
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <View style={{ paddingHorizontal: 16 }}>
          <Button onPress={requestPermission} title="grant permission" />
        </View>
      </View>
    );
  }

  if (uploadPhotoMutation.isPending) {
    return (
      <ActivityIndicator
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  const onTakePicture = async () => {
    const options: CameraPictureOptions = {
      base64: true,
      quality: 0.3,
    };
    const res = await cameraRef.current?.takePictureAsync(options);

    if (res?.base64) {
      const base64 = `"data:image/jpg;base64,"${res.base64}`;

      try {
        const response = await uploadPhotoMutation.mutateAsync({
          model: "RECONGNITION",
          type: "IMAGE",
          data: { img1: base64 },
        });

        router.navigate({
          pathname: "/(tabs)/traduction",
          params: {
            probability: response.probability,
            result: response.result,
          },
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <View style={styles.container}>
      {!isCameraOpen ? (
        <View style={{ padding: 16 }}>
          <Button title="Open Camere" onPress={() => setIsCameraOpen(true)} />
        </View>
      ) : (
        <CameraView ref={cameraRef} style={styles.camera}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onTakePicture}>
              <Text style={styles.text}>Take picture</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsCameraOpen(false)}
            >
              <Text style={styles.text}>Close Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    padding: 10,
  },
  camera: {
    flex: 1,
    position: "relative",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    padding: 16,
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
