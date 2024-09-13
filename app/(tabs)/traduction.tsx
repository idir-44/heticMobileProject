import fetcher from "@/domains/fetcher";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import qs from "qs";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { TranslateRequest } from "@/domains/uploadThing";
import { blue } from "react-native-reanimated/lib/typescript/reanimated2/Colors";

const LANGUAGE_LIST = [
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
  { label: "Italian", value: "it" },
  { label: "Haitian Creole", value: "ht" },
  { label: "Japanese", value: "ja" },
  { label: "Chinese", value: "zh-CN" },
];

export default function TabTwoScreen() {
  const params = useLocalSearchParams<{
    result: string;
    probability: string;
  }>();

  const [translatedText, setTranslatedText] = useState("");
  const [from, setFrom] = useState("");
  const [textToTranslate, setTextToTranslate] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<{
    label: string;
    value: string;
  }>();

  const translateMutation = useMutation({
    mutationFn: (params: TranslateRequest) => {
      return fetcher(
        `${process.env.EXPO_PUBLIC_GOOGLE_API}?${qs.stringify(params, { arrayFormat: "brackets" })}`,
        { method: "GET" },
      );
    },
  });

  useEffect(() => {
    if (params.result !== "undefined") {
      setTextToTranslate(params.result);
    }
  }, []);

  const onTranslate = async (toTranslate: string) => {
    const targetLanguage = !!selectedLanguage?.value
      ? selectedLanguage.value
      : "fr";

    try {
      const res = await translateMutation.mutateAsync({
        client: "gtx",
        q: params?.result !== "undefined" ? params.result : toTranslate,
        tl: targetLanguage,
        sl: "en",
        dt: "t",
      });

      setTranslatedText(res.flat(Infinity)[0]);
      setFrom(params?.result !== "undefined" ? params.result : toTranslate);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {Object.keys(params).length !== 0 && params?.result !== "undefined" ? (
          <View style={styles.result}>
            <Text style={styles.resultText}>
              The object is: {params.result}
            </Text>
            <Text style={styles.resultText}>
              Confidence score: {params.probability}
            </Text>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Type a word to translate</Text>
            <TextInput
              style={styles.textInput}
              value={textToTranslate}
              maxLength={40}
              onChangeText={setTextToTranslate}
              placeholder="Enter text"
              placeholderTextColor="#B0BEC5"
            />
          </View>
        )}
        <Picker
          numberOfLines={1}
          selectedValue={selectedLanguage}
          onValueChange={(selectedItem) => {
            if (selectedItem) {
              setSelectedLanguage(selectedItem);
            }
          }}
        >
          <Picker.Item label="" />
          {LANGUAGE_LIST.map((value) => (
            <Picker.Item
              key={value.value}
              color="black"
              value={value}
              label={value.label}
            />
          ))}
        </Picker>

        <TouchableOpacity
          style={styles.translateButton}
          onPress={() => onTranslate(textToTranslate)}
        >
          <Text style={styles.buttonText}>Translate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.translateButton}
          onPress={() => {
            router.setParams({ result: undefined, probability: undefined });
            setTextToTranslate("");
            setFrom("");
            setTranslatedText("");
          }}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultContainer}>
        {!!translatedText && !!from && (
          <>
            <Text style={styles.translatedFrom}>{from}</Text>
            <Ionicons name="arrow-down" size={32} color="black" />
            <Text style={styles.translatedText}>{translatedText}</Text>
          </>
        )}
        {error && <Text style={styles.errorText}>Error: {error.message}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F4F5F9",
  },
  header: {
    marginBottom: 20,
  },

  result: {
    alignItems: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#B0BEC5",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#ECEFF1",
  },
  translateButton: {
    backgroundColor: "#3498DB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  translatedFrom: {
    fontSize: 24,
    fontWeight: "500",
    color: "#34495E",
    marginBottom: 10,
  },
  translatedText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1ABC9C",
    marginTop: 10,
  },
  resultText: {
    fontSize: 22,
    color: "#333",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginTop: 10,
  },
});
