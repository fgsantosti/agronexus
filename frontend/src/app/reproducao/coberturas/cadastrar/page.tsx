"use client"

import React, { useState } from "react";
import { ArrowLeft, Save, User2, CalendarDays, FlaskConical, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { CadastroGenericoForm, GenericSection, GenericField } from "@/components/parciais/CadastroGenericoForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CadastroInseminacao() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    animal: "",
    categoria: "",
    data_inseminacao: "",
    tipo: "",
    reprodutor: "",
    estacao_monta: "",
  });
  const [showAnimalSuggestions, setShowAnimalSuggestions] = useState(false);
  const [showReprodutorSuggestions, setShowReprodutorSuggestions] = useState(false);

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(data: Record<string, any>) {
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

  // Definição dos campos e seções para o formulário genérico
  const sections: GenericSection[] = [
    {
      title: "Animal",
      icon: <User2 className="w-5 h-5" />,
      description: "Identifique o animal e categoria",
      gridCols: 2,
      fields: [
        {
          name: "animal",
          label: "Animal",
          type: "text",
          required: true,
          placeholder: "Pesquise por brinco, lote, número ou nome do animal",
        },
        {
          name: "categoria",
          label: "Categoria",
          type: "select",
          required: true,
          options: [
            { value: "Vaca", label: "Vaca" },
            { value: "Novilha", label: "Novilha" },
          ],
          placeholder: "Selecione a categoria",
        },
      ],
    },
    {
      title: "Data e Tipo",
      icon: <CalendarDays className="w-5 h-5" />,
      description: "Informe a data e o tipo de inseminação",
      gridCols: 2,
      fields: [
        {
          name: "data_inseminacao",
          label: "Data",
          type: "text",
          required: true,
          placeholder: "Data da inseminação",
        },
        {
          name: "tipo",
          label: "Tipo",
          type: "select",
          required: true,
          options: [
            { value: "Monta Natural", label: "Monta Natural" },
            { value: "IATF", label: "IATF" },
          ],
          placeholder: "Selecione o tipo",
        },
      ],
    },
    {
      title: "Reprodutor/Sêmen",
      icon: <FlaskConical className="w-5 h-5" />,
      description: "Informe o reprodutor ou sêmen utilizado",
      fields: [
        {
          name: "reprodutor",
          label: "Reprodutor/Sêmen",
          type: "text",
          required: true,
          placeholder: "Ex: Touro 007 ou Sêmen ABC123",
        },
      ],
    },
    {
      title: "Estação de Monta",
      icon: <MapPin className="w-5 h-5" />,
      description: "Informe a estação de monta",
      fields: [
        {
          name: "estacao_monta",
          label: "Estação de Monta",
          type: "text",
          required: true,
          placeholder: "Ex: Estação 2025",
        },
      ],
    },
  ];

  // Renderização customizada para autocomplete animal e reprodutor
  function renderCustomField(field: GenericField) {
    if (field.name === "animal") {
      return (
        <div className="relative">
          <Input
            id="animal"
            placeholder={field.placeholder}
            value={form.animal}
            onChange={e => {
              handleChange("animal", e.target.value);
              setShowAnimalSuggestions(true);
            }}
            onFocus={() => setShowAnimalSuggestions(true)}
            autoComplete="off"
            required={field.required}
          />
          {form.animal.length > 0 && showAnimalSuggestions && (
            <ul className="absolute z-10 bg-white border rounded w-full mt-1 shadow-lg max-h-40 overflow-auto">
              {[
                { brinco: "001", nome: "Vaca 001", lote: "Lote A", numero: "1001" },
                { brinco: "002", nome: "Vaca 002", lote: "Lote B", numero: "1002" },
                { brinco: "003", nome: "Novilha 003", lote: "Lote C", numero: "1003" },
              ]
                .filter(animal =>
                  animal.brinco.includes(form.animal) ||
                  animal.nome.toLowerCase().includes(form.animal.toLowerCase()) ||
                  animal.lote.toLowerCase().includes(form.animal.toLowerCase()) ||
                  animal.numero.includes(form.animal)
                )
                .map(animal => (
                  <li
                    key={animal.brinco}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      handleChange("animal", animal.nome);
                      if (animal.nome.toLowerCase().includes("vaca")) {
                        handleChange("categoria", "Vaca");
                      } else if (animal.nome.toLowerCase().includes("novilha")) {
                        handleChange("categoria", "Novilha");
                      } else {
                        handleChange("categoria", "");
                      }
                      setShowAnimalSuggestions(false);
                    }}
                  >
                    <span className="font-semibold">{animal.nome}</span>
                    <span className="ml-2 text-xs text-muted-foreground">Brinco: {animal.brinco} | Lote: {animal.lote} | Nº: {animal.numero}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      );
    }
    if (field.name === "reprodutor") {
      return (
        <div className="relative">
          <Input
            id="reprodutor"
            placeholder={field.placeholder}
            value={form.reprodutor}
            onChange={e => {
              handleChange("reprodutor", e.target.value);
              setShowReprodutorSuggestions(true);
            }}
            onFocus={() => setShowReprodutorSuggestions(true)}
            autoComplete="off"
            required={field.required}
          />
          {form.reprodutor.length > 0 && showReprodutorSuggestions && (
            <ul className="absolute z-10 bg-white border rounded w-full mt-1 shadow-lg max-h-40 overflow-auto">
              {[
                { nome: "Touro 007" },
                { nome: "Touro 008" },
                { nome: "Sêmen ABC123" },
                { nome: "Sêmen XYZ789" },
              ]
                .filter(rep =>
                  rep.nome.toLowerCase().includes(form.reprodutor.toLowerCase())
                )
                .map(rep => (
                  <li
                    key={rep.nome}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      handleChange("reprodutor", rep.nome);
                      setShowReprodutorSuggestions(false);
                    }}
                  >
                    <span className="font-semibold">{rep.nome}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <CadastroGenericoForm
        title="Cadastro de Inseminação"
        description="Preencha os dados para registrar uma nova inseminação ou cobertura."
        sections={sections}
        initialData={form}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        saving={saving}
        submitLabel="Cadastrar"
        cancelLabel="Cancelar"
        // @ts-ignore
        renderCustomField={renderCustomField}
      />
      {success && (
        <div className="text-green-600 text-center mt-2">Cadastro realizado com sucesso!</div>
      )}
    </div>
  );
}
