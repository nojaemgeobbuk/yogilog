import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, immutableRelation } from '@nozbe/watermelondb/decorators'
import type { Associations } from '@nozbe/watermelondb/Model'
import type { PracticeLog } from './PracticeLog'

export type AsanaStatus = 'mastered' | 'practicing' | 'learning' | 'attempted'

export class PracticeLogAsana extends Model {
  static table = 'practice_log_asanas'

  static associations: Associations = {
    practice_logs: { type: 'belongs_to', key: 'practice_log_id' },
  }

  @field('practice_log_id') practiceLogId!: string
  @field('asana_name') asanaName!: string
  @field('position') position!: number
  @field('note') note?: string
  @field('status') status?: AsanaStatus
  @readonly @date('created_at') createdAt!: Date

  @immutableRelation('practice_logs', 'practice_log_id') practiceLog!: PracticeLog
}
