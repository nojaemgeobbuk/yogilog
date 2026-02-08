import { useState, useEffect } from 'react'
import { Q } from '@nozbe/watermelondb'
import {
  practiceLogAsanasCollection,
  practiceLogsCollection,
} from '@/database'
import type { AsanaStatus } from '@/database/models/PracticeLogAsana'

export type GrowthLevel = 1 | 2 | 3 | 4 | 5

export interface GrowthData {
  level: GrowthLevel
  masteredCount: number
  recentPracticeCount: number // 최근 28일간 수련 일수
  totalPoints: number
  nextLevelPoints: number // 다음 레벨까지 필요한 포인트
  progress: number // 현재 레벨 내 진행률 (0-1)
}

// 레벨별 포인트 임계값
const LEVEL_THRESHOLDS = {
  1: 0,
  2: 6,
  3: 16,
  4: 31,
  5: 51,
} as const

/**
 * 포인트로부터 레벨 계산
 * Points = (masteredCount * 2) + recentPracticeCount
 */
function calculateLevel(points: number): GrowthLevel {
  if (points >= LEVEL_THRESHOLDS[5]) return 5
  if (points >= LEVEL_THRESHOLDS[4]) return 4
  if (points >= LEVEL_THRESHOLDS[3]) return 3
  if (points >= LEVEL_THRESHOLDS[2]) return 2
  return 1
}

/**
 * 현재 레벨 내 진행률 계산
 */
function calculateProgress(points: number, level: GrowthLevel): number {
  if (level === 5) return 1 // 최고 레벨이면 100%

  const currentThreshold = LEVEL_THRESHOLDS[level]
  const nextThreshold = LEVEL_THRESHOLDS[(level + 1) as GrowthLevel]
  const levelRange = nextThreshold - currentThreshold
  const pointsInLevel = points - currentThreshold

  return Math.min(1, Math.max(0, pointsInLevel / levelRange))
}

/**
 * 특정 아사나의 성장 레벨을 계산하는 훅
 */
export function useAsanaGrowthLevel(asanaName: string): {
  data: GrowthData | null
  isLoading: boolean
} {
  const [data, setData] = useState<GrowthData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchGrowthData() {
      try {
        // 28일 전 날짜 계산
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 27)
        const startDateStr = startDate.toISOString().split('T')[0]

        // 해당 아사나의 모든 수련 기록 가져오기
        const asanaRecords = await practiceLogAsanasCollection
          .query(Q.where('asana_name', asanaName))
          .fetch()

        if (asanaRecords.length === 0) {
          if (isMounted) {
            setData({
              level: 1,
              masteredCount: 0,
              recentPracticeCount: 0,
              totalPoints: 0,
              nextLevelPoints: LEVEL_THRESHOLDS[2],
              progress: 0,
            })
            setIsLoading(false)
          }
          return
        }

        // 마스터 횟수 계산
        let masteredCount = 0
        const recentDates = new Set<string>()

        for (const record of asanaRecords) {
          // 마스터 상태 카운트
          if (record.status === 'mastered') {
            masteredCount++
          }

          // 최근 28일 수련 일수 계산
          try {
            const practiceLogRelation = (record as any).practiceLog
            const practiceLog = practiceLogRelation?.fetch
              ? await practiceLogRelation.fetch()
              : null

            if (practiceLog) {
              const dateStr = practiceLog.date.split('T')[0]
              if (dateStr >= startDateStr) {
                recentDates.add(dateStr)
              }
            }
          } catch (e) {
            // 관계 로드 실패 시 무시
          }
        }

        const recentPracticeCount = recentDates.size
        const totalPoints = (masteredCount * 2) + recentPracticeCount
        const level = calculateLevel(totalPoints)
        const progress = calculateProgress(totalPoints, level)

        const nextLevelPoints = level < 5
          ? LEVEL_THRESHOLDS[(level + 1) as GrowthLevel]
          : totalPoints

        if (isMounted) {
          setData({
            level,
            masteredCount,
            recentPracticeCount,
            totalPoints,
            nextLevelPoints,
            progress,
          })
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch growth data:', error)
        if (isMounted) {
          setData(null)
          setIsLoading(false)
        }
      }
    }

    fetchGrowthData()

    return () => {
      isMounted = false
    }
  }, [asanaName])

  return { data, isLoading }
}

/**
 * 여러 아사나의 성장 레벨을 일괄로 가져오는 훅 (성능 최적화)
 */
export function useAsanaGrowthLevelBatch(asanaNames: string[]): {
  dataMap: Map<string, GrowthData>
  isLoading: boolean
} {
  const [dataMap, setDataMap] = useState<Map<string, GrowthData>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchBatchData() {
      if (asanaNames.length === 0) {
        setDataMap(new Map())
        setIsLoading(false)
        return
      }

      try {
        // 28일 전 날짜 계산
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 27)
        const startDateStr = startDate.toISOString().split('T')[0]

        // 모든 아사나 기록 한 번에 가져오기
        const allRecords = await practiceLogAsanasCollection
          .query(Q.where('asana_name', Q.oneOf(asanaNames)))
          .fetch()

        // practice_log_id로 그룹핑
        const logIds = [...new Set(allRecords.map((r) => r.practiceLogId))]

        // practice_logs 가져오기
        const logs = await practiceLogsCollection
          .query(Q.where('id', Q.oneOf(logIds)))
          .fetch()

        const logDateMap = new Map<string, string>()
        logs.forEach((log) => {
          logDateMap.set(log.id, log.date.split('T')[0])
        })

        // 아사나별로 데이터 집계
        const asanaDataMap = new Map<string, {
          masteredCount: number
          recentDates: Set<string>
        }>()

        for (const record of allRecords) {
          const asanaName = record.asanaName

          if (!asanaDataMap.has(asanaName)) {
            asanaDataMap.set(asanaName, {
              masteredCount: 0,
              recentDates: new Set(),
            })
          }

          const data = asanaDataMap.get(asanaName)!

          // 마스터 상태 카운트
          if (record.status === 'mastered') {
            data.masteredCount++
          }

          // 최근 28일 수련 일수
          const dateStr = logDateMap.get(record.practiceLogId)
          if (dateStr && dateStr >= startDateStr) {
            data.recentDates.add(dateStr)
          }
        }

        // 결과 생성
        const result = new Map<string, GrowthData>()

        for (const asanaName of asanaNames) {
          const data = asanaDataMap.get(asanaName)

          if (data) {
            const recentPracticeCount = data.recentDates.size
            const totalPoints = (data.masteredCount * 2) + recentPracticeCount
            const level = calculateLevel(totalPoints)
            const progress = calculateProgress(totalPoints, level)
            const nextLevelPoints = level < 5
              ? LEVEL_THRESHOLDS[(level + 1) as GrowthLevel]
              : totalPoints

            result.set(asanaName, {
              level,
              masteredCount: data.masteredCount,
              recentPracticeCount,
              totalPoints,
              nextLevelPoints,
              progress,
            })
          } else {
            result.set(asanaName, {
              level: 1,
              masteredCount: 0,
              recentPracticeCount: 0,
              totalPoints: 0,
              nextLevelPoints: LEVEL_THRESHOLDS[2],
              progress: 0,
            })
          }
        }

        if (isMounted) {
          setDataMap(result)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch batch growth data:', error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchBatchData()

    return () => {
      isMounted = false
    }
  }, [asanaNames.join(',')])

  return { dataMap, isLoading }
}
