import { useCallback } from 'react'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@/database/DatabaseProvider'
import {
  database,
  sequencesCollection,
  sequenceAsanasCollection,
  asanasCollection,
  Sequence,
  SequenceAsana,
} from '@/database'
import { setCreatedTimestamps, setUpdatedTimestamp, setRawTimestamp } from '@/database/types'

export interface CreateSequenceInput {
  name: string
  asanaNames: string[] // 아사나 영어 이름 배열
}

export interface UpdateSequenceInput {
  name?: string
  asanaNames?: string[]
}

export function useSequences() {
  const db = useDatabase()

  const createSequence = useCallback(async (input: CreateSequenceInput) => {
    return await db.write(async () => {
      const now = Date.now()

      // 1. Sequence 생성
      const sequence = await sequencesCollection.create((seq) => {
        seq.name = input.name
        setCreatedTimestamps(seq, now)
      })

      // 2. SequenceAsana 관계 생성
      // 아사나 이름으로 asanas 테이블에서 찾거나 생성
      for (let i = 0; i < input.asanaNames.length; i++) {
        const asanaName = input.asanaNames[i]

        // 아사나가 있는지 확인
        let asanas = await asanasCollection
          .query(Q.where('english_name', asanaName))
          .fetch()

        let asanaId: string

        if (asanas.length === 0) {
          // 없으면 새로 생성
          const newAsana = await asanasCollection.create((asana) => {
            asana.englishName = asanaName
            asana.isFavorite = false
            setRawTimestamp(asana, 'created_at', now)
          })
          asanaId = newAsana.id
        } else {
          asanaId = asanas[0].id
        }

        // SequenceAsana 관계 생성
        await sequenceAsanasCollection.create((record) => {
          record.sequenceId = sequence.id
          record.asanaId = asanaId
          record.position = i
          setRawTimestamp(record, 'created_at', now)
        })
      }

      return sequence
    })
  }, [db])

  const updateSequence = useCallback(async (
    id: string,
    input: UpdateSequenceInput
  ) => {
    await db.write(async () => {
      const sequence = await sequencesCollection.find(id)
      const now = Date.now()

      // 이름 업데이트
      if (input.name !== undefined) {
        await sequence.update((record) => {
          record.name = input.name!
          setUpdatedTimestamp(record, now)
        })
      }

      // 아사나 목록 업데이트 (전체 교체)
      if (input.asanaNames) {
        // 기존 관계 삭제
        const existingRelations = await sequence.sequenceAsanas.fetch()
        for (const relation of existingRelations) {
          await relation.destroyPermanently()
        }

        // 새 관계 생성
        for (let i = 0; i < input.asanaNames.length; i++) {
          const asanaName = input.asanaNames[i]

          let asanas = await asanasCollection
            .query(Q.where('english_name', asanaName))
            .fetch()

          let asanaId: string

          if (asanas.length === 0) {
            const newAsana = await asanasCollection.create((asana) => {
              asana.englishName = asanaName
              asana.isFavorite = false
              setRawTimestamp(asana, 'created_at', now)
            })
            asanaId = newAsana.id
          } else {
            asanaId = asanas[0].id
          }

          await sequenceAsanasCollection.create((record) => {
            record.sequenceId = id
            record.asanaId = asanaId
            record.position = i
            setRawTimestamp(record, 'created_at', now)
          })
        }

        // updated_at 갱신
        await sequence.update((record) => {
          setUpdatedTimestamp(record, now)
        })
      }
    })
  }, [db])

  const deleteSequence = useCallback(async (id: string) => {
    await db.write(async () => {
      const sequence = await sequencesCollection.find(id)

      // 관련 SequenceAsana 삭제
      const relations = await sequence.sequenceAsanas.fetch()
      for (const relation of relations) {
        await relation.destroyPermanently()
      }

      await sequence.destroyPermanently()
    })
  }, [db])

  const getSequence = useCallback(async (id: string) => {
    return await sequencesCollection.find(id)
  }, [])

  return {
    createSequence,
    updateSequence,
    deleteSequence,
    getSequence,
  }
}

// Observable 쿼리
export const observeSequences = () =>
  sequencesCollection.query(Q.sortBy('created_at', Q.desc)).observe()

export const observeSequenceById = (id: string) =>
  sequencesCollection.findAndObserve(id)

// 시퀀스의 아사나 이름 목록 가져오기
export async function getSequenceAsanaNames(sequence: Sequence): Promise<string[]> {
  const relations = await sequence.asanasOrdered.fetch()
  const names: string[] = []

  for (const relation of relations) {
    // Relation 타입의 fetch 메서드 호출 (타입 정의 문제 우회)
    const asanaRelation = (relation as any).asana
    const asana = asanaRelation?.fetch ? await asanaRelation.fetch() : null
    if (asana) {
      names.push(asana.englishName)
    }
  }

  return names
}
