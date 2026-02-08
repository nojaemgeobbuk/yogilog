import { Model, RawRecord } from '@nozbe/watermelondb'

/**
 * WatermelonDB Model의 내부 _raw 속성에 타입 안전하게 접근하기 위한 타입
 */
export interface RawTimestamps {
  created_at: number
  updated_at: number
}

/**
 * Model 레코드에서 타입 안전하게 timestamp를 설정하는 헬퍼 함수
 */
export function setRawTimestamp(
  record: Model,
  field: 'created_at' | 'updated_at',
  timestamp: number
): void {
  const raw = (record as Model & { _raw: RawRecord & RawTimestamps })._raw
  raw[field] = timestamp
}

/**
 * created_at과 updated_at을 동시에 설정 (새 레코드 생성 시)
 */
export function setCreatedTimestamps(record: Model, timestamp: number): void {
  setRawTimestamp(record, 'created_at', timestamp)
  setRawTimestamp(record, 'updated_at', timestamp)
}

/**
 * updated_at만 설정 (레코드 업데이트 시)
 */
export function setUpdatedTimestamp(record: Model, timestamp: number): void {
  setRawTimestamp(record, 'updated_at', timestamp)
}
