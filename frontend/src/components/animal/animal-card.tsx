'use client'

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, ArrowUpDown } from 'lucide-react'
import { Animal } from '@/types/animal'

interface AnimalCardProps {
  animal: Animal
  onView: (animalId: string) => void
  onEdit: (animalId: string) => void
  onMove?: (animalId: string) => void
  showMoveAction?: boolean
}

export function AnimalCard({ 
  animal, 
  onView, 
  onEdit, 
  onMove, 
  showMoveAction = false 
}: AnimalCardProps) {
  const calcularIdade = (dataNascimento: string): string => {
    const nascimento = new Date(dataNascimento)
    const hoje = new Date()
    const diffTime = Math.abs(hoje.getTime() - nascimento.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} dias`
    } else if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30)
      return `${meses} ${meses === 1 ? 'mês' : 'meses'}`
    } else {
      const anos = Math.floor(diffDays / 365)
      const mesesRestantes = Math.floor((diffDays % 365) / 30)
      if (mesesRestantes === 0) {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
      }
      return `${anos}a ${mesesRestantes}m`
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{animal.identificacao_unica}</h3>
              <Badge variant={animal.sexo === 'M' ? 'default' : 'secondary'}>
                {animal.sexo === 'M' ? 'Macho' : 'Fêmea'}
              </Badge>
              <Badge variant={animal.status === 'ativo' ? 'default' : 'secondary'}>
                {animal.status}
              </Badge>
            </div>
            
            {animal.nome_registro && (
              <p className="text-sm text-muted-foreground mb-2">
                Nome: {animal.nome_registro}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Categoria: </span>
                <span className="font-medium">{animal.categoria}</span>
              </div>
              
              <div>
                <span className="text-muted-foreground">Idade: </span>
                <span className="font-medium">{calcularIdade(animal.data_nascimento)}</span>
              </div>
              
              {animal.raca && (
                <div>
                  <span className="text-muted-foreground">Raça: </span>
                  <span className="font-medium">
                    {typeof animal.raca === 'string' ? animal.raca : animal.raca.nome}
                  </span>
                </div>
              )}
              
              {animal.peso_atual && (
                <div>
                  <span className="text-muted-foreground">Peso: </span>
                  <span className="font-medium">{animal.peso_atual}kg</span>
                </div>
              )}
              
              {animal.gmd && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">GMD: </span>
                  <span className="font-medium">{animal.gmd}kg/dia</span>
                </div>
              )}
            </div>
            
            {animal.observacoes && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                {animal.observacoes}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(animal.id)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(animal.id)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          
          {showMoveAction && onMove && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMove(animal.id)}
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
