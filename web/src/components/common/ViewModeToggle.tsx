import { Columns3, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ListViewMode } from "@/hooks/useListViewMode";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const MODE_META: Record<ListViewMode, { icon: typeof List; labelKey: string }> = {
  board: { icon: Columns3, labelKey: "common.view.board" },
  grid: { icon: LayoutGrid, labelKey: "common.view.grid" },
  list: { icon: List, labelKey: "common.view.list" },
};

type Props = {
  value: ListViewMode;
  onChange: (mode: ListViewMode) => void;
  modes?: ListViewMode[];
  className?: string;
};

export const ViewModeToggle = ({
  value,
  onChange,
  modes = ["grid", "list"],
  className,
}: Props) => {
  const { t } = useT();

  return (
    <div className={cn("inline-flex shrink-0 rounded-lg border border-border/70 bg-muted/30 p-1", className)}>
      {modes.map((mode) => {
        const meta = MODE_META[mode];
        const Icon = meta.icon;

        return (
          <Button
            key={mode}
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", value === mode && "bg-background shadow-sm")}
            aria-label={t(meta.labelKey)}
            aria-pressed={value === mode}
            onClick={() => onChange(mode)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
};
