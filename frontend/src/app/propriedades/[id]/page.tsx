"use client"

import { useParams, useRouter } from "next/navigation"
import { usePropriedadesContext } from "@/contexts/PropriedadesContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Calendar, 
  BarChart3, 
  FileText,
  Edit,
  Trash2
} from "lucide-react"
import withAuth from "../../withAuth"

function PropriedadeDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const { propriedades, loading, error } = usePropriedadesContext()
  
  const propriedadeId = params.id as string
  const propriedade = propriedades.find(p => p.id === propriedadeId)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Carregando propriedade...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Erro ao carregar propriedade: {error}</p>
      </div>
    )
  }

  if (!propriedade) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-gray-500">Propriedade não encontrada.</p>
        <Button onClick={() => router.push('/propriedades')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Propriedades
        </Button>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatArea = (area: string) => {
    return `${parseFloat(area).toFixed(2)} ha`
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => router.push('/propriedades')} 
          variant="ghost" 
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Informações principais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{propriedade.nome}</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <MapPin className="mr-1 h-4 w-4" />
                {propriedade.localizacao}
              </CardDescription>
            </div>
            <Badge variant={propriedade.ativa ? "default" : "secondary"}>
              {propriedade.ativa ? "Ativa" : "Inativa"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do proprietário */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <User className="mr-2 h-4 w-4" />
              Proprietário
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Nome:</span>
                <p className="font-medium">
                  {propriedade.proprietario.first_name} {propriedade.proprietario.last_name}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Usuário:</span>
                <p className="font-medium">{propriedade.proprietario.username}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações da propriedade */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Informações da Propriedade
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Área Total:</span>
                <p className="font-medium">{formatArea(propriedade.area_total_ha)}</p>
              </div>
              {propriedade.area_ocupada && (
                <div>
                  <span className="text-gray-500">Área Ocupada:</span>
                  <p className="font-medium">{propriedade.area_ocupada}</p>
                </div>
              )}
              {propriedade.taxa_ocupacao_global && (
                <div>
                  <span className="text-gray-500">Taxa de Ocupação:</span>
                  <p className="font-medium">{propriedade.taxa_ocupacao_global}%</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Data de Criação:</span>
                <p className="font-medium">{formatDate(propriedade.data_criacao)}</p>
              </div>
              {propriedade.inscricao_estadual && (
                <div>
                  <span className="text-gray-500">Inscrição Estadual:</span>
                  <p className="font-medium">{propriedade.inscricao_estadual}</p>
                </div>
              )}
              {propriedade.cnpj_cpf && (
                <div>
                  <span className="text-gray-500">CNPJ/CPF:</span>
                  <p className="font-medium">{propriedade.cnpj_cpf}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Estatísticas */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Estatísticas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {propriedade.total_animais || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total de Animais</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {propriedade.total_lotes || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total de Lotes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {propriedade.total_areas || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total de Áreas</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coordenadas GPS (se disponível) */}
          {propriedade.coordenadas_gps && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Coordenadas GPS
                </h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <code className="text-sm">
                    {JSON.stringify(propriedade.coordenadas_gps, null, 2)}
                  </code>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(PropriedadeDetalhesPage)
