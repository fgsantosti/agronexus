
"use client";
import React, { useState } from "react";
// Removido import do DashboardLayout, pois o layout já é aplicado via layout.tsx
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, XCircle, User2, Search, Filter } from "lucide-react";

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

  // Filtros
  const filters = (
    <CardContent className="p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar animal..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="todos">Todos os status</option>
            <option value="aguardando">Aguardando diagnóstico</option>
            <option value="confirmada">Prenhez confirmada</option>
            <option value="negativa">Diagnóstico negativo</option>
          </select>
        </div>
      </div>
    </CardContent>
  );

  // Estatísticas
  const stats = (
    <>
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
    </>
  );

  // Tabela principal
  const table = (
    <Card className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Animal</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Reprodutor/Sêmen</TableHead>
            <TableHead>Estação de Monta</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Diagnóstico</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coberturasFiltradas.map((cobertura) => (
            <TableRow key={cobertura.id}>
              <TableCell>{cobertura.animal}</TableCell>
              <TableCell>{cobertura.categoria}</TableCell>
              <TableCell>{cobertura.data_inseminacao}</TableCell>
              <TableCell>
                <Badge variant={cobertura.tipo === 'IATF' ? 'outline' : 'default'}>
                  {cobertura.tipo}
                </Badge>
              </TableCell>
              <TableCell>{cobertura.reprodutor}</TableCell>
              <TableCell>{cobertura.estacao_monta}</TableCell>
              <TableCell>
                <Badge variant={
                  cobertura.status === 'Prenhez confirmada' ? 'default' :
                  cobertura.status === 'Diagnóstico negativo' ? 'destructive' : 'secondary'
                }>
                  {cobertura.status}
                </Badge>
              </TableCell>
              <TableCell>{cobertura.resultado_diagnostico}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <DashboardSection
      title="Coberturas/Inseminações"
      description="Acompanhe e filtre todas as coberturas realizadas na propriedade."
      filters={filters}
      stats={stats}
      actionButton={
        <a href="/reproducao/coberturas/cadastrar">
          <Button variant="default">Cadastrar Inseminação</Button>
        </a>
      }
    >
      {table}
    </DashboardSection>
  );
}
