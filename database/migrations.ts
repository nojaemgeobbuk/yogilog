import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations'

export const migrations = schemaMigrations({
  migrations: [
    // 버전 1 → 2: practice_logs에 location 컬럼 추가
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'practice_logs',
          columns: [
            { name: 'location', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
})
