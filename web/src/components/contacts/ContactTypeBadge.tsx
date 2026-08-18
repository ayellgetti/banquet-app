import { cn } from "@/lib/utils";
import type { ContactType } from "@/data/banquetData";
import { useT } from "@/i18n";

const typeClass: Record<ContactType, string> = {
  customer: "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  vendor: "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  employee: "border-sky-500/25 bg-sky-500/10 text-sky-800 dark:text-sky-200",
  other: "border-border bg-muted/60 text-muted-foreground",
};

export function ContactTypeBadge({ type, className }: { type: ContactType; className?: string }) {
  const { t } = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        typeClass[type],
        className,
      )}
    >
      {t(`contacts.type.${type}`)}
    </span>
  );
}
