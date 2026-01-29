import { Model, Relation } from '@nozbe/watermelondb'
import { field, date, readonly, immutableRelation } from '@nozbe/watermelondb/decorators'
import type { Associations } from '@nozbe/watermelondb/Model'
import type { Sequence } from './Sequence'
import type { Asana } from './Asana'

export class SequenceAsana extends Model {
  static table = 'sequence_asanas'

  static associations: Associations = {
    sequences: { type: 'belongs_to', key: 'sequence_id' },
    asanas: { type: 'belongs_to', key: 'asana_id' },
  }

  @field('sequence_id') sequenceId!: string
  @field('asana_id') asanaId!: string
  @field('position') position!: number
  @readonly @date('created_at') createdAt!: Date

  @immutableRelation('sequences', 'sequence_id') sequence!: Relation<Sequence>
  @immutableRelation('asanas', 'asana_id') asana!: Relation<Asana>
}
