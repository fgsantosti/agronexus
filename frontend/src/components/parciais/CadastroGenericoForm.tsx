
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Componente de formulário genérico e reutilizável
type FieldType = 'text' | 'textarea' | 'select' | 'checkbox';

export interface GenericField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[]; // para select
  description?: string;
  icon?: React.ReactNode;
  colSpan?: number; // para grid
  disabled?: boolean;
}

export interface GenericSection {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  fields: GenericField[];
  gridCols?: number; // 1, 2, 3
}

interface CadastroGenericoFormProps {
  title: string;
  description?: string;
  sections: GenericSection[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  saving?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export function CadastroGenericoForm({
  title,
  description,
  sections,
  initialData = {},
  onSubmit,
  onCancel,
  saving = false,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
}: CadastroGenericoFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {sections.map((section, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {section.icon}
                {section.title}
              </CardTitle>
              {section.description && <CardDescription>{section.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid grid-cols-1 md:grid-cols-${section.gridCols || 1} gap-4`}>
                {section.fields.map((field) => (
                  <div className="space-y-2" key={field.name} style={field.colSpan ? { gridColumn: `span ${field.colSpan} / span ${field.colSpan}` } : {}}>
                    <Label htmlFor={field.name}>{field.label}{field.required && ' *'}</Label>
                    {field.type === 'text' && (
                      <Input
                        id={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        disabled={field.disabled}
                      />
                    )}
                    {field.type === 'textarea' && (
                      <Textarea
                        id={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        rows={3}
                        required={field.required}
                        disabled={field.disabled}
                      />
                    )}
                    {field.type === 'select' && field.options && (
                      <Select
                        value={formData[field.name] || ''}
                        onValueChange={(value) => handleChange(field.name, value)}
                        disabled={field.disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || 'Selecione'} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {field.type === 'checkbox' && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={field.name}
                          checked={!!formData[field.name]}
                          onCheckedChange={(checked) => handleChange(field.name, checked)}
                          disabled={field.disabled}
                        />
                        <Label htmlFor={field.name}>{field.label}</Label>
                      </div>
                    )}
                    {field.description && (
                      <span className="text-sm text-muted-foreground">{field.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting || saving}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={submitting || saving}>
            {submitting || saving ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Exemplo de uso:
// <CadastroGenericoForm
//   title="Novo Lote"
//   description="Crie um novo lote para organizar seus animais"
//   sections={...}
//   initialData={...}
//   onSubmit={...}
//   onCancel={...}
// />
