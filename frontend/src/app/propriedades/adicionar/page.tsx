"use client"

import { CadastroGenericoForm, GenericSection } from "@/components/parciais/CadastroGenericoForm"
import { useState } from "react"
import { useRouter } from "next/navigation"


export default function AdicionarPropriedade() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

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
                name: "descricao",
                label: "Descrição",
                type: "textarea",
                placeholder: "Breve descrição da propriedade",
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
                    name: "CNPJ/CPF",
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
      // Garante que area_total_ha seja decimal
      const payload = {
        ...data,
        area_total_ha: data.area_total_ha ? parseFloat(data.area_total_ha.replace(',', '.')) : undefined
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
      // Atualiza propriedades no localStorage
      let propriedades: any[] = []
      try {
        const propStr = localStorage.getItem("propriedades")
        if (propStr) propriedades = JSON.parse(propStr)
      } catch {}
      propriedades.push(payload)
      localStorage.setItem("propriedades", JSON.stringify(propriedades))
      alert("Propriedade cadastrada com sucesso!")
      router.push("/dashboard")
    } catch (err: any) {
      alert(err.message || "Erro ao cadastrar propriedade")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-3xl">
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
      </div>
    </div>
  )
}
