import {
  CameraPictureOptions,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
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

  const [facing, setFacing] = useState<CameraType>("back");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

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
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const onTakePicture = async () => {
    const options: CameraPictureOptions = {
      base64: true,
      quality: 0.3,
    };
    const res = await cameraRef.current?.takePictureAsync(options);

    console.log(res);
  };

  return (
    <View style={styles.container}>
      {!isCameraOpen ? (
        <View style={{ padding: 16 }}>
          <Button title="Open Camere" onPress={() => setIsCameraOpen(true)} />
        </View>
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
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
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
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
