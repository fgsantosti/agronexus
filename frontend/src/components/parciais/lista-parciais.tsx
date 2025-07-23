
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericFiltros } from "./common/GenericFiltros";
import { GenericTable } from "./common/GenericTabela";

interface GenericListProps<T> {
  title: string;
  data: T[];
  columns: any[];
  actions?: (row: T) => React.ReactNode;
  search?: {
    value: string;
    onChange: (valor: string) => void;
    placeholder?: string;
  };
  selects?: Array<{
    value: string;
    onChange: (valor: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
  }>;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  children?: React.ReactNode;
  aboveTable?: React.ReactNode;
}

export function GenericList<T>({
  title,
  data,
  columns,
  actions,
  search,
  selects,
  emptyMessage = "Nenhum registro encontrado",
  emptyAction,
  children,
  aboveTable
}: GenericListProps<T>) {
  return (
    <div className="space-y-6">
      {aboveTable && (
        <div>{aboveTable}</div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <GenericFiltros search={search} selects={selects} />
          {data.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
              {emptyAction}
            </div>
          ) : (
            <GenericTable data={data} columns={columns} actions={actions} />
          )}
        </CardContent>
      </Card>
      {children}
    </div>
  );
}
