import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, immutableRelation } from '@nozbe/watermelondb/decorators'
import type { Associations } from '@nozbe/watermelondb/Model'
import type { PracticeLog } from './PracticeLog'

export class PracticeLogPhoto extends Model {
  static table = 'practice_log_photos'

  static associations: Associations = {
    practice_logs: { type: 'belongs_to', key: 'practice_log_id' },
  }

  @field('practice_log_id') practiceLogId!: string
  @field('photo_path') photoPath!: string
  @field('position') position!: number
  @readonly @date('created_at') createdAt!: Date

  @immutableRelation('practice_logs', 'practice_log_id') practiceLog!: PracticeLog
}
