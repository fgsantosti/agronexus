'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Download, 
  FileSpreadsheet, 
  FileText,
  Settings,
  Calendar,
  CheckCircle
} from 'lucide-react'
import { exportFilteredData } from '@/utils/export'
import { Animal } from '@/types/animal'

interface ExportAnimaisProps {
  animais: Animal[]
  animaisFiltrados: Animal[]
}

export function ExportAnimais({ animais, animaisFiltrados }: ExportAnimaisProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formato, setFormato] = useState<'excel' | 'pdf'>('excel')
  const [escopo, setEscopo] = useState<'filtrados' | 'todos'>('filtrados')
  const [incluirEstatisticas, setIncluirEstatisticas] = useState(true)
  const [nomeArquivo, setNomeArquivo] = useState('animais_rebanho')
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)

    try {
      const dadosParaExportar = escopo === 'filtrados' ? animaisFiltrados : animais
      
      await exportFilteredData(dadosParaExportar, formato, {
        filename: nomeArquivo,
        title: `Relatório de Animais - ${escopo === 'filtrados' ? 'Dados Filtrados' : 'Todos os Dados'}`,
        includeStats: incluirEstatisticas
      })

      setExportSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setExportSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao exportar:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatIcon = (format: string) => {
    return format === 'excel' ? FileSpreadsheet : FileText
  }

  const getFormatColor = (format: string) => {
    return format === 'excel' ? 'text-green-600' : 'text-red-600'
  }

  const getFormatBadgeColor = (format: string) => {
    return format === 'excel' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Dados dos Animais
          </DialogTitle>
          <DialogDescription>
            Configure as opções de exportação para gerar seu relatório
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas dos dados */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  DADOS FILTRADOS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {animaisFiltrados.length}
                </div>
                <p className="text-sm text-muted-foreground">animais</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  TODOS OS DADOS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {animais.length}
                </div>
                <p className="text-sm text-muted-foreground">animais</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Seleção do formato */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Formato de Exportação</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-all ${
                  formato === 'excel' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-muted hover:border-green-300'
                }`}
                onClick={() => setFormato('excel')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-medium">Excel</h4>
                      <p className="text-sm text-muted-foreground">Planilha .xlsx</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  formato === 'pdf' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-muted hover:border-red-300'
                }`}
                onClick={() => setFormato('pdf')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-red-600" />
                    <div>
                      <h4 className="font-medium">PDF</h4>
                      <p className="text-sm text-muted-foreground">Documento .pdf</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Seleção do escopo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Dados a Exportar</Label>
            <Select value={escopo} onValueChange={(value: 'filtrados' | 'todos') => setEscopo(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="filtrados">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {animaisFiltrados.length}
                    </Badge>
                    Dados Filtrados Atuais
                  </div>
                </SelectItem>
                <SelectItem value="todos">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-teal-100 text-teal-800">
                      {animais.length}
                    </Badge>
                    Todos os Dados
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nome do arquivo */}
          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm font-medium">
              Nome do Arquivo
            </Label>
            <Input
              id="filename"
              value={nomeArquivo}
              onChange={(e) => setNomeArquivo(e.target.value)}
              placeholder="Digite o nome do arquivo"
            />
            <p className="text-xs text-muted-foreground">
              O arquivo será salvo como: {nomeArquivo}_{new Date().toISOString().slice(0, 10).replace(/-/g, '')}.{formato === 'excel' ? 'xlsx' : 'pdf'}
            </p>
          </div>

          {/* Opções adicionais */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Opções Adicionais</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stats"
                checked={incluirEstatisticas}
                onCheckedChange={(checked) => setIncluirEstatisticas(checked as boolean)}
              />
              <Label htmlFor="stats" className="text-sm">
                Incluir estatísticas do rebanho
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Adiciona uma seção com estatísticas como totais, médias e distribuições
            </p>
          </div>

          {/* Resumo da exportação */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Resumo da Exportação</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span>Formato:</span>
                  <Badge className={getFormatBadgeColor(formato)}>
                    {formato.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Dados:</span>
                  <Badge variant="outline">
                    {escopo === 'filtrados' ? animaisFiltrados.length : animais.length} animais
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Estatísticas:</span>
                  <Badge variant={incluirEstatisticas ? "default" : "outline"}>
                    {incluirEstatisticas ? 'Incluídas' : 'Não incluídas'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting || !nomeArquivo.trim()}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  Exportando...
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Exportado com Sucesso!
                </>
              ) : (
                <>
                  {React.createElement(getFormatIcon(formato), { className: "w-4 h-4 mr-2" })}
                  Exportar {formato.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
