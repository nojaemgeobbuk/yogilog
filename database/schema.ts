import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    // 아사나 마스터 데이터 (즐겨찾기 포함)
    tableSchema({
      name: 'asanas',
      columns: [
        { name: 'english_name', type: 'string', isIndexed: true },
        { name: 'sanskrit_name', type: 'string', isOptional: true },
        { name: 'category', type: 'string', isOptional: true },
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'is_favorite', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    // 사용자 저장 시퀀스
    tableSchema({
      name: 'sequences',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // 시퀀스-아사나 관계 테이블
    tableSchema({
      name: 'sequence_asanas',
      columns: [
        { name: 'sequence_id', type: 'string', isIndexed: true },
        { name: 'asana_id', type: 'string', isIndexed: true },
        { name: 'position', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    // 수련 기록 (기존 YogaSession)
    tableSchema({
      name: 'practice_logs',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'duration', type: 'number' },
        { name: 'intensity', type: 'number' },
        { name: 'note', type: 'string', isOptional: true },
        { name: 'is_favorite', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // 수련 기록-아사나 관계 (세션 내 아사나 기록)
    tableSchema({
      name: 'practice_log_asanas',
      columns: [
        { name: 'practice_log_id', type: 'string', isIndexed: true },
        { name: 'asana_name', type: 'string' },
        { name: 'position', type: 'number' },
        { name: 'note', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isOptional: true }, // mastered | practicing | learning | attempted
        { name: 'created_at', type: 'number' },
      ],
    }),

    // 수련 기록 사진
    tableSchema({
      name: 'practice_log_photos',
      columns: [
        { name: 'practice_log_id', type: 'string', isIndexed: true },
        { name: 'photo_path', type: 'string' },
        { name: 'position', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
})
