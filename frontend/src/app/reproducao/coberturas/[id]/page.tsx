'use client'

import { DetalheGenerico } from '@/components/parciais/DetalheGenerico'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Trash2 } from 'lucide-react'

// Mock de dados (substitua por fetch/api quando integrar)
const mockCoberturas = [
  {
    id: '1',
    animal: 'Vaca 001',
    categoria: 'Vaca',
    data_inseminacao: '2025-07-10',
    tipo: 'Monta Natural',
    reprodutor: 'Touro 007',
    estacao_monta: 'Estação 2025',
    status: 'Aguardando diagnóstico',
    resultado_diagnostico: '-',
  },
  {
    id: '2',
    animal: 'Vaca 002',
    categoria: 'Vaca',
    data_inseminacao: '2025-07-12',
    tipo: 'IATF',
    reprodutor: 'Sêmen ABC123',
    estacao_monta: 'Estação 2025',
    status: 'Prenhez confirmada',
    resultado_diagnostico: 'Positivo',
  },
  {
    id: '3',
    animal: 'Novilha 003',
    categoria: 'Novilha',
    data_inseminacao: '2025-07-15',
    tipo: 'Monta Natural',
    reprodutor: 'Touro 008',
    estacao_monta: 'Estação 2025',
    status: 'Diagnóstico negativo',
    resultado_diagnostico: 'Negativo',
  },
]

export default function DetalheCoberturaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cobertura, setCobertura] = useState<any | null>(null)

  useEffect(() => {
    setLoading(true)
    // Simula busca
    const found = mockCoberturas.find(c => c.id === params.id)
    setCobertura(found || null)
    setLoading(false)
  }, [params.id])

  return (
    <div className="container mx-auto py-6">
      <DetalheGenerico
        entity={cobertura}
        entityName="Cobertura/Inseminação"
        loading={loading}
        notFoundMessage="Cobertura não encontrada"
        onBack={() => router.push('/reproducao/coberturas')}
        onEdit={() => router.push(`/reproducao/coberturas/${params.id}/editar`)}
        // onDelete={() => {}}
        tabs={[
          {
            value: 'overview',
            label: 'Visão Geral',
            content: cobertura && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold">Animal:</span> {cobertura.animal}
                </div>
                <div>
                  <span className="font-semibold">Categoria:</span> {cobertura.categoria}
                </div>
                <div>
                  <span className="font-semibold">Data:</span> {cobertura.data_inseminacao}
                </div>
                <div>
                  <span className="font-semibold">Tipo:</span> <Badge>{cobertura.tipo}</Badge>
                </div>
                <div>
                  <span className="font-semibold">Reprodutor/Sêmen:</span> {cobertura.reprodutor}
                </div>
                <div>
                  <span className="font-semibold">Estação de Monta:</span> {cobertura.estacao_monta}
                </div>
                <div>
                  <span className="font-semibold">Status:</span> <Badge>{cobertura.status}</Badge>
                </div>
                <div>
                  <span className="font-semibold">Diagnóstico:</span> {cobertura.resultado_diagnostico}
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
