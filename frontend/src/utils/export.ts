import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Animal, ExportOptions } from '@/types/animal'

// Função para calcular idade do animal
const calcularIdade = (dataNascimento: string): string => {
  const hoje = new Date()
  const nascimento = new Date(dataNascimento)
  const diffTime = hoje.getTime() - nascimento.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) return `${diffDays} dias`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`
  return `${Math.floor(diffDays / 365)} anos`
}

// Função para exportar para Excel
export const exportToExcel = (animais: Animal[], options: ExportOptions = {}) => {
  const { filename = 'animais_rebanho', title = 'Relatório de Animais' } = options

  // Preparar dados para exportação
  const dadosExport = animais.map(animal => ({
    'Identificação': animal.identificacao_unica,
    'Nome': animal.nome_registro,
    'Sexo': animal.sexo === 'M' ? 'Macho' : 'Fêmea',
    'Data de Nascimento': new Date(animal.data_nascimento).toLocaleDateString('pt-BR'),
    'Idade': calcularIdade(animal.data_nascimento),
    'Raça': animal.raca,
    'Categoria': animal.categoria,
    'Status': animal.status,
    'Peso Atual (kg)': animal.peso_atual || '-',
    'Peso (@)': animal.peso_atual ? (animal.peso_atual / 15).toFixed(1) : '-',
    'Lote': animal.lote_atual || '-',
    'GMD (kg/dia)': animal.gmd ? animal.gmd.toFixed(2) : '-',
    'Observações': animal.observacoes || '-'
  }))

  // Criar workbook
  const wb = XLSX.utils.book_new()
  
  // Criar planilha principal
  const ws = XLSX.utils.json_to_sheet(dadosExport)
  
  // Adicionar título
  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' })
  XLSX.utils.sheet_add_aoa(ws, [[`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`]], { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(ws, [[`Total de animais: ${animais.length}`]], { origin: 'A3' })
  
  // Ajustar dados para começar na linha 5
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  range.s.r = 4 // Começar na linha 5
  
  // Remover os dados antigos e adicionar novamente
  const headers = Object.keys(dadosExport[0] || {})
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A5' })
  XLSX.utils.sheet_add_json(ws, dadosExport, { origin: 'A6', skipHeader: true })
  
  // Definir largura das colunas
  const colWidths = [
    { wch: 15 }, // Identificação
    { wch: 20 }, // Nome
    { wch: 8 },  // Sexo
    { wch: 15 }, // Data Nascimento
    { wch: 10 }, // Idade
    { wch: 15 }, // Raça
    { wch: 12 }, // Categoria
    { wch: 10 }, // Status
    { wch: 12 }, // Peso Atual
    { wch: 10 }, // Peso @
    { wch: 15 }, // Lote
    { wch: 12 }, // GMD
    { wch: 25 }  // Observações
  ]
  ws['!cols'] = colWidths
  
  // Adicionar à workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Animais')
  
  // Adicionar planilha de estatísticas se solicitado
  if (options.includeStats) {
    const stats = {
      'Total de Animais': animais.length,
      'Machos': animais.filter(a => a.sexo === 'M').length,
      'Fêmeas': animais.filter(a => a.sexo === 'F').length,
      'Animais Ativos': animais.filter(a => a.status === 'ativo').length,
      'Peso Médio (kg)': animais.reduce((sum, a) => sum + (a.peso_atual || 0), 0) / animais.filter(a => a.peso_atual).length || 0,
      'Peso Total (kg)': animais.reduce((sum, a) => sum + (a.peso_atual || 0), 0),
      'Peso Total (@)': (animais.reduce((sum, a) => sum + (a.peso_atual || 0), 0) / 15).toFixed(1),
      'GMD Médio (kg/dia)': animais.reduce((sum, a) => sum + (a.gmd || 0), 0) / animais.filter(a => a.gmd).length || 0
    }
    
    const statsData = Object.entries(stats).map(([key, value]) => ({
      'Métrica': key,
      'Valor': typeof value === 'number' ? value.toFixed(2) : value
    }))
    
    const wsStats = XLSX.utils.json_to_sheet(statsData)
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estatísticas')
  }
  
  // Salvar arquivo
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`)
}

// Função para exportar para PDF
export const exportToPDF = (animais: Animal[], options: ExportOptions = {}) => {
  const { filename = 'animais_rebanho', title = 'Relatório de Animais' } = options

  // Criar documento PDF
  const doc = new jsPDF('landscape') // Formato paisagem para mais colunas
  
  // Adicionar título
  doc.setFontSize(18)
  doc.text(title, 20, 20)
  
  // Adicionar informações do relatório
  doc.setFontSize(12)
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 30)
  doc.text(`Total de animais: ${animais.length}`, 20, 40)
  
  // Preparar dados para tabela
  const tableData = animais.map(animal => [
    animal.identificacao_unica,
    animal.nome_registro,
    animal.sexo === 'M' ? 'M' : 'F',
    new Date(animal.data_nascimento).toLocaleDateString('pt-BR'),
    calcularIdade(animal.data_nascimento),
    animal.raca,
    animal.categoria,
    animal.status,
    animal.peso_atual ? `${animal.peso_atual} kg` : '-',
    animal.lote_atual || '-',
    animal.gmd ? `${animal.gmd.toFixed(2)}` : '-'
  ])
  
  // Adicionar tabela
  autoTable(doc, {
    head: [['ID', 'Nome', 'Sexo', 'Nascimento', 'Idade', 'Raça', 'Categoria', 'Status', 'Peso', 'Lote', 'GMD']],
    body: tableData,
    startY: 50,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [20, 184, 166], // Cor teal
      textColor: 255
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 20 }, // ID
      1: { cellWidth: 30 }, // Nome
      2: { cellWidth: 15 }, // Sexo
      3: { cellWidth: 25 }, // Nascimento
      4: { cellWidth: 20 }, // Idade
      5: { cellWidth: 25 }, // Raça
      6: { cellWidth: 25 }, // Categoria
      7: { cellWidth: 20 }, // Status
      8: { cellWidth: 25 }, // Peso
      9: { cellWidth: 25 }, // Lote
      10: { cellWidth: 20 } // GMD
    }
  })
  
  // Adicionar estatísticas se solicitado
  if (options.includeStats) {
    const finalY = (doc as any).lastAutoTable.finalY || 50
    
    doc.setFontSize(14)
    doc.text('Estatísticas do Rebanho', 20, finalY + 20)
    
    const stats = [
      ['Total de Animais', animais.length.toString()],
      ['Machos', animais.filter(a => a.sexo === 'M').length.toString()],
      ['Fêmeas', animais.filter(a => a.sexo === 'F').length.toString()],
      ['Animais Ativos', animais.filter(a => a.status === 'ativo').length.toString()],
      ['Peso Médio (kg)', (animais.reduce((sum, a) => sum + (a.peso_atual || 0), 0) / animais.filter(a => a.peso_atual).length || 0).toFixed(2)],
      ['Peso Total (kg)', animais.reduce((sum, a) => sum + (a.peso_atual || 0), 0).toFixed(2)],
      ['Peso Total (@)', (animais.reduce((sum, a) => sum + (a.peso_atual || 0), 0) / 15).toFixed(1)],
      ['GMD Médio (kg/dia)', (animais.reduce((sum, a) => sum + (a.gmd || 0), 0) / animais.filter(a => a.gmd).length || 0).toFixed(2)]
    ]
    
    autoTable(doc, {
      head: [['Métrica', 'Valor']],
      body: stats,
      startY: finalY + 30,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [20, 184, 166],
        textColor: 255
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40 }
      }
    })
  }
  
  // Salvar arquivo
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  doc.save(`${filename}_${timestamp}.pdf`)
}

// Função para exportar dados filtrados
export const exportFilteredData = (
  animais: Animal[], 
  formato: 'excel' | 'pdf', 
  options: ExportOptions = {}
) => {
  if (formato === 'excel') {
    exportToExcel(animais, options)
  } else {
    exportToPDF(animais, options)
  }
}
