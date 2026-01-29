import { Model, Query } from '@nozbe/watermelondb'
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators'
import type { Associations } from '@nozbe/watermelondb/Model'
import type { SequenceAsana } from './SequenceAsana'

export class Asana extends Model {
  static table = 'asanas'

  static associations: Associations = {
    sequence_asanas: { type: 'has_many', foreignKey: 'asana_id' },
  }

  @field('english_name') englishName!: string
  @field('sanskrit_name') sanskritName?: string
  @field('category') category?: string
  @field('image_url') imageUrl?: string
  @field('is_favorite') isFavorite!: boolean
  @readonly @date('created_at') createdAt!: Date

  @children('sequence_asanas') sequenceAsanas!: Query<SequenceAsana>
}
