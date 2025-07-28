"use client"

import { usePropriedadesContext } from "@/contexts/PropriedadesContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Home, Eye, Edit, Trash2 } from "lucide-react"

export default function PropriedadesPage() {
  const { propriedades, loading, error } = usePropriedadesContext()
  const router = useRouter()

  if (loading) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Propriedades</h1>
            <p className="text-muted-foreground">Gerencie suas propriedades rurais</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p>Carregando propriedades...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Propriedades</h1>
            <p className="text-muted-foreground">Gerencie suas propriedades rurais</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500">Erro ao carregar propriedades: {error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Propriedades</h1>
          <p className="text-muted-foreground">Gerencie suas propriedades rurais</p>
        </div>
        <Button onClick={() => router.push('/propriedades/adicionar')}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Propriedade
        </Button>
      </div>

      {propriedades.length === 0 ? (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma propriedade encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece adicionando sua primeira propriedade rural
          </p>
          <Button onClick={() => router.push('/propriedades/adicionar')}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeira Propriedade
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propriedades.map((propriedade) => (
            <Card key={propriedade.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  {propriedade.nome}
                </CardTitle>
                <CardDescription>{propriedade.localizacao}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Área Total:</span>
                    <span>{propriedade.area_total_ha} ha</span>
                  </div>
                  {propriedade.total_animais !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Animais:</span>
                      <span>{propriedade.total_animais}</span>
                    </div>
                  )}
                  {propriedade.total_lotes !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lotes:</span>
                      <span>{propriedade.total_lotes}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={propriedade.ativa ? "text-green-600" : "text-red-600"}>
                      {propriedade.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                </div>
                
                {/* Botões de ação */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => router.push(`/propriedades/${propriedade.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // TODO: Implementar edição
                      console.log('Editar propriedade:', propriedade.id)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      // TODO: Implementar exclusão
                      console.log('Excluir propriedade:', propriedade.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
