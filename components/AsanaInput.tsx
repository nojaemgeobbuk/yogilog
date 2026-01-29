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
  ActivityIndicator,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import withObservables from "@nozbe/with-observables";
import { of } from "rxjs";
import { switchMap } from "rxjs/operators";

import { ASANA_DB } from "@/constants/AsanaDB";
import { AsanaListContent } from "@/components/AsanaListContent";
import { FavoritesGridContent } from "@/components/FavoritesGridContent";
import { SequenceCard } from "@/components/SequenceCard";
import { useSequenceBuilderStore } from "@/store/useSequenceBuilderStore";
import { useAsanas, observeFavoriteAsanas } from "@/hooks/useAsanas";
import { useSequences, observeSequences, getSequenceAsanaNames } from "@/hooks/useSequences";
import { Asana, Sequence } from "@/database";
import { UserSequence, SequenceAsanaItem } from "@/types";

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
      asana.sanskrit.toLowerCase().includes(searchStr)
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

// ==================== My Sequences Tab (with WatermelonDB) ====================
interface MySequencesTabContentProps {
  sequences: Sequence[];
  onSelectSequence: (sequence: Sequence) => void;
  onDeleteSequence: (id: string) => void;
}

const MySequencesTabContent = memo(({
  sequences,
  onSelectSequence,
  onDeleteSequence,
}: MySequencesTabContentProps) => {
  if (sequences.length === 0) {
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
      {sequences.map((sequence) => (
        <SequenceCardWrapper
          key={sequence.id}
          sequence={sequence}
          onAdd={onSelectSequence}
          onDelete={onDeleteSequence}
        />
      ))}
    </ScrollView>
  );
});

// 시퀀스 카드 래퍼 (관계 데이터 로드)
interface SequenceCardWrapperProps {
  sequence: Sequence;
  onAdd: (sequence: Sequence) => void;
  onDelete: (id: string) => void;
}

const SequenceCardWrapperBase = memo(({
  sequence,
  sequenceAsanas,
  onAdd,
  onDelete,
}: SequenceCardWrapperProps & { sequenceAsanas: any[] }) => {
  // UserSequence 형식으로 변환
  const userSequence: UserSequence = useMemo(() => ({
    id: sequence.id,
    name: sequence.name,
    asanas: sequenceAsanas.map((sa, index) => ({
      itemId: sa.id,
      asanaName: sa.asana?.englishName || `Asana ${index + 1}`,
    })),
    createdAt: sequence.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: sequence.updatedAt?.toISOString() || new Date().toISOString(),
  }), [sequence, sequenceAsanas]);

  const handleAdd = useCallback(() => {
    onAdd(sequence);
  }, [sequence, onAdd]);

  const handleDelete = useCallback(() => {
    onDelete(sequence.id);
  }, [sequence.id, onDelete]);

  return (
    <SequenceCard
      sequence={userSequence}
      onAdd={() => handleAdd()}
      onDelete={() => handleDelete()}
    />
  );
});

// withObservables로 시퀀스의 관계 데이터 observe
const SequenceCardWrapper = withObservables(
  ['sequence'],
  ({ sequence }: { sequence: Sequence }) => ({
    sequence,
    sequenceAsanas: sequence.asanasOrdered.observe().pipe(
      switchMap(async (asanas) => {
        // 각 SequenceAsana의 asana 관계도 로드
        const withAsanas = await Promise.all(
          asanas.map(async (sa) => {
            try {
              // Relation 타입의 fetch 메서드 호출
              const asanaRelation = (sa as any).asana;
              const asana = asanaRelation?.fetch ? await asanaRelation.fetch() : null;
              return { ...sa, asana };
            } catch {
              return { ...sa, asana: null };
            }
          })
        );
        return withAsanas;
      })
    ),
  })
)(SequenceCardWrapperBase);

// withObservables로 sequences 컬렉션 observe
const enhanceMySequencesTab = withObservables([], () => ({
  sequences: observeSequences(),
}));

const MySequencesTab = enhanceMySequencesTab(MySequencesTabContent);

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

  const { addAsana: addToBuilder } = useSequenceBuilderStore();
  const { toggleFavorite } = useAsanas();
  const { deleteSequence } = useSequences();

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

  // 시퀀스 선택 핸들러 (WatermelonDB Sequence에서 아사나 이름 추출)
  const handleSelectSequence = useCallback(async (sequence: Sequence) => {
    try {
      // 시퀀스의 아사나 이름 목록 가져오기
      const asanaNames = await getSequenceAsanaNames(sequence);

      // 중복 제외하고 추가
      const newAsanas = asanaNames.filter((name) => !value.includes(name));

      if (newAsanas.length > 0) {
        onChange([...value, ...newAsanas]);
        // 시퀀스 빌더 모드면 스토어에도 추가
        if (sequenceBuilderMode) {
          newAsanas.forEach((name) => addToBuilder(name));
        }
      }
    } catch (error) {
      console.error('Failed to load sequence asanas:', error);
    }
    Keyboard.dismiss();
  }, [value, onChange, sequenceBuilderMode, addToBuilder]);

  const handleDeleteSequence = useCallback(async (id: string) => {
    try {
      await deleteSequence(id);
    } catch (error) {
      console.error('Failed to delete sequence:', error);
    }
  }, [deleteSequence]);

  const handleToggleFavorite = useCallback((asanaName: string) => {
    toggleFavorite(asanaName);
  }, [toggleFavorite]);

  return (
    <View style={styles.container}>
      {/* Selected asana chips */}
      {value.length > 0 && (
        <View style={styles.chipsContainer}>
          {value.map((asanaName, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{asanaName}</Text>
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
