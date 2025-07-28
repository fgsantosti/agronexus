"use client"

import React, { createContext, useContext, useCallback } from 'react'
import { usePropriedades, type Propriedade } from '@/hooks/usePropriedades'

interface PropriedadesContextType {
  propriedades: Propriedade[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addPropriedade: (propriedade: Propriedade) => void
}

const PropriedadesContext = createContext<PropriedadesContextType | undefined>(undefined)

export function PropriedadesProvider({ children }: { children: React.ReactNode }) {
  const { propriedades, loading, error, refetch } = usePropriedades()

  const addPropriedade = useCallback((novaPropriedade: Propriedade) => {
    // Refetch automaticamente quando uma nova propriedade é adicionada
    refetch()
  }, [refetch])

  return (
    <PropriedadesContext.Provider
      value={{
        propriedades,
        loading,
        error,
        refetch,
        addPropriedade,
      }}
    >
      {children}
    </PropriedadesContext.Provider>
  )
}

export function usePropriedadesContext() {
  const context = useContext(PropriedadesContext)
  if (context === undefined) {
    throw new Error('usePropriedadesContext must be used within a PropriedadesProvider')
  }
  return context
}
