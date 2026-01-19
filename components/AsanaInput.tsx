import { Colors } from "@/constants/Colors";
import { X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

// 앞서 만든 상수 및 데이터 임포트
import { ASANA_DB } from "@/constants/AsanaDB";
import { ASANA_TYPE_CONFIG, LEVEL_THEME } from "@/constants/AsanaDefinitions";

interface AsanaInputProps {
  value: string[]; // 선택된 아사나의 영어 이름 배열
  onChange: (asanas: string[]) => void;
}

export function AsanaInput({ value, onChange }: AsanaInputProps) {
  const [inputText, setInputText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 검색 필터링 로직: 영어/산스크리트어 포함 여부 확인 및 이미 선택된 항목 제외
  const filteredSuggestions = ASANA_DB.filter((asana) => {
    const searchStr = inputText.toLowerCase();
    const isMatch =
      asana.english.toLowerCase().includes(searchStr) ||
      asana.sanskrit.toLowerCase().includes(searchStr);
    const isNotSelected = !value.includes(asana.english);
    return isMatch && isNotSelected;
  });

  const addAsana = (asanaName: string) => {
    if (!value.includes(asanaName)) {
      onChange([...value, asanaName]);
    }
    setInputText("");
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const removeAsana = (asanaName: string) => {
    onChange(value.filter((a) => a !== asanaName));
  };

  const handleSubmit = () => {
    const trimmed = inputText.trim();
    if (trimmed) {
      // DB에 있는 이름이면 공식 명칭을, 없으면 입력값 그대로 추가
      const exactMatch = ASANA_DB.find(
        (a) =>
          a.english.toLowerCase() === trimmed.toLowerCase() ||
          a.sanskrit.toLowerCase() === trimmed.toLowerCase()
      );
      addAsana(exactMatch ? exactMatch.english : trimmed);
    }
  };

  return (
    <View>
      {/* 1. 선택된 아사나 칩(Chips) 섹션 */}
      {value.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-4">
          {value.map((asanaName, index) => (
            <View
              key={index}
              className="flex-row items-center px-3 py-2 rounded-full"
              style={{ backgroundColor: Colors.primary + "25" }}
            >
              <Text
                style={{ color: Colors.primary }}
                className="mr-2 text-sm font-semibold"
              >
                {asanaName}
              </Text>
              <Pressable onPress={() => removeAsana(asanaName)}>
                <X size={14} color={Colors.primary} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* 2. 검색 입력창 */}
      <View className="relative">
        <TextInput
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            setShowSuggestions(text.length > 0);
          }}
          onFocus={() => setShowSuggestions(inputText.length > 0)}
          // 팁: onBlur에 약간의 지연 시간을 주어 목록 클릭이 먼저 인식되게 함
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onSubmitEditing={handleSubmit}
          placeholder="아사나 검색 (예: Warrior, Bakasana)"
          placeholderTextColor={Colors.textMuted}
          className="px-4 py-4 rounded-2xl text-base shadow-sm"
          style={{
            backgroundColor: Colors.cardSolid,
            color: Colors.text,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        />

        {/* 3. 검색 제안 목록 (Suggestions) */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <View
            className="absolute top-16 left-0 right-0 rounded-2xl overflow-hidden shadow-xl"
            style={{ 
              backgroundColor: Colors.cardSolid, 
              zIndex: 1000,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <ScrollView 
              keyboardShouldPersistTaps="handled" 
              style={{ maxHeight: 280 }}
            >
              {filteredSuggestions.map((asana) => {
                const typeInfo = ASANA_TYPE_CONFIG[asana.type];
                const TypeIcon = typeInfo.icon;
                const levelInfo = LEVEL_THEME[asana.level];

                return (
                  <Pressable
                    key={asana.id}
                    onPress={() => addAsana(asana.english)}
                    className="px-4 py-4 border-b flex-row items-center justify-between"
                    style={{ borderBottomColor: Colors.border }}
                  >
                    <View className="flex-row items-center flex-1">
                      {/* 타입 아이콘 */}
                      <View 
                        className="mr-3 p-2 rounded-xl" 
                        style={{ backgroundColor: Colors.background }}
                      >
                        <TypeIcon size={20} color={Colors.primary} />
                      </View>
                      
                      <View className="flex-1">
                        <Text 
                          style={{ color: Colors.text }} 
                          className="font-bold text-base"
                          numberOfLines={1}
                        >
                          {asana.english}
                        </Text>
                        <Text 
                          style={{ color: Colors.textMuted }} 
                          className="text-xs italic mt-0.5"
                          numberOfLines={1}
                        >
                          {asana.sanskrit}
                        </Text>
                      </View>
                    </View>

                    {/* 난이도 배지 */}
                    <View 
                      className="px-2 py-1 rounded-md ml-2" 
                      style={{ backgroundColor: levelInfo.color + "20" }}
                    >
                      <Text 
                        style={{ color: levelInfo.color, fontSize: 10, fontWeight: 'bold' }}
                      >
                        {levelInfo.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}