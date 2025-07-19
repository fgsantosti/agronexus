import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ReactNode } from "react";

interface Column<T> {
  header: ReactNode;
  cell: (row: T) => ReactNode;
  width?: string;
}

interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (row: T) => ReactNode;
}

export function GenericTable<T>({ data, columns, actions }: GenericTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead key={idx} style={col.width ? { width: col.width } : {}}>
                {col.header}
              </TableHead>
            ))}
            {actions && <TableHead className="w-[80px]">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col, cidx) => (
                <TableCell key={cidx}>{col.cell(row)}</TableCell>
              ))}
              {actions && <TableCell>{actions(row)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
