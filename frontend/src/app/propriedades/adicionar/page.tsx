"use client"

import { CadastroGenericoForm, GenericSection } from "@/components/parciais/CadastroGenericoForm"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePropriedadesContext } from "@/contexts/PropriedadesContext"


export default function AdicionarPropriedade() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const { addPropriedade } = usePropriedadesContext()

const sections: GenericSection[] = [
    {
        title: "Informações da Propriedade",
        description: "Preencha os dados básicos da propriedade.",
        fields: [
            {
                name: "nome",
                label: "Nome da Propriedade",
                type: "text",
                required: true,
                placeholder: "Ex: Fazenda Boa Vista",
                colSpan: 2,
            },
            {
                name: "localizacao",
                label: "Localização",
                type: "text",
                placeholder: "Cidade/UF",
                required: true,
            },
            {
                    name: "coordenadas",
                    label: "Coordenadas (opcional)",
                    type: "text",
                    placeholder: "Latitude, Longitude (Ex: -23.5505, -46.6333)",
            },
            {
                name: "area_total_ha",
                label: "Área (ha)",
                type: "text",
                placeholder: "Ex: 120",
                required: true,
            },
            {
                    name: "inscricao_estadual",
                    label: "Inscrição Estadual",
                    type: "text",
                    placeholder: "Ex: 1234567890",
                    
            },
            {
                    name: "cnpj_cpf",
                    label: "CNPJ/CPF",
                    type: "text",
                    placeholder: "Ex: 12.345.678/0001-90 ou 123.456.789-00",
                    colSpan: 2,
            },
            {
                name: "ativa",
                label: "Propriedade ativa?",
                type: "checkbox",
            },
        ],
        gridCols: 2,
    },
]

  async function handleSubmit(data: Record<string, any>) {
    setSaving(true)
    try {
      // Mapeia os campos para o formato da API
      const payload = {
        nome: data.nome,
        localizacao: data.localizacao,
        area_total_ha: data.area_total_ha ? parseFloat(data.area_total_ha.replace(',', '.')) : undefined,
        coordenadas_gps: data.coordenadas ? { coordinates: data.coordenadas } : null,
        inscricao_estadual: data.inscricao_estadual || '',
        cnpj_cpf: data.cnpj_cpf || '',
        ativa: data.ativa || true
      }

      const access = typeof window !== 'undefined' ? localStorage.getItem('access') : null
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/propriedades/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(access ? { Authorization: `Bearer ${access}` } : {})
        },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || "Erro ao cadastrar propriedade")
      }

      const newPropriedade = await res.json()
      
      // Atualiza propriedades no localStorage
      let propriedades: any[] = []
      try {
        const propStr = localStorage.getItem("propriedades")
        if (propStr) propriedades = JSON.parse(propStr)
      } catch {}
      propriedades.push(newPropriedade)
      localStorage.setItem("propriedades", JSON.stringify(propriedades))
      
      // Notifica o contexto sobre a nova propriedade
      addPropriedade(newPropriedade)
      
      alert("Propriedade cadastrada com sucesso!")
      router.push("/dashboard")
    } catch (err: any) {
      alert(err.message || "Erro ao cadastrar propriedade")
    } finally {
      setSaving(false)
    }
  }

  return (
    <CadastroGenericoForm
      title="Adicionar Propriedade"
      description="Cadastre uma nova propriedade rural."
      sections={sections}
      onSubmit={handleSubmit}
      saving={saving}
      submitLabel="Salvar"
      cancelLabel="Cancelar"
      onCancel={() => router.back()}
    />
  )
}
