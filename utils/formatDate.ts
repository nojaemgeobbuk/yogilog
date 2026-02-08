/**
 * Date and Duration formatting utilities for Yogilog
 */

import { format } from 'date-fns'

/**
 * ISO 날짜 문자열을 'YYYY. MM. DD' 형식으로 변환
 * @param isoString - ISO 8601 형식의 날짜 문자열 (예: '2026-01-26T10:43:45.000Z')
 * @returns 'YYYY. MM. DD' 형식의 문자열 (예: '2026. 01. 26')
 */
export function formatDateDot(isoString: string): string {
  if (!isoString) return ''

  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}. ${month}. ${day}`
  } catch {
    return ''
  }
}

/**
 * ISO 날짜 문자열을 'MM월 DD일' 형식으로 변환
 * @param isoString - ISO 8601 형식의 날짜 문자열
 * @returns 'MM월 DD일' 형식의 문자열 (예: '1월 26일')
 */
export function formatDateKorean(isoString: string): string {
  if (!isoString) return ''

  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''

    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${month}월 ${day}일`
  } catch {
    return ''
  }
}

/**
 * ISO 날짜 문자열을 'Mon DD, YYYY' 형식으로 변환
 * @param isoString - ISO 8601 형식의 날짜 문자열
 * @returns 영문 날짜 형식 (예: 'Jan 26, 2026')
 */
export function formatDateEnglish(isoString: string): string {
  if (!isoString) return ''

  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * 상대적 시간 표시 (예: '2일 전', '방금 전')
 * @param isoString - ISO 8601 형식의 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(isoString: string): string {
  if (!isoString) return ''

  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    if (diffDays < 7) return `${diffDays}일 전`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`
    return `${Math.floor(diffDays / 365)}년 전`
  } catch {
    return ''
  }
}

/**
 * ISO 날짜 문자열을 'D MMM' 형식으로 변환 (대문자)
 * History 화면 등에서 사용
 * @param isoString - ISO 8601 형식의 날짜 문자열
 * @returns '15 OCT' 형식의 문자열
 */
export function formatDateShort(isoString: string): string {
  if (!isoString) return ''

  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''
    return format(date, 'd MMM').toUpperCase()
  } catch {
    return ''
  }
}

/**
 * ISO 날짜 문자열을 'MMM D, YYYY' 형식으로 변환
 * SessionCard 등에서 사용
 * @param isoString - ISO 8601 형식의 날짜 문자열
 * @returns 'Oct 15, 2026' 형식의 문자열
 */
export function formatCardDate(isoString: string): string {
  if (!isoString) return ''

  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''
    return format(date, 'MMM d, yyyy')
  } catch {
    return ''
  }
}

/**
 * 분 단위 시간을 읽기 좋은 형식으로 변환
 * @param minutes - 분 단위 시간
 * @returns '1h 30m' 또는 '45m' 형식의 문자열
 */
export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

/**
 * 분 단위 시간을 총 시간으로 변환
 * @param minutes - 분 단위 시간
 * @returns '12.5h' 형식의 문자열
 */
export function formatTotalHours(minutes: number): string {
  const hours = minutes / 60
  return `${hours.toFixed(1)}h`
}
