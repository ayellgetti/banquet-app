import { format, parseISO } from "date-fns";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCreateFormMutation, useDeleteFormMutation, useFormsQuery } from "@/hooks/useForms";
import { matchesListSearch } from "@/lib/listSearch";
import { useT } from "@/i18n";
import { toast } from "sonner";
import type { FormListItem } from "@/lib/formTypes";

const FormsPage = () => {
  const { t } = useT();
  const navigate = useNavigate();
  const { data: forms, isLoading, isError } = useFormsQuery();
  const createMutation = useCreateFormMutation();
  const deleteMutation = useDeleteFormMutation();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<FormListItem | null>(null);

  const filtered = useMemo(() => {
    if (!forms) return [];
    return forms.filter((form) => matchesListSearch(search, form.title, form.description, form.slug));
  }, [forms, search]);

  const handleCreate = async () => {
    try {
      const form = await createMutation.mutateAsync({ title: t("forms.untitled") });
      navigate(`/forms/${form.id}`);
    } catch {
      toast.error(t("forms.createFailed"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(t("forms.deleted"));
      setDeleteTarget(null);
    } catch {
      toast.error(t("forms.deleteFailed"));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <DataLoadingState label={t("forms.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("forms.error")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t("forms.section")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{t("module.forms.desc")}</p>
        </div>
        <div className="flex items-center gap-2">
          <ListSearchInput value={search} onChange={setSearch} placeholder={t("forms.search")} />
          <Button
            type="button"
            size="sm"
            className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            disabled={createMutation.isPending}
            onClick={() => void handleCreate()}
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t("forms.create")}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        search ? (
          <ListSearchEmpty />
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card px-6 py-16 text-center shadow-soft">
            <p className="font-medium">{t("forms.empty")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("forms.emptyHint")}</p>
            <Button
              type="button"
              className="mt-5 gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              disabled={createMutation.isPending}
              onClick={() => void handleCreate()}
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t("forms.create")}
            </Button>
          </div>
        )
      ) : (
        <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
          {filtered.map((form) => (
            <div key={form.id} className="flex items-center gap-4 px-5 py-4">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
                onClick={() => navigate(`/forms/${form.id}`)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground shadow-gold">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{form.title || t("forms.untitled")}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {t("forms.meta")
                      .replace("{questions}", String(form.questionCount))
                      .replace("{responses}", String(form.responseCount))
                      .replace("{date}", format(parseISO(form.updatedAt), "MMM d, yyyy"))}
                  </p>
                </div>
                <Badge variant="outline">{form.published ? t("forms.published") : t("forms.draft")}</Badge>
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteTarget(form)}
                aria-label={t("forms.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("forms.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("forms.deleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()}>{t("forms.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormsPage;
