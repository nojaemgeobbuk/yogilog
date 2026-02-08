# Asana Growth Tree Feature

## Overview
아사나별 통계(잔디/히트맵) 기능을 '성장형 벚꽃 나무' 시스템으로 교체함.
수치보다 '성취의 즐거움'을 주는 것이 목적.

## Level Calculation (1-5)
- **Points = (masteredCount × 2) + recentPracticeCount**
  - `masteredCount`: 해당 아사나의 'mastered' 상태 횟수
  - `recentPracticeCount`: 최근 28일간 수련한 일수

- **Level Thresholds**:
  - Level 1: 0-5 points
  - Level 2: 6-15 points
  - Level 3: 16-30 points
  - Level 4: 31-50 points
  - Level 5: 51+ points

## Visual Stages (Cherry Blossom Theme)
| Level | Name | Description |
|-------|------|-------------|
| 1 | 새싹 | 흙 위로 작은 새싹이 돋아남 |
| 2 | 어린 나무 | 작은 가지가 생김 |
| 3 | 꽃봉오리 | 가지가 풍성하고 꽃봉오리 맺힘 (Seafoam green: #8FB9B8) |
| 4 | 개화 | 꽃이 피기 시작 |
| 5 | 만개 | 벚꽃이 만개 (Terracotta orange: #E88D67 포인트) |

## Files
- `hooks/useAsanaGrowthLevel.ts` - 성장 레벨 계산 훅
  - `useAsanaGrowthLevel(asanaName)` - 단일 아사나
  - `useAsanaGrowthLevelBatch(asanaNames)` - 배치 로드
- `components/AsanaGrowthTree.tsx` - 성장 나무 SVG 컴포넌트
  - `AsanaGrowthTree` - 상세 페이지용 (large, confetti 지원)
  - `AsanaGrowthTreeCompact` - 라이브러리 목록용

## Usage
```tsx
// 상세 페이지
import { AsanaGrowthTree } from "@/components/AsanaGrowthTree";
import { useAsanaGrowthLevel } from "@/hooks/useAsanaGrowthLevel";

const { data: growthData, isLoading } = useAsanaGrowthLevel(asanaName);
<AsanaGrowthTree data={growthData} size="large" showLabel showConfetti />

// 목록 (배치 로드)
import { AsanaGrowthTreeCompact } from "@/components/AsanaGrowthTree";
import { useAsanaGrowthLevelBatch } from "@/hooks/useAsanaGrowthLevel";

const { dataMap } = useAsanaGrowthLevelBatch(asanaNames);
<AsanaGrowthTreeCompact data={dataMap.get(name)} />
```

## Animation
- 카드 탭 시 scale bounce 애니메이션 (react-native-reanimated)
- Level 3 이상에서 탭 시 confetti 효과 (react-native-confetti-cannon)
