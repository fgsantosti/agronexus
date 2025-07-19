
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
// Removido import do DashboardLayout, pois o layout já é aplicado via layout.tsx
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, XCircle, User2, Eye, Edit, Trash2 } from "lucide-react";
import { GenericList } from "@/components/parciais/lista-parciais";

// Mock de dados
const coberturas = [
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
];



export default function CoberturasPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const router = useRouter();

  // Filtro aplicado ao mock
  const coberturasFiltradas = coberturas.filter(c => {
    const matchSearch = c.animal.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "todos" ||
      (status === "aguardando" && c.status === "Aguardando diagnóstico") ||
      (status === "confirmada" && c.status === "Prenhez confirmada") ||
      (status === "negativa" && c.status === "Diagnóstico negativo");
    return matchSearch && matchStatus;
  });

  // Estatísticas
  const totalCoberturas = coberturasFiltradas.length;
  const totalPrenhezes = coberturasFiltradas.filter(c => c.status === 'Prenhez confirmada').length;
  const totalNegativos = coberturasFiltradas.filter(c => c.status === 'Diagnóstico negativo').length;
  const totalAnimaisCobertos = new Set(coberturasFiltradas.map(c => c.animal)).size;

  // Colunas para GenericList
  const columns = [
    { header: 'Animal', cell: (c: any) => c.animal },
    { header: 'Categoria', cell: (c: any) => c.categoria },
    { header: 'Data', cell: (c: any) => c.data_inseminacao },
    { header: 'Tipo', cell: (c: any) => <Badge variant={c.tipo === 'IATF' ? 'outline' : 'default'}>{c.tipo}</Badge> },
    { header: 'Reprodutor/Sêmen', cell: (c: any) => c.reprodutor },
    { header: 'Estação de Monta', cell: (c: any) => c.estacao_monta },
    { header: 'Status', cell: (c: any) => <Badge variant={c.status === 'Prenhez confirmada' ? 'default' : c.status === 'Diagnóstico negativo' ? 'destructive' : 'secondary'}>{c.status}</Badge> },
    { header: 'Diagnóstico', cell: (c: any) => c.resultado_diagnostico },
  ];

  // Ações para cada linha
  const actions = (c: any) => (
    <div className="flex gap-2">
      <Button size="icon" variant="ghost" onClick={() => router.push(`/reproducao/coberturas/${c.id}`)}><Eye className="w-4 h-4" /></Button>
      <Button size="icon" variant="ghost" onClick={() => router.push(`/reproducao/coberturas/${c.id}/editar`)}><Edit className="w-4 h-4" /></Button>
      <Button size="icon" variant="ghost" onClick={() => alert('Funcionalidade de exclusão ainda não implementada.')}><Trash2 className="w-4 h-4 text-red-600" /></Button>
    </div>
  );

  return (
    <DashboardSection
      title="Coberturas/Inseminações"
      description="Acompanhe e filtre todas as coberturas realizadas na propriedade."
      stats={
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="flex flex-col items-start p-4">
            <span className="text-muted-foreground text-sm mb-1">Total de Coberturas</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{totalCoberturas}</span>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </Card>
          <Card className="flex flex-col items-start p-4">
            <span className="text-muted-foreground text-sm mb-1">Prenhezes Confirmadas</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{totalPrenhezes}</span>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </Card>
          <Card className="flex flex-col items-start p-4">
            <span className="text-muted-foreground text-sm mb-1">Diagnósticos Negativos</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{totalNegativos}</span>
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </Card>
          <Card className="flex flex-col items-start p-4">
            <span className="text-muted-foreground text-sm mb-1">Animais Cobertos</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{totalAnimaisCobertos}</span>
              <User2 className="w-6 h-6 text-purple-500" />
            </div>
          </Card>
        </div>
      }
      actionButton={
        <a href="/reproducao/coberturas/cadastrar">
          <Button variant="default">Cadastrar Inseminação</Button>
        </a>
      }
    >
      <GenericList
        title="Coberturas/Inseminações"
        data={coberturasFiltradas}
        columns={columns}
        actions={actions}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Pesquisar animal..."
        }}
        selects={[{
          value: status,
          onChange: setStatus,
          options: [
            { value: "todos", label: "Todos os status" },
            { value: "aguardando", label: "Aguardando diagnóstico" },
            { value: "confirmada", label: "Prenhez confirmada" },
            { value: "negativa", label: "Diagnóstico negativo" },
          ],
          placeholder: "Status"
        }]}
        emptyMessage="Nenhuma cobertura encontrada"
        emptyAction={
          <Button onClick={() => router.push('/reproducao/coberturas/cadastrar')}>
            Cadastrar Inseminação
          </Button>
        }
      />
    </DashboardSection>
  );
}
