import { DetalheLote } from '@/components/lote/detalhe-lote'

export default function DetalhePageLote({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <DetalheLote loteId={params.id} />
    </div>
  )
}
