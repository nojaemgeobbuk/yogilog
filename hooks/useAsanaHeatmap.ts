import { useState, useEffect, useCallback } from 'react'
import { Q } from '@nozbe/watermelondb'
import {
  database,
  practiceLogsCollection,
  practiceLogAsanasCollection,
  PracticeLog,
  PracticeLogAsana,
} from '@/database'
import type { AsanaStatus } from '@/database/models/PracticeLogAsana'

export interface HeatmapDay {
  date: string // YYYY-MM-DD
  status: AsanaStatus | null
  count: number // 해당 날짜에 몇 번 수련했는지
}

export interface HeatmapData {
  days: HeatmapDay[]
  totalPractices: number
  streak: number // 연속 수련 일수
}

/**
 * 특정 아사나의 최근 28일간 수련 기록을 가져오는 훅
 * 성능 최적화: 쿼리를 최소화하고 결과를 캐싱
 */
export function useAsanaHeatmap(asanaName: string): {
  data: HeatmapData | null
  isLoading: boolean
} {
  const [data, setData] = useState<HeatmapData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchHeatmapData() {
      try {
        // 28일 전 날짜 계산
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 27) // 오늘 포함 28일

        // 날짜 배열 생성 (28일)
        const days: HeatmapDay[] = []
        for (let i = 0; i < 28; i++) {
          const date = new Date(startDate)
          date.setDate(date.getDate() + i)
          days.push({
            date: date.toISOString().split('T')[0],
            status: null,
            count: 0,
          })
        }

        // 해당 아사나의 모든 수련 기록 가져오기
        const asanaRecords = await practiceLogAsanasCollection
          .query(Q.where('asana_name', asanaName))
          .fetch()

        if (asanaRecords.length === 0) {
          if (isMounted) {
            setData({ days, totalPractices: 0, streak: 0 })
            setIsLoading(false)
          }
          return
        }

        // 각 기록의 practice_log에서 날짜 가져오기
        const dateStatusMap = new Map<string, { status: AsanaStatus | null; count: number }>()

        for (const record of asanaRecords) {
          try {
            const practiceLogRelation = (record as any).practiceLog
            const practiceLog: PracticeLog | null = practiceLogRelation?.fetch
              ? await practiceLogRelation.fetch()
              : null

            if (practiceLog) {
              const dateStr = practiceLog.date.split('T')[0]
              const existing = dateStatusMap.get(dateStr)

              if (existing) {
                existing.count += 1
                // 더 높은 상태로 업데이트 (mastered > practicing > learning > attempted)
                if (record.status && getStatusPriority(record.status) > getStatusPriority(existing.status)) {
                  existing.status = record.status
                }
              } else {
                dateStatusMap.set(dateStr, {
                  status: record.status || null,
                  count: 1,
                })
              }
            }
          } catch (e) {
            // 관계 로드 실패 시 무시
          }
        }

        // days 배열에 데이터 매핑
        let totalPractices = 0
        days.forEach((day) => {
          const record = dateStatusMap.get(day.date)
          if (record) {
            day.status = record.status
            day.count = record.count
            totalPractices += record.count
          }
        })

        // 연속 수련 일수 계산 (오늘부터 역순으로)
        let streak = 0
        for (let i = days.length - 1; i >= 0; i--) {
          if (days[i].count > 0) {
            streak++
          } else {
            break
          }
        }

        if (isMounted) {
          setData({ days, totalPractices, streak })
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch heatmap data:', error)
        if (isMounted) {
          setData(null)
          setIsLoading(false)
        }
      }
    }

    fetchHeatmapData()

    return () => {
      isMounted = false
    }
  }, [asanaName])

  return { data, isLoading }
}

// 상태 우선순위 (높을수록 좋은 상태)
function getStatusPriority(status: AsanaStatus | null): number {
  switch (status) {
    case 'mastered':
      return 4
    case 'practicing':
      return 3
    case 'learning':
      return 2
    case 'attempted':
      return 1
    default:
      return 0
  }
}

/**
 * 여러 아사나의 히트맵 데이터를 일괄로 가져오는 훅 (성능 최적화)
 */
export function useAsanaHeatmapBatch(asanaNames: string[]): {
  dataMap: Map<string, HeatmapData>
  isLoading: boolean
} {
  const [dataMap, setDataMap] = useState<Map<string, HeatmapData>>(new Map())
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

        // practice_logs 가져오기 (날짜 필터링은 메모리에서)
        const logs = await practiceLogsCollection
          .query(Q.where('id', Q.oneOf(logIds)))
          .fetch()

        const logDateMap = new Map<string, string>()
        logs.forEach((log) => {
          logDateMap.set(log.id, log.date.split('T')[0])
        })

        // 아사나별로 데이터 그룹핑
        const asanaDataMap = new Map<string, Map<string, { status: AsanaStatus | null; count: number }>>()

        for (const record of allRecords) {
          const dateStr = logDateMap.get(record.practiceLogId)
          if (!dateStr || dateStr < startDateStr) continue

          if (!asanaDataMap.has(record.asanaName)) {
            asanaDataMap.set(record.asanaName, new Map())
          }

          const dateMap = asanaDataMap.get(record.asanaName)!
          const existing = dateMap.get(dateStr)

          if (existing) {
            existing.count += 1
            if (record.status && getStatusPriority(record.status) > getStatusPriority(existing.status)) {
              existing.status = record.status
            }
          } else {
            dateMap.set(dateStr, {
              status: record.status || null,
              count: 1,
            })
          }
        }

        // 결과 생성
        const result = new Map<string, HeatmapData>()

        for (const asanaName of asanaNames) {
          const days: HeatmapDay[] = []
          for (let i = 0; i < 28; i++) {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]
            const record = asanaDataMap.get(asanaName)?.get(dateStr)

            days.push({
              date: dateStr,
              status: record?.status || null,
              count: record?.count || 0,
            })
          }

          let totalPractices = 0
          days.forEach((d) => (totalPractices += d.count))

          let streak = 0
          for (let i = days.length - 1; i >= 0; i--) {
            if (days[i].count > 0) streak++
            else break
          }

          result.set(asanaName, { days, totalPractices, streak })
        }

        if (isMounted) {
          setDataMap(result)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch batch heatmap data:', error)
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
