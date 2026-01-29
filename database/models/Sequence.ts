import { Model, Query } from '@nozbe/watermelondb'
import { field, date, readonly, children, lazy } from '@nozbe/watermelondb/decorators'
import { Q } from '@nozbe/watermelondb'
import type { Associations } from '@nozbe/watermelondb/Model'
import type { SequenceAsana } from './SequenceAsana'

export class Sequence extends Model {
  static table = 'sequences'

  static associations: Associations = {
    sequence_asanas: { type: 'has_many', foreignKey: 'sequence_id' },
  }

  @field('name') name!: string
  @readonly @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date

  @children('sequence_asanas') sequenceAsanas!: Query<SequenceAsana>

  // position 순으로 정렬된 아사나 목록
  @lazy
  asanasOrdered = this.sequenceAsanas.extend(Q.sortBy('position', Q.asc))
}
