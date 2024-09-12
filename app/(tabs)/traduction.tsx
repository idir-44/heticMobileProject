import fetcher from "@/domains/fetcher";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { View, Text, Button, TextInput } from "react-native";
import qs from "qs";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

type TranslateRequest = {
  client: "gtx";
  q: string;
  tl: string;
  sl?: string;
  dt: "t";
};

export default function TabTwoScreen() {
  const params = useLocalSearchParams();

  const [translatedText, setTranslatedText] = useState("");
  const [from, setFrom] = useState("");
  const [textToTranslate, setTextToTranslate] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const translateMutation = useMutation({
    mutationFn: (params: TranslateRequest) => {
      return fetcher(
        `${process.env.EXPO_PUBLIC_GOOGLE_API}?${qs.stringify(params, { arrayFormat: "brackets" })}`,
        {
          method: "GET",
        },
      );
    },
  });

  useEffect(() => {
    if (params?.result && !Array.isArray(params?.result)) {
      setTextToTranslate(params.result);
    }

    return () => {
      setTextToTranslate("");
      setFrom("");
      setTranslatedText("");
    };
  }, []);

  const onTranslate = async (toTranslate: string) => {
    if (toTranslate === "") return;
    try {
      const res = await translateMutation.mutateAsync({
        client: "gtx",
        q: toTranslate,
        tl: "fr",
        sl: "en",
        dt: "t",
      });

      setTranslatedText(res.flat(Infinity)[0]);
      setFrom(textToTranslate);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
      console.error(err);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View>
        {Object.keys(params).length !== 0 ? (
          <View style={{ gap: 4, marginBottom: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 22 }}>The object is: {params.result}</Text>
            <Text style={{ fontSize: 22 }}>
              Confidence score: {params.probability}
            </Text>
          </View>
        ) : (
          <View
            style={{
              gap: 4,
              marginBottom: 16,
            }}
          >
            <Text>Type a word to translate</Text>
            <TextInput
              style={{ borderWidth: 0.5 }}
              value={textToTranslate}
              onChangeText={setTextToTranslate}
            />
          </View>
        )}

        <Button
          title="Translate"
          onPress={() => onTranslate(textToTranslate)}
        />
      </View>

      <View
        style={{
          flex: 1 / 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!!translatedText && !!from && (
          <>
            <Text style={{ fontSize: 24, fontWeight: 500 }}>{from}</Text>
            <Ionicons name="arrow-down" size={32} />
            <Text style={{ fontSize: 24, fontWeight: 500 }}>
              {translatedText}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
