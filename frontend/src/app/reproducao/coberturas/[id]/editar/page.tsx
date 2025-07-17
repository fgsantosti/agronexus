"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CadastroInseminacaoForm } from "@/components/cobertura/cadastro-inseminacao";
import { ArrowLeft } from "lucide-react";

// Mock de busca por ID (substitua por chamada real à API se necessário)
const mockGetInseminacaoById = (id: string) => ({
  animal: "Vaca 001",
  categoria: "Vaca",
  data_inseminacao: "2025-07-17",
  tipo: "IATF",
  reprodutor: "Touro 007",
  estacao_monta: "Estação 2025",
});

export default function EditarInseminacao() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params?.get("id") || "1";
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    // Carrega dados mockados (substitua por fetch real)
    const data = mockGetInseminacaoById(id);
    setInitialData(data);
  }, [id]);

  function handleSubmit(data: any) {
    setSaving(true);
    setSuccess(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(false);
      router.push("/reproducao/coberturas");
    }, 2000);
  }

  function handleCancel() {
    router.push("/reproducao/coberturas");
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6 px-4 md:px-0">
      <div className="flex items-center gap-4 mb-2">
        <button type="button" className="flex items-center gap-2 text-sm px-3 py-2 border rounded" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold">Editar Inseminação</h1>
          <p className="text-muted-foreground">Altere os dados da inseminação ou cobertura.</p>
        </div>
      </div>
      {initialData && (
        <CadastroInseminacaoForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          saving={saving}
          success={success}
        />
      )}
    </div>
  );
}
