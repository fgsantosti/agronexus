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
        <Card key={idx}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              {card.icon && (
                <span className={card.colorClass || ""}>{card.icon}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
