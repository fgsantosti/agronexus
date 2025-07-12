// Exemplo de uso dos componentes de exportação

import { ExportAnimais, ExportQuick } from '@/components/animal'
import { Animal } from '@/types/animal'

// Dados de exemplo
const animaisExemplo: Animal[] = [
  {
    id: '1',
    identificacao_unica: 'BR001',
    nome_registro: 'Estrela',
    sexo: 'F',
    data_nascimento: '2022-03-15',
    raca: 'Nelore',
    categoria: 'novilha',
    status: 'ativo',
    peso_atual: 380,
    lote_atual: 'Lote A',
    gmd: 0.85,
    observacoes: 'Animal em bom estado'
  },
  {
    id: '2',
    identificacao_unica: 'BR002',
    nome_registro: 'Touro Rex',
    sexo: 'M',
    data_nascimento: '2021-01-10',
    raca: 'Angus',
    categoria: 'touro',
    status: 'ativo',
    peso_atual: 750,
    lote_atual: 'Reprodutor',
    gmd: 0.45,
    observacoes: 'Reprodutor principal'
  }
]

export default function ExemploExportacao() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Exemplos de Exportação</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">1. Exportação Completa</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Componente completo com opções avançadas de exportação
          </p>
          <ExportAnimais 
            animais={animaisExemplo} 
            animaisFiltrados={animaisExemplo} 
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">2. Exportação Rápida</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Componente simplificado com menu dropdown
          </p>
          <div className="flex gap-2">
            <ExportQuick 
              animais={animaisExemplo} 
              label="Exportar Dados" 
              variant="default" 
            />
            <ExportQuick 
              animais={animaisExemplo} 
              label="Download" 
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Funcionalidades Implementadas:</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Exportação para Excel (.xlsx) e PDF</li>
          <li>Opção de incluir estatísticas do rebanho</li>
          <li>Escolha entre dados filtrados ou todos os dados</li>
          <li>Personalização do nome do arquivo</li>
          <li>Interface intuitiva com preview das opções</li>
          <li>Feedback visual durante o processo de exportação</li>
          <li>Componente de exportação rápida para uso em outras telas</li>
        </ul>
      </div>
    </div>
  )
}
