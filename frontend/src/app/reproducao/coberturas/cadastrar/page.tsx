"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, User2, CalendarDays, FlaskConical, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

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
  // Estados para controlar a exibição dos autocompletes
  const [showAnimalSuggestions, setShowAnimalSuggestions] = useState(false);
  const [showReprodutorSuggestions, setShowReprodutorSuggestions] = useState(false);

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Cadastrar Inseminação</h1>
          <p className="text-muted-foreground">Preencha os dados para registrar uma nova inseminação ou cobertura.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User2 className="w-5 h-5" />
              Animal
            </CardTitle>
            <CardDescription>Identifique o animal e categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="animal">Animal *</Label>
                <div className="relative">
                  <Input
                    id="animal"
                    placeholder="Pesquise por brinco, lote, número ou nome do animal"
                    value={form.animal}
                    onChange={e => {
                      handleChange("animal", e.target.value);
                      setShowAnimalSuggestions(true);
                    }}
                    onFocus={() => setShowAnimalSuggestions(true)}
                    autoComplete="off"
                    required
                  />
                  {/* Sugestões mockadas para animal (apenas vaca e novilha) */}
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
                              // Preenche a categoria automaticamente
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={form.categoria} onValueChange={v => handleChange("categoria", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vaca">Vaca</SelectItem>
                    <SelectItem value="Novilha">Novilha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Data e Tipo
            </CardTitle>
            <CardDescription>Informe a data e o tipo de inseminação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inseminacao">Data *</Label>
                <Input
                  id="data_inseminacao"
                  type="date"
                  value={form.data_inseminacao}
                  onChange={e => handleChange("data_inseminacao", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={form.tipo} onValueChange={v => handleChange("tipo", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monta Natural">Monta Natural</SelectItem>
                    <SelectItem value="IATF">IATF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Reprodutor/Sêmen
            </CardTitle>
            <CardDescription>Informe o reprodutor ou sêmen utilizado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reprodutor">Reprodutor/Sêmen *</Label>
              <div className="relative">
                <Input
                  id="reprodutor"
                  placeholder="Ex: Touro 007 ou Sêmen ABC123"
                  value={form.reprodutor}
                  onChange={e => {
                    handleChange("reprodutor", e.target.value);
                    setShowReprodutorSuggestions(true);
                  }}
                  onFocus={() => setShowReprodutorSuggestions(true)}
                  autoComplete="off"
                  required
                />
                {/* Sugestões mockadas para reprodutor */}
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Estação de Monta
            </CardTitle>
            <CardDescription>Informe a estação de monta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estacao_monta">Estação de Monta *</Label>
              <Input
                id="estacao_monta"
                placeholder="Ex: Estação 2025"
                value={form.estacao_monta}
                onChange={e => handleChange("estacao_monta", e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Cadastrar"}
          </Button>
        </div>
        {success && (
          <div className="text-green-600 text-center mt-2">Cadastro realizado com sucesso!</div>
        )}
      </form>
    </div>
  );
}
