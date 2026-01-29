import AsyncStorage from '@react-native-async-storage/async-storage'
import { Q } from '@nozbe/watermelondb'
import {
  database,
  practiceLogsCollection,
  practiceLogAsanasCollection,
  practiceLogPhotosCollection,
  sequencesCollection,
  sequenceAsanasCollection,
  asanasCollection,
} from './index'

// 기존 AsyncStorage 데이터 타입 정의
interface LegacyAsanaRecord {
  asanaId: string
  name: string
  note: string
  status?: 'mastered' | 'practicing' | 'learning' | 'attempted'
}

interface LegacyYogaSession {
  id: string
  title: string
  images: string[]
  note: string
  date: string
  duration: number
  intensity: number
  hashtags: string[]
  asanas: LegacyAsanaRecord[]
  isFavorite: boolean
}

interface LegacySequenceAsanaItem {
  itemId: string
  asanaName: string
}

interface LegacyUserSequence {
  id: string
  name: string
  asanas: LegacySequenceAsanaItem[]
  createdAt: string
  updatedAt: string
}

interface LegacyYogaStore {
  sessions: LegacyYogaSession[]
  unlockedBadgeIds: string[]
}

interface LegacySequenceStore {
  savedSequences: LegacyUserSequence[]
  favoriteAsanas: string[]
}

const MIGRATION_COMPLETED_KEY = 'watermelondb_migration_v1_completed'

export async function checkMigrationNeeded(): Promise<boolean> {
  const completed = await AsyncStorage.getItem(MIGRATION_COMPLETED_KEY)
  return completed !== 'true'
}

export async function migrateFromAsyncStorage(): Promise<{
  success: boolean
  sessionsCount: number
  sequencesCount: number
  favoritesCount: number
  error?: string
}> {
  try {
    // 마이그레이션 완료 여부 확인
    const migrationCompleted = await AsyncStorage.getItem(MIGRATION_COMPLETED_KEY)
    if (migrationCompleted === 'true') {
      console.log('[Migration] Already completed, skipping...')
      return { success: true, sessionsCount: 0, sequencesCount: 0, favoritesCount: 0 }
    }

    console.log('[Migration] Starting migration from AsyncStorage to WatermelonDB...')

    // 1. 기존 데이터 로드
    const yogaStoreRaw = await AsyncStorage.getItem('yogilog-storage')
    const sequenceStoreRaw = await AsyncStorage.getItem('yogilog-sequences')

    let yogaStore: LegacyYogaStore | null = null
    let sequenceStore: LegacySequenceStore | null = null

    if (yogaStoreRaw) {
      try {
        const parsed = JSON.parse(yogaStoreRaw)
        yogaStore = parsed.state || parsed
      } catch (e) {
        console.error('[Migration] Failed to parse yogilog-storage:', e)
      }
    }

    if (sequenceStoreRaw) {
      try {
        const parsed = JSON.parse(sequenceStoreRaw)
        sequenceStore = parsed.state || parsed
      } catch (e) {
        console.error('[Migration] Failed to parse yogilog-sequences:', e)
      }
    }

    let sessionsCount = 0
    let sequencesCount = 0
    let favoritesCount = 0

    await database.write(async () => {
      const now = Date.now()

      // 2. 즐겨찾기 아사나 마이그레이션
      if (sequenceStore?.favoriteAsanas && sequenceStore.favoriteAsanas.length > 0) {
        console.log(`[Migration] Migrating ${sequenceStore.favoriteAsanas.length} favorite asanas...`)

        for (const asanaName of sequenceStore.favoriteAsanas) {
          // 이미 존재하는지 확인
          const existing = await asanasCollection
            .query(Q.where('english_name', asanaName))
            .fetch()

          if (existing.length === 0) {
            await asanasCollection.create((asana) => {
              asana.englishName = asanaName
              asana.isFavorite = true
              ;(asana as any)._raw.created_at = now
            })
            favoritesCount++
          } else {
            // 이미 있으면 즐겨찾기로 설정
            await existing[0].update((asana) => {
              asana.isFavorite = true
            })
            favoritesCount++
          }
        }
      }

      // 3. 시퀀스 마이그레이션
      if (sequenceStore?.savedSequences && sequenceStore.savedSequences.length > 0) {
        console.log(`[Migration] Migrating ${sequenceStore.savedSequences.length} sequences...`)

        for (const legacySeq of sequenceStore.savedSequences) {
          const createdAt = new Date(legacySeq.createdAt).getTime()
          const updatedAt = new Date(legacySeq.updatedAt).getTime()

          const sequence = await sequencesCollection.create((seq) => {
            seq.name = legacySeq.name
            ;(seq as any)._raw.created_at = createdAt || now
            ;(seq as any)._raw.updated_at = updatedAt || now
          })

          // 시퀀스 아사나 관계 생성
          for (let i = 0; i < legacySeq.asanas.length; i++) {
            const asanaName = legacySeq.asanas[i].asanaName

            // 아사나가 있는지 확인
            let asanas = await asanasCollection
              .query(Q.where('english_name', asanaName))
              .fetch()

            let asanaId: string

            if (asanas.length === 0) {
              // 없으면 새로 생성
              const newAsana = await asanasCollection.create((asana) => {
                asana.englishName = asanaName
                asana.isFavorite = false
                ;(asana as any)._raw.created_at = now
              })
              asanaId = newAsana.id
            } else {
              asanaId = asanas[0].id
            }

            await sequenceAsanasCollection.create((record) => {
              record.sequenceId = sequence.id
              record.asanaId = asanaId
              record.position = i
              ;(record as any)._raw.created_at = now
            })
          }

          sequencesCount++
        }
      }

      // 4. 요가 세션 마이그레이션
      if (yogaStore?.sessions && yogaStore.sessions.length > 0) {
        console.log(`[Migration] Migrating ${yogaStore.sessions.length} sessions...`)

        for (const legacySession of yogaStore.sessions) {
          const sessionDate = new Date(legacySession.date).getTime()

          const practiceLog = await practiceLogsCollection.create((log) => {
            log.title = legacySession.title
            log.date = legacySession.date
            log.duration = legacySession.duration
            log.intensity = legacySession.intensity
            log.note = legacySession.note || ''
            log.isFavorite = legacySession.isFavorite || false
            ;(log as any)._raw.created_at = sessionDate || now
            ;(log as any)._raw.updated_at = now
          })

          // 아사나 기록 마이그레이션
          for (let i = 0; i < legacySession.asanas.length; i++) {
            const asana = legacySession.asanas[i]
            await practiceLogAsanasCollection.create((record) => {
              record.practiceLogId = practiceLog.id
              record.asanaName = asana.name
              record.position = i
              record.note = asana.note || ''
              record.status = asana.status
              ;(record as any)._raw.created_at = now
            })
          }

          // 사진 마이그레이션
          for (let i = 0; i < legacySession.images.length; i++) {
            await practiceLogPhotosCollection.create((record) => {
              record.practiceLogId = practiceLog.id
              record.photoPath = legacySession.images[i]
              record.position = i
              ;(record as any)._raw.created_at = now
            })
          }

          sessionsCount++
        }
      }
    })

    // 마이그레이션 완료 표시
    await AsyncStorage.setItem(MIGRATION_COMPLETED_KEY, 'true')

    console.log(`[Migration] Completed successfully!`)
    console.log(`[Migration] Sessions: ${sessionsCount}, Sequences: ${sequencesCount}, Favorites: ${favoritesCount}`)

    return {
      success: true,
      sessionsCount,
      sequencesCount,
      favoritesCount,
    }
  } catch (error) {
    console.error('[Migration] Failed:', error)
    return {
      success: false,
      sessionsCount: 0,
      sequencesCount: 0,
      favoritesCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// 마이그레이션 상태 초기화 (개발용)
export async function resetMigration(): Promise<void> {
  await AsyncStorage.removeItem(MIGRATION_COMPLETED_KEY)
  console.log('[Migration] Reset migration status')
}
