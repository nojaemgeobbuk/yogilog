import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

const COMMON_ASANAS = [
  "Downward Dog",
  "Warrior I",
  "Warrior II",
  "Warrior III",
  "Tree Pose",
  "Mountain Pose",
  "Child's Pose",
  "Cobra",
  "Cat-Cow",
  "Plank",
  "Chaturanga",
  "Upward Dog",
  "Triangle",
  "Half Moon",
  "Bridge",
  "Wheel",
  "Shoulder Stand",
  "Headstand",
  "Crow",
  "Pigeon",
  "Seated Forward Fold",
  "Happy Baby",
  "Corpse Pose",
  "Sun Salutation A",
  "Sun Salutation B",
];

interface AsanaInputProps {
  value: string[];
  onChange: (asanas: string[]) => void;
}

export function AsanaInput({ value, onChange }: AsanaInputProps) {
  const [inputText, setInputText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = COMMON_ASANAS.filter(
    (asana) =>
      asana.toLowerCase().includes(inputText.toLowerCase()) &&
      !value.includes(asana)
  );

  const addAsana = (asana: string) => {
    if (!value.includes(asana)) {
      onChange([...value, asana]);
    }
    setInputText("");
    setShowSuggestions(false);
  };

  const removeAsana = (asana: string) => {
    onChange(value.filter((a) => a !== asana));
  };

  const handleSubmit = () => {
    if (inputText.trim()) {
      addAsana(inputText.trim());
    }
  };

  return (
    <View>
      {/* Selected asanas */}
      {value.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {value.map((asana, index) => (
            <View
              key={index}
              className="flex-row items-center px-3 py-2 rounded-full"
              style={{ backgroundColor: Colors.primary + "40" }}
            >
              <Text style={{ color: Colors.primary }} className="mr-2">
                {asana}
              </Text>
              <Pressable onPress={() => removeAsana(asana)}>
                <X size={16} color={Colors.primary} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Input */}
      <TextInput
        value={inputText}
        onChangeText={(text) => {
          setInputText(text);
          setShowSuggestions(text.length > 0);
        }}
        onFocus={() => setShowSuggestions(inputText.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onSubmitEditing={handleSubmit}
        placeholder="Add asana (e.g., Downward Dog)"
        placeholderTextColor={Colors.textMuted}
        className="px-4 py-3 rounded-xl text-base"
        style={{
          backgroundColor: Colors.cardSolid,
          color: Colors.text,
        }}
      />

      {/* Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View
          className="mt-2 rounded-xl overflow-hidden max-h-40"
          style={{ backgroundColor: Colors.cardSolid }}
        >
          <ScrollView>
            {filteredSuggestions.slice(0, 5).map((asana, index) => (
              <Pressable
                key={index}
                onPress={() => addAsana(asana)}
                className="px-4 py-3 border-b"
                style={{ borderBottomColor: Colors.border }}
              >
                <Text style={{ color: Colors.text }}>{asana}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
