import React, { createContext, useContext, ReactNode } from 'react'
import { Database } from '@nozbe/watermelondb'
import { database } from './index'

const DatabaseContext = createContext<Database | null>(null)

interface DatabaseProviderProps {
  children: ReactNode
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase(): Database {
  const db = useContext(DatabaseContext)
  if (!db) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return db
}
