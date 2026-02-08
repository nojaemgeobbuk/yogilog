import { Model, Query } from '@nozbe/watermelondb'
import { field, date, readonly, children, lazy } from '@nozbe/watermelondb/decorators'
import { Q } from '@nozbe/watermelondb'
import type { Associations } from '@nozbe/watermelondb/Model'
import type { PracticeLogAsana } from './PracticeLogAsana'
import type { PracticeLogPhoto } from './PracticeLogPhoto'

export class PracticeLog extends Model {
  static table = 'practice_logs'

  static associations: Associations = {
    practice_log_asanas: { type: 'has_many', foreignKey: 'practice_log_id' },
    practice_log_photos: { type: 'has_many', foreignKey: 'practice_log_id' },
  }

  @field('title') title!: string
  @field('date') date!: string // ISO 형식 문자열
  @field('duration') duration!: number // 분 단위
  @field('intensity') intensity!: number // 1-5
  @field('note') note?: string // HTML 형식 노트
  @field('location') location?: string // 수련 장소
  @field('is_favorite') isFavorite!: boolean
  @readonly @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date

  @children('practice_log_asanas') practiceLogAsanas!: Query<PracticeLogAsana>
  @children('practice_log_photos') practiceLogPhotos!: Query<PracticeLogPhoto>

  // position 순으로 정렬된 아사나 목록
  @lazy
  asanasOrdered = this.practiceLogAsanas.extend(Q.sortBy('position', Q.asc))

  // position 순으로 정렬된 사진 목록
  @lazy
  photosOrdered = this.practiceLogPhotos.extend(Q.sortBy('position', Q.asc))
}
