import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface EstatisticaCard {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  colorClass?: string;
}

interface EstatisticasCardsProps {
  cards: EstatisticaCard[];
  columns?: string;
}

export function EstatisticasCards({ cards, columns = "grid-cols-1 md:grid-cols-3" }: EstatisticasCardsProps) {
  return (
    <div className={`grid ${columns} gap-4`}>
      {cards.map((card, idx) => (
        <Card key={idx} className="flex flex-col items-center justify-between min-h-[150px] rounded-2xl shadow-md">
          <CardContent className="flex flex-col items-center justify-between w-full h-full p-4">
            {/* Label centralizado no topo */}
            <div className="w-full flex flex-col items-center mt-2 mb-4">
              <p className="text-sm font-medium text-muted-foreground text-center">{card.label}</p>
            </div>
            {/* Valor e ícone centralizados na parte inferior */}
            <div className="flex-1 flex items-end justify-center w-full">
              <span className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold text-center">{card.value}</span>
                {card.icon && (
                  <span className={`text-2xl ${card.colorClass || ""}`}>{card.icon}</span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
