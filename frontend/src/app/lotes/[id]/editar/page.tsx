import { EditarLote } from '@/components/lote/editar-lote'

export default function EditarLotePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <EditarLote loteId={params.id} />
    </div>
  )
}
