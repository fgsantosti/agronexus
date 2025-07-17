"use client";
import React from "react";
import { Card } from "@/components/ui/card";

interface DashboardSectionProps {
  title: string;
  description?: string;
  actionButton?: React.ReactNode;
  filters?: React.ReactNode;
  stats?: React.ReactNode;
  children: React.ReactNode; // tabela ou lista principal
}

export function DashboardSection({
  title,
  description,
  actionButton,
  filters,
  stats,
  children,
}: DashboardSectionProps) {
  return (
    <div className="space-y-6 px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actionButton}
      </div>

      {/* Filtros */}
      {filters && <Card>{filters}</Card>}

      {/* Estatísticas resumidas */}
      {stats && <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{stats}</div>}

      {/* Tabela ou lista principal */}
      {children}
    </div>
  );
}
