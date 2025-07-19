
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { ReactNode } from "react";

type SelectOption = { value: string; label: string };

interface GenericFiltrosProps {
  search?: {
    value: string;
    onChange: (valor: string) => void;
    placeholder?: string;
  };
  selects?: Array<{
    value: string;
    onChange: (valor: string) => void;
    options: SelectOption[];
    placeholder?: string;
    icon?: ReactNode;
    widthClass?: string;
  }>;
  children?: ReactNode;
}

export function GenericFiltros({ search, selects, children }: GenericFiltrosProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {search && (
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={search.placeholder || "Buscar..."}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}
      {selects && selects.map((select, idx) => (
        <Select key={idx} value={select.value} onValueChange={select.onChange}>
          <SelectTrigger className={select.widthClass || "w-48"}>
            {select.icon}
            <SelectValue placeholder={select.placeholder || "Selecionar"} />
          </SelectTrigger>
          <SelectContent>
            {select.options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {children}
    </div>
  );
}
