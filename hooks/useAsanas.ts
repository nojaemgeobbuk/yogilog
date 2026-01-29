import { useCallback } from 'react'
import { Q } from '@nozbe/watermelondb'
import { useDatabase } from '@/database/DatabaseProvider'
import {
  database,
  asanasCollection,
  Asana,
} from '@/database'

export function useAsanas() {
  const db = useDatabase()

  const toggleFavorite = useCallback(async (englishName: string) => {
    await db.write(async () => {
      const asanas = await asanasCollection
        .query(Q.where('english_name', englishName))
        .fetch()

      if (asanas.length > 0) {
        // 기존 아사나의 즐겨찾기 토글
        await asanas[0].update((record) => {
          record.isFavorite = !record.isFavorite
        })
      } else {
        // 없으면 새로 생성하고 즐겨찾기 설정
        await asanasCollection.create((asana) => {
          asana.englishName = englishName
          asana.isFavorite = true
          ;(asana as any)._raw.created_at = Date.now()
        })
      }
    })
  }, [db])

  const isFavorite = useCallback(async (englishName: string): Promise<boolean> => {
    const asanas = await asanasCollection
      .query(Q.where('english_name', englishName))
      .fetch()

    return asanas.length > 0 && asanas[0].isFavorite
  }, [])

  const setFavorite = useCallback(async (englishName: string, favorite: boolean) => {
    await db.write(async () => {
      const asanas = await asanasCollection
        .query(Q.where('english_name', englishName))
        .fetch()

      if (asanas.length > 0) {
        await asanas[0].update((record) => {
          record.isFavorite = favorite
        })
      } else if (favorite) {
        // 즐겨찾기로 설정하는 경우에만 새로 생성
        await asanasCollection.create((asana) => {
          asana.englishName = englishName
          asana.isFavorite = true
          ;(asana as any)._raw.created_at = Date.now()
        })
      }
    })
  }, [db])

  const createAsana = useCallback(async (input: {
    englishName: string
    sanskritName?: string
    category?: string
    imageUrl?: string
  }) => {
    return await db.write(async () => {
      // 이미 존재하는지 확인
      const existing = await asanasCollection
        .query(Q.where('english_name', input.englishName))
        .fetch()

      if (existing.length > 0) {
        // 이미 존재하면 업데이트
        await existing[0].update((record) => {
          if (input.sanskritName) record.sanskritName = input.sanskritName
          if (input.category) record.category = input.category
          if (input.imageUrl) record.imageUrl = input.imageUrl
        })
        return existing[0]
      }

      // 없으면 새로 생성
      return await asanasCollection.create((asana) => {
        asana.englishName = input.englishName
        asana.sanskritName = input.sanskritName
        asana.category = input.category
        asana.imageUrl = input.imageUrl
        asana.isFavorite = false
        ;(asana as any)._raw.created_at = Date.now()
      })
    })
  }, [db])

  return {
    toggleFavorite,
    isFavorite,
    setFavorite,
    createAsana,
  }
}

// Observable 쿼리
export const observeAsanas = () =>
  asanasCollection.query(Q.sortBy('english_name', Q.asc)).observe()

export const observeFavoriteAsanas = () =>
  asanasCollection
    .query(Q.where('is_favorite', true), Q.sortBy('english_name', Q.asc))
    .observe()

export const observeAsanasByCategory = (category: string) =>
  asanasCollection
    .query(Q.where('category', category), Q.sortBy('english_name', Q.asc))
    .observe()

// 즐겨찾기 아사나 이름 목록 (동기적으로 가져오기)
export async function getFavoriteAsanaNames(): Promise<string[]> {
  const favorites = await asanasCollection
    .query(Q.where('is_favorite', true))
    .fetch()

  return favorites.map((a) => a.englishName)
}
