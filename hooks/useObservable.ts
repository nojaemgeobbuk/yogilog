import { useState, useEffect } from 'react'
import { Observable } from 'rxjs'

/**
 * Observable을 구독하고 값을 반환하는 훅
 * WatermelonDB의 observe() 결과를 React 상태로 변환
 */
export function useObservable<T>(
  observable: Observable<T> | null | undefined,
  initialValue: T
): T {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    if (!observable) return

    const subscription = observable.subscribe({
      next: (data) => setValue(data),
      error: (err) => console.error('Observable error:', err),
    })

    return () => subscription.unsubscribe()
  }, [observable])

  return value
}

/**
 * Observable을 구독하고 로딩 상태와 함께 반환하는 훅
 */
export function useObservableWithLoading<T>(
  observable: Observable<T> | null | undefined,
  initialValue: T
): { data: T; isLoading: boolean } {
  const [data, setData] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!observable) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const subscription = observable.subscribe({
      next: (value) => {
        setData(value)
        setIsLoading(false)
      },
      error: (err) => {
        console.error('Observable error:', err)
        setIsLoading(false)
      },
    })

    return () => subscription.unsubscribe()
  }, [observable])

  return { data, isLoading }
}
