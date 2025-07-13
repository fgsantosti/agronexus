'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  Download, 
  FileSpreadsheet, 
  FileText,
  ChevronDown,
  CheckCircle
} from 'lucide-react'
import { exportFilteredData } from '@/utils/export'
import { Animal } from '@/types/animal'

interface ExportQuickProps {
  animais: Animal[]
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

export function ExportQuick({ 
  animais, 
  label = "Exportar", 
  variant = "outline", 
  size = "sm" 
}: ExportQuickProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const handleExport = async (formato: 'excel' | 'pdf', includeStats: boolean = true) => {
    setIsExporting(true)
    setExportSuccess(false)

    try {
      await exportFilteredData(animais, formato, {
        filename: `animais_rebanho_${formato}`,
        title: 'Relatório de Animais - Exportação Rápida',
        includeStats
      })

      setExportSuccess(true)
      setTimeout(() => {
        setExportSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao exportar:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          {isExporting ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
              Exportando...
            </>
          ) : exportSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Exportado!
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              {label}
              <ChevronDown className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          Exportar {animais.length} {animais.length === 1 ? 'animal' : 'animais'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleExport('excel', true)}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          Excel com Estatísticas
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('excel', false)}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          Excel Simples
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleExport('pdf', true)}
          className="cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          PDF com Estatísticas
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('pdf', false)}
          className="cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          PDF Simples
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
