import fetcher from "@/domains/fetcher";
import { UpdatePhotoRequest, UploadThingRes } from "@/domains/uploadThing";
import { useMutation } from "@tanstack/react-query";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
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
      <View 
      style={{ 
        backgroundColor: "#34ace0", 
        borderRadius: 12, 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        width: 250,
        height: 50, 
        elevation: 5, 
        alignItems: "center", 
        alignSelf: "center", 
        
        }}>

      <TouchableOpacity onPress={() => setIsCameraOpen(true)}
        style={{
          width: "100%", 
          paddingVertical: 14, 
          justifyContent: "center", 
        }}
        
        >
        <Text 
        style={{ 
          color: 'white', 
          fontSize: 18, 
          fontWeight: 'bold', 
          textAlign: "center", }}>Open Camera</Text>
      </TouchableOpacity>
      </View>
    ) : (
      <CameraView ref={cameraRef} style={styles.camera}>
       
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onTakePicture}>
            <MaterialIcons name="camera" size={80} color="white" />
          </TouchableOpacity>
        </View>

        {/* Close Button */}
        <View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsCameraOpen(false)}
          >
            <Ionicons name="close-circle-outline" size={35} color="white" />
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
    backgroundColor: "white", 

  },
  
 
  
  message: {
    textAlign: "center",
    padding: 10,
    fontSize: 18, 
    color: "#fff", 
  },
  camera: {
    flex: 1,
    position: "relative",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    padding: 10,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.3)",

  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },

  closeButton: {
    position: "absolute", 
    left: 350,
    top: 30,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  

  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
