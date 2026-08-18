import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ContactCard } from "@/components/contacts/ContactCard";
import { ContactCreateModal } from "@/components/contacts/ContactCreateModal";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { ListViewGrid } from "@/components/common/ListViewGrid";
import { ViewModeToggle } from "@/components/common/ViewModeToggle";
import { Button } from "@/components/ui/button";
import { useListViewMode } from "@/hooks/useListViewMode";
import { useContactsQuery } from "@/hooks/useBanquetData";
import { useListPagination } from "@/hooks/useListPagination";
import type { ContactType } from "@/data/banquetData";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { LIST_PAGE_SIZE } from "@/lib/pagination";
import { cn } from "@/lib/utils";

const FILTERS: Array<"all" | ContactType> = ["all", "customer", "vendor", "employee", "other"];

function parseTypeParam(value: string | null): "all" | ContactType {
  if (value === "customer" || value === "vendor" || value === "employee" || value === "other") {
    return value;
  }
  return "all";
}

const ContactsPage = () => {
  const { t } = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: contacts, isLoading, isError } = useContactsQuery();
  const [view, setView] = useListViewMode("contacts", "grid");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const typeFilter = parseTypeParam(searchParams.get("type"));

  const filtered = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter((contact) => {
      if (typeFilter !== "all" && contact.type !== typeFilter) return false;
      return matchesListSearch(
        search,
        contact.name,
        contact.email,
        contact.phone,
        contact.detail,
        contact.type,
      );
    });
  }, [contacts, search, typeFilter]);

  const pageSize = view === "grid" ? LIST_PAGE_SIZE.card : LIST_PAGE_SIZE.table;
  const pagination = useListPagination(filtered, {
    pageSize,
    resetKey: `${search}|${view}|${typeFilter}`,
  });

  const setTypeFilter = (next: "all" | ContactType) => {
    const params = new URLSearchParams(searchParams);
    if (next === "all") params.delete("type");
    else params.set("type", next);
    setSearchParams(params, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DataLoadingState label={t("contacts.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("contacts.error")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {t("contacts.section")}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <ViewModeToggle value={view} onChange={setView} />
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <ListSearchInput value={search} onChange={setSearch} placeholder={t("contacts.search")} />
            <Button
              type="button"
              size="sm"
              className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t("contacts.add")}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setTypeFilter(filter)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              typeFilter === filter
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {filter === "all" ? t("contacts.filter.all") : t(`contacts.type.${filter}`)}
          </button>
        ))}
      </div>

      {!contacts?.length ? (
        <div className="rounded-xl border border-border/70 bg-card px-6 py-12 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">{t("contacts.empty")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <ListSearchEmpty />
      ) : (
        <div className="space-y-4">
          {view === "grid" ? (
            <ListViewGrid>
              {pagination.items.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </ListViewGrid>
          ) : (
            <ContactsTable contacts={pagination.items} />
          )}
          <ListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
          />
        </div>
      )}

      <ContactCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultType={typeFilter === "all" ? "customer" : typeFilter}
      />
    </div>
  );
};

export default ContactsPage;
