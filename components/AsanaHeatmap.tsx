import React, { memo, useState, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native'
import { Colors } from '@/constants/Colors'
import type { HeatmapDay, HeatmapData } from '@/hooks/useAsanaHeatmap'
import type { AsanaStatus } from '@/database/models/PracticeLogAsana'

interface AsanaHeatmapProps {
  data: HeatmapData | null
  isLoading?: boolean
  compact?: boolean // true면 작은 버전으로 표시
}

// 상태별 색상 (Primary 색상의 명도 변형)
const STATUS_COLORS: Record<AsanaStatus | 'none', string> = {
  mastered: '#E88D67',    // Primary (100%)
  practicing: '#F0A989',  // Primary 밝게 (80%)
  learning: '#F5C4AD',    // Primary 더 밝게 (60%)
  attempted: '#FAE0D1',   // Primary 가장 밝게 (40%)
  none: '#E5E7EB',        // 회색 (수련 안 함)
}

const STATUS_LABELS: Record<AsanaStatus, string> = {
  mastered: '마스터',
  practicing: '연습 중',
  learning: '배우는 중',
  attempted: '시도함',
}

// 개별 도트 컴포넌트
const HeatmapDot = memo(({
  day,
  size,
  onPress,
}: {
  day: HeatmapDay
  size: number
  onPress: (day: HeatmapDay) => void
}) => {
  const backgroundColor = day.count > 0
    ? STATUS_COLORS[day.status || 'attempted']
    : STATUS_COLORS.none

  return (
    <Pressable
      onPress={() => onPress(day)}
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor,
        },
      ]}
    />
  )
})

// 툴팁 모달
const TooltipModal = memo(({
  visible,
  day,
  onClose,
}: {
  visible: boolean
  day: HeatmapDay | null
  onClose: () => void
}) => {
  if (!day) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    })
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipDate}>{formatDate(day.date)}</Text>
          {day.count > 0 ? (
            <>
              <Text style={styles.tooltipStatus}>
                {day.status ? STATUS_LABELS[day.status] : '수련 완료'}
              </Text>
              <Text style={styles.tooltipCount}>
                {day.count}회 수련
              </Text>
            </>
          ) : (
            <Text style={styles.tooltipEmpty}>수련 기록 없음</Text>
          )}
        </View>
      </Pressable>
    </Modal>
  )
})

// 메인 히트맵 컴포넌트
export const AsanaHeatmap = memo(({
  data,
  isLoading = false,
  compact = false,
}: AsanaHeatmapProps) => {
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null)
  const [tooltipVisible, setTooltipVisible] = useState(false)

  const handleDotPress = useCallback((day: HeatmapDay) => {
    setSelectedDay(day)
    setTooltipVisible(true)
  }, [])

  const handleCloseTooltip = useCallback(() => {
    setTooltipVisible(false)
    setSelectedDay(null)
  }, [])

  if (isLoading) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.loadingPlaceholder} />
      </View>
    )
  }

  if (!data) {
    return null
  }

  const dotSize = compact ? 6 : 8
  const gap = compact ? 2 : 3

  // 7열 x 4행 그리드로 배치 (왼쪽 위부터 오른쪽 아래로)
  const rows: HeatmapDay[][] = []
  for (let i = 0; i < 4; i++) {
    rows.push(data.days.slice(i * 7, (i + 1) * 7))
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* 히트맵 그리드 */}
      <View style={[styles.grid, { gap }]}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.row, { gap }]}>
            {row.map((day) => (
              <HeatmapDot
                key={day.date}
                day={day}
                size={dotSize}
                onPress={handleDotPress}
              />
            ))}
          </View>
        ))}
      </View>

      {/* 범례 (compact 모드가 아닐 때만) */}
      {!compact && (
        <View style={styles.legend}>
          <Text style={styles.legendLabel}>Less</Text>
          <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.none }]} />
          <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.attempted }]} />
          <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.learning }]} />
          <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.practicing }]} />
          <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.mastered }]} />
          <Text style={styles.legendLabel}>More</Text>
        </View>
      )}

      {/* 툴팁 */}
      <TooltipModal
        visible={tooltipVisible}
        day={selectedDay}
        onClose={handleCloseTooltip}
      />
    </View>
  )
})

// 라이브러리 카드용 컴팩트 히트맵
export const AsanaHeatmapCompact = memo(({
  data,
  isLoading = false,
}: {
  data: HeatmapData | null
  isLoading?: boolean
}) => {
  if (isLoading || !data || data.totalPractices === 0) {
    return null
  }

  const dotSize = 5
  const gap = 1.5

  // 7열 x 4행 그리드
  const rows: HeatmapDay[][] = []
  for (let i = 0; i < 4; i++) {
    rows.push(data.days.slice(i * 7, (i + 1) * 7))
  }

  return (
    <View style={styles.compactContainer}>
      <View style={[styles.grid, { gap }]}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.row, { gap }]}>
            {row.map((day) => {
              const backgroundColor = day.count > 0
                ? STATUS_COLORS[day.status || 'attempted']
                : STATUS_COLORS.none

              return (
                <View
                  key={day.date}
                  style={[
                    styles.dot,
                    {
                      width: dotSize,
                      height: dotSize,
                      borderRadius: 1,
                      backgroundColor,
                    },
                  ]}
                />
              )
            })}
          </View>
        ))}
      </View>
      {data.streak > 0 && (
        <Text style={styles.streakText}>🔥 {data.streak}</Text>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  containerCompact: {
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
  },
  dot: {
    // size와 backgroundColor는 inline으로 설정
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 3,
  },
  legendLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    marginHorizontal: 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  loadingPlaceholder: {
    height: 36,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
  },
  // Tooltip styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  tooltipStatus: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  tooltipCount: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tooltipEmpty: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  // Compact container
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  streakText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
})
