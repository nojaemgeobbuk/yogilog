import { useCallback } from 'react'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@/database/DatabaseProvider'
import {
  database,
  practiceLogsCollection,
  practiceLogAsanasCollection,
  practiceLogPhotosCollection,
  PracticeLog,
  PracticeLogAsana,
  PracticeLogPhoto,
} from '@/database'
import type { AsanaStatus } from '@/database'
import { setCreatedTimestamps, setUpdatedTimestamp, setRawTimestamp } from '@/database/types'

export interface CreatePracticeLogInput {
  title: string
  date: string
  duration: number
  intensity: number
  note?: string
  asanas: Array<{
    name: string
    note?: string
    status?: AsanaStatus
  }>
  photos: string[]
}

export interface UpdatePracticeLogInput {
  title?: string
  date?: string
  duration?: number
  intensity?: number
  note?: string
  isFavorite?: boolean
  asanas?: Array<{
    name: string
    note?: string
    status?: AsanaStatus
  }>
  photos?: string[]
}

export function usePracticeLogs() {
  const db = useDatabase()

  const createPracticeLog = useCallback(async (input: CreatePracticeLogInput) => {
    return await db.write(async () => {
      const now = Date.now()

      // 1. PracticeLog 생성
      const practiceLog = await practiceLogsCollection.create((log) => {
        log.title = input.title
        log.date = input.date
        log.duration = input.duration
        log.intensity = input.intensity
        log.note = input.note || ''
        log.isFavorite = false
        setCreatedTimestamps(log, now)
      })

      // 2. 아사나 기록 생성
      for (let i = 0; i < input.asanas.length; i++) {
        const asana = input.asanas[i]
        await practiceLogAsanasCollection.create((record) => {
          record.practiceLogId = practiceLog.id
          record.asanaName = asana.name
          record.position = i
          record.note = asana.note || ''
          record.status = asana.status
          setRawTimestamp(record, 'created_at', now)
        })
      }

      // 3. 사진 기록 생성
      for (let i = 0; i < input.photos.length; i++) {
        await practiceLogPhotosCollection.create((record) => {
          record.practiceLogId = practiceLog.id
          record.photoPath = input.photos[i]
          record.position = i
          setRawTimestamp(record, 'created_at', now)
        })
      }

      return practiceLog
    })
  }, [db])

  const updatePracticeLog = useCallback(async (
    id: string,
    input: UpdatePracticeLogInput
  ) => {
    await db.write(async () => {
      const log = await practiceLogsCollection.find(id)
      const now = Date.now()

      // 기본 필드 업데이트
      await log.update((record) => {
        if (input.title !== undefined) record.title = input.title
        if (input.date !== undefined) record.date = input.date
        if (input.duration !== undefined) record.duration = input.duration
        if (input.intensity !== undefined) record.intensity = input.intensity
        if (input.note !== undefined) record.note = input.note
        if (input.isFavorite !== undefined) record.isFavorite = input.isFavorite
        setUpdatedTimestamp(record, now)
      })

      // 아사나 업데이트 (있으면 전체 교체)
      if (input.asanas) {
        const existingAsanas = await log.practiceLogAsanas.fetch()
        for (const asana of existingAsanas) {
          await asana.destroyPermanently()
        }

        for (let i = 0; i < input.asanas.length; i++) {
          const asana = input.asanas[i]
          await practiceLogAsanasCollection.create((record) => {
            record.practiceLogId = id
            record.asanaName = asana.name
            record.position = i
            record.note = asana.note || ''
            record.status = asana.status
            setRawTimestamp(record, 'created_at', now)
          })
        }
      }

      // 사진 업데이트 (있으면 전체 교체)
      if (input.photos) {
        const existingPhotos = await log.practiceLogPhotos.fetch()
        for (const photo of existingPhotos) {
          await photo.destroyPermanently()
        }

        for (let i = 0; i < input.photos.length; i++) {
          await practiceLogPhotosCollection.create((record) => {
            record.practiceLogId = id
            record.photoPath = input.photos![i]
            record.position = i
            setRawTimestamp(record, 'created_at', now)
          })
        }
      }
    })
  }, [db])

  const deletePracticeLog = useCallback(async (id: string) => {
    await db.write(async () => {
      const log = await practiceLogsCollection.find(id)

      // 관련 레코드 삭제
      const asanas = await log.practiceLogAsanas.fetch()
      const photos = await log.practiceLogPhotos.fetch()

      for (const asana of asanas) {
        await asana.destroyPermanently()
      }
      for (const photo of photos) {
        await photo.destroyPermanently()
      }
      await log.destroyPermanently()
    })
  }, [db])

  const toggleFavorite = useCallback(async (id: string) => {
    await db.write(async () => {
      const log = await practiceLogsCollection.find(id)
      await log.update((record) => {
        record.isFavorite = !record.isFavorite
        setUpdatedTimestamp(record, Date.now())
      })
    })
  }, [db])

  const getPracticeLog = useCallback(async (id: string) => {
    return await practiceLogsCollection.find(id)
  }, [])

  return {
    createPracticeLog,
    updatePracticeLog,
    deletePracticeLog,
    toggleFavorite,
    getPracticeLog,
  }
}

// Observable 쿼리 (자동 리렌더링을 위한 함수들)
export const observePracticeLogs = () =>
  practiceLogsCollection.query(Q.sortBy('created_at', Q.desc)).observe()

export const observePracticeLogById = (id: string) =>
  practiceLogsCollection.findAndObserve(id)

export const observePracticeLogsByDate = (datePrefix: string) =>
  practiceLogsCollection
    .query(Q.where('date', Q.like(`${datePrefix}%`)))
    .observe()

export const observeFavoritePracticeLogs = () =>
  practiceLogsCollection
    .query(Q.where('is_favorite', true), Q.sortBy('created_at', Q.desc))
    .observe()

// 아사나와 사진 가져오기 헬퍼
export async function getPracticeLogDetails(practiceLog: PracticeLog) {
  const asanas = await practiceLog.asanasOrdered.fetch()
  const photos = await practiceLog.photosOrdered.fetch()

  return {
    asanas: asanas.map((a) => ({
      asanaId: a.id,
      name: a.asanaName,
      note: a.note || '',
      status: a.status,
    })),
    images: photos.map((p) => p.photoPath),
  }
}
