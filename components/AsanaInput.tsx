import { Colors } from "@/constants/Colors";
import { X, Search } from "lucide-react-native";
import React, { useState, useMemo, useCallback, memo } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import withObservables from "@nozbe/with-observables";

import { ASANA_DB } from "@/constants/AsanaDB";
import { AsanaListContent } from "@/components/AsanaListContent";
import { FavoritesGridContent } from "@/components/FavoritesGridContent";
import { SequenceCard } from "@/components/SequenceCard";
import { useSequenceBuilderStore } from "@/store/useSequenceBuilderStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAsanas, observeFavoriteAsanas } from "@/hooks/useAsanas";
import { Asana } from "@/database";
import { UserSequence } from "@/types";

const Tab = createMaterialTopTabNavigator();

interface AsanaInputProps {
  value: string[];
  onChange: (asanas: string[]) => void;
  /** 시퀀스 빌더 모드 - true면 스토어에도 동시 추가 */
  sequenceBuilderMode?: boolean;
}

// ==================== All Asanas Tab ====================
interface AllAsanasTabProps {
  searchText: string;
  selectedAsanas: string[];
  onSelectAsana: (name: string) => void;
  favoriteAsanaNames: string[];
  onToggleFavorite: (name: string) => void;
}

const AllAsanasTab = memo(({
  searchText,
  selectedAsanas,
  onSelectAsana,
  favoriteAsanaNames,
  onToggleFavorite,
}: AllAsanasTabProps) => {
  const filteredAsanas = useMemo(() => {
    if (!searchText.trim()) return ASANA_DB;

    const searchStr = searchText.toLowerCase();
    return ASANA_DB.filter((asana) =>
      asana.english.toLowerCase().includes(searchStr) ||
      asana.sanskrit.toLowerCase().includes(searchStr) ||
      asana.korean.includes(searchStr)
    );
  }, [searchText]);

  return (
    <AsanaListContent
      asanas={filteredAsanas}
      selectedAsanas={selectedAsanas}
      onSelectAsana={onSelectAsana}
      favoriteAsanas={favoriteAsanaNames}
      onToggleFavorite={onToggleFavorite}
      emptyMessage="검색 결과가 없습니다"
      emptySubMessage="다른 검색어를 시도해보세요"
    />
  );
});

// ==================== My Sequences Tab (Zustand Store) ====================
interface MySequencesTabProps {
  onSelectSequence: (sequence: UserSequence) => void;
  onDeleteSequence: (id: string) => void;
}

const MySequencesTab = memo(({
  onSelectSequence,
  onDeleteSequence,
}: MySequencesTabProps) => {
  // Zustand 스토어에서 저장된 시퀀스 가져오기
  const savedSequences = useSequenceBuilderStore((state) => state.savedSequences);

  if (savedSequences.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>📋</Text>
          </View>
        </View>
        <Text style={styles.emptyTitle}>아직 저장된 시퀀스가 없습니다</Text>
        <Text style={styles.emptySubtitle}>
          아사나를 선택하고 '시퀀스 저장' 버튼을 눌러{'\n'}나만의 루틴을 만들어보세요
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled={true}
      style={styles.sequenceScrollView}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.sequenceScrollContent}
    >
      {savedSequences.map((sequence) => (
        <SequenceCard
          key={sequence.id}
          sequence={sequence}
          onAdd={() => onSelectSequence(sequence)}
          onDelete={() => onDeleteSequence(sequence.id)}
        />
      ))}
    </ScrollView>
  );
});

// ==================== Favorites Tab (with WatermelonDB) ====================
interface FavoritesTabContentProps {
  selectedAsanas: string[];
  onSelectAsana: (name: string) => void;
  favoriteAsanas: Asana[];
  onToggleFavorite: (name: string) => void;
}

const FavoritesTabContent = memo(({
  selectedAsanas,
  onSelectAsana,
  favoriteAsanas,
  onToggleFavorite,
}: FavoritesTabContentProps) => {
  // DB의 즐겨찾기 아사나를 ASANA_DB 형식으로 매핑
  const favoriteAsanaList = useMemo(() => {
    const favoriteNames = favoriteAsanas.map((a) => a.englishName);
    return ASANA_DB.filter((asana) =>
      favoriteNames.includes(asana.english)
    );
  }, [favoriteAsanas]);

  return (
    <FavoritesGridContent
      asanas={favoriteAsanaList}
      selectedAsanas={selectedAsanas}
      onSelectAsana={onSelectAsana}
      onToggleFavorite={onToggleFavorite}
      emptyMessage="즐겨찾기가 없습니다"
      emptySubMessage="아사나 옆의 ♥ 버튼을 눌러 추가하세요"
    />
  );
});

// withObservables로 favoriteAsanas observe
const enhanceFavoritesTab = withObservables([], () => ({
  favoriteAsanas: observeFavoriteAsanas(),
}));

const FavoritesTab = enhanceFavoritesTab(FavoritesTabContent);

// ==================== Main AsanaInput Component ====================
interface AsanaInputContentProps {
  value: string[];
  onChange: (asanas: string[]) => void;
  sequenceBuilderMode: boolean;
  favoriteAsanas: Asana[];
}

const AsanaInputContent = memo(({
  value,
  onChange,
  sequenceBuilderMode,
  favoriteAsanas,
}: AsanaInputContentProps) => {
  const [searchText, setSearchText] = useState("");
  const asanaNameLanguage = useSettingsStore((state) => state.asanaNameLanguage);

  const { addAsana: addToBuilder, deleteSequence: deleteSequenceFromStore } = useSequenceBuilderStore();
  const { toggleFavorite } = useAsanas();

  // 영어 이름으로 표시 이름 가져오기
  const getDisplayName = useCallback((englishName: string) => {
    const asana = ASANA_DB.find((a) => a.english === englishName);
    if (!asana) return englishName;
    return asanaNameLanguage === "korean" ? asana.korean : asana.sanskrit;
  }, [asanaNameLanguage]);

  // 즐겨찾기 아사나 이름 목록 (All 탭에서 사용)
  const favoriteAsanaNames = useMemo(
    () => favoriteAsanas.map((a) => a.englishName),
    [favoriteAsanas]
  );

  const addAsana = useCallback((asanaName: string) => {
    if (!value.includes(asanaName)) {
      onChange([...value, asanaName]);
      // 시퀀스 빌더 모드면 스토어에도 추가
      if (sequenceBuilderMode) {
        addToBuilder(asanaName);
      }
    }
    setSearchText("");
    Keyboard.dismiss();
  }, [value, onChange, sequenceBuilderMode, addToBuilder]);

  const removeAsana = useCallback((asanaName: string) => {
    onChange(value.filter((a) => a !== asanaName));
  }, [value, onChange]);

  // 시퀀스 선택 핸들러 (Zustand UserSequence에서 아사나 이름 추출)
  const handleSelectSequence = useCallback((sequence: UserSequence) => {
    // 시퀀스의 아사나 이름 목록 가져오기
    const asanaNames = sequence.asanas.map((a) => a.asanaName);

    // 중복 제외하고 추가
    const newAsanas = asanaNames.filter((name) => !value.includes(name));

    if (newAsanas.length > 0) {
      onChange([...value, ...newAsanas]);
      // 시퀀스 빌더 모드면 스토어에도 추가
      if (sequenceBuilderMode) {
        newAsanas.forEach((name) => addToBuilder(name));
      }
    }
    Keyboard.dismiss();
  }, [value, onChange, sequenceBuilderMode, addToBuilder]);

  const handleDeleteSequence = useCallback((id: string) => {
    deleteSequenceFromStore(id);
  }, [deleteSequenceFromStore]);

  const handleToggleFavorite = useCallback(async (asanaName: string) => {
    try {
      await toggleFavorite(asanaName);
    } catch (error) {
      console.error('Failed to toggle asana favorite:', error);
    }
  }, [toggleFavorite]);

  return (
    <View style={styles.container}>
      {/* Selected asana chips */}
      {value.length > 0 && (
        <View style={styles.chipsContainer}>
          {value.map((asanaName, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{getDisplayName(asanaName)}</Text>
              <Pressable onPress={() => removeAsana(asanaName)}>
                <X size={14} color={Colors.text} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Search input - fixed above tabs */}
      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="아사나 검색 (예: Warrior, Bakasana)"
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText("")} style={styles.clearButton}>
            <X size={16} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Tab Navigator */}
      <View style={styles.tabContainer}>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: styles.tabBar,
            tabBarIndicatorStyle: styles.tabIndicator,
            tabBarLabelStyle: styles.tabLabel,
            tabBarActiveTintColor: Colors.text,
            tabBarInactiveTintColor: Colors.textMuted,
            tabBarPressColor: Colors.secondary,
            swipeEnabled: true,
            lazy: true,
          }}
          initialRouteName="AllAsanas"
        >
          <Tab.Screen
            name="AllAsanas"
            options={{ tabBarLabel: "전체" }}
          >
            {() => (
              <AllAsanasTab
                searchText={searchText}
                selectedAsanas={value}
                onSelectAsana={addAsana}
                favoriteAsanaNames={favoriteAsanaNames}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="MySequences"
            options={{ tabBarLabel: "내 시퀀스" }}
          >
            {() => (
              <MySequencesTab
                onSelectSequence={handleSelectSequence}
                onDeleteSequence={handleDeleteSequence}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Favorites"
            options={{ tabBarLabel: "즐겨찾기" }}
          >
            {() => (
              <FavoritesTab
                selectedAsanas={value}
                onSelectAsana={addAsana}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </View>
  );
});

// withObservables로 favoriteAsanas observe (All 탭에서 사용)
const enhanceAsanaInput = withObservables([], () => ({
  favoriteAsanas: observeFavoriteAsanas(),
}));

const EnhancedAsanaInputContent = enhanceAsanaInput(AsanaInputContent);

// 메인 export 컴포넌트
export function AsanaInput({
  value,
  onChange,
  sequenceBuilderMode = true,
}: AsanaInputProps) {
  return (
    <EnhancedAsanaInputContent
      value={value}
      onChange={onChange}
      sequenceBuilderMode={sequenceBuilderMode}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    // No flex: 1 needed - container height determined by children
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    letterSpacing: -0.5,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  tabContainer: {
    height: 380,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  tabBar: {
    backgroundColor: Colors.background,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tabIndicator: {
    backgroundColor: Colors.primary,
    height: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: -0.3,
    textTransform: "none",
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIconWrapper: {
    marginBottom: 16,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIconText: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  // Sequence List Styles
  sequenceScrollView: {
    flex: 1,
  },
  sequenceScrollContent: {
    padding: 12,
    paddingBottom: 20,
  },
});
