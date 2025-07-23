'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, MapPin, Users, BarChart3, Trash2, AlertTriangle, Eye, UserPlus, Grid3X3, List } from 'lucide-react'
import { useRouter } from 'next/navigation'
// Este componente agora é genérico e pode ser usado para qualquer entidade
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


// Tipos genéricos para o componente
interface DetalheGenericoProps<T = any> {
  entity?: T | null
  entityName?: string // Ex: "Lote", "Animal"
  loading?: boolean
  notFoundMessage?: string
  onBack?: () => void
  onEdit?: () => void
  onDelete?: () => Promise<void> | void
  deleting?: boolean
  deleteDialogText?: {
    title?: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
  }
  statusBadge?: React.ReactNode
  headerChildren?: React.ReactNode
  tabs: Array<{
    value: string
    label: string
    content: React.ReactNode
  }>
  defaultTab?: string
}


export function DetalheGenerico<T = any>({
  entity,
  entityName = 'Item',
  loading = false,
  notFoundMessage = 'Item não encontrado',
  onBack,
  onEdit,
  onDelete,
  deleting = false,
  deleteDialogText,
  statusBadge,
  headerChildren,
  tabs,
  defaultTab = 'overview',
}: DetalheGenericoProps<T>) {


  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    )
  }

  if (!entity) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{notFoundMessage}</h2>
          <p className="text-muted-foreground mb-4">
            {entityName} solicitado não foi encontrado ou foi removido.
          </p>
          {onBack && (
            <Button onClick={onBack}>
              Voltar
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{entity?.nome || entityName}</h1>
            {headerChildren}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge}
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{deleteDialogText?.title || `Confirmar exclusão`}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {deleteDialogText?.description || `Tem certeza que deseja excluir este ${entityName}? Esta ação não pode ser desfeita.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{deleteDialogText?.cancelLabel || 'Cancelar'}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? 'Excluindo...' : (deleteDialogText?.confirmLabel || 'Excluir')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
