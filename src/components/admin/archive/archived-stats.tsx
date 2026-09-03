import { Card } from "@/components/ui/card";
import { Archive } from "lucide-react";

interface ArchivedStatsProps {
  totalArchived: number;
}

export function ArchivedStats({ totalArchived }: ArchivedStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Archive className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">إجمالي الدورات المؤرشفة</p>
            <p className="text-2xl font-bold">{totalArchived}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
