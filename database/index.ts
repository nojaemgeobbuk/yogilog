import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema'
import {
  Asana,
  Sequence,
  SequenceAsana,
  PracticeLog,
  PracticeLogAsana,
  PracticeLogPhoto,
} from './models'

// SQLite 어댑터 생성
const adapter = new SQLiteAdapter({
  schema,
  dbName: 'yogilog',
  onSetUpError: (error) => {
    console.error('WatermelonDB setup error:', error)
  },
})

// Database 인스턴스 생성
export const database = new Database({
  adapter,
  modelClasses: [
    Asana,
    Sequence,
    SequenceAsana,
    PracticeLog,
    PracticeLogAsana,
    PracticeLogPhoto,
  ],
})

// 편의를 위한 컬렉션 내보내기
export const asanasCollection = database.get<Asana>('asanas')
export const sequencesCollection = database.get<Sequence>('sequences')
export const sequenceAsanasCollection = database.get<SequenceAsana>('sequence_asanas')
export const practiceLogsCollection = database.get<PracticeLog>('practice_logs')
export const practiceLogAsanasCollection = database.get<PracticeLogAsana>('practice_log_asanas')
export const practiceLogPhotosCollection = database.get<PracticeLogPhoto>('practice_log_photos')

// 모델 타입 재export
export type { Asana, Sequence, SequenceAsana, PracticeLog, PracticeLogAsana, PracticeLogPhoto }
export type { AsanaStatus } from './models'
