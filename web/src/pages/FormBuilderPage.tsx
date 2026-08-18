import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Loader2, Plus } from "lucide-react";
import { FormQuestionEditor } from "@/components/forms/FormQuestionEditor";
import { FormQuestionPreview } from "@/components/forms/FormQuestionPreview";
import { FormResponsesTable } from "@/components/forms/FormResponsesTable";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useFormQuery, useFormResponsesQuery, useUpdateFormMutation } from "@/hooks/useForms";
import { createLocalQuestion, type FormDetail, type FormQuestion } from "@/lib/formTypes";
import { useT } from "@/i18n";
import { toast } from "sonner";

const FormBuilderPage = () => {
  const { t } = useT();
  const { id } = useParams<{ id: string }>();
  const { data: form, isLoading, isError } = useFormQuery(id);
  const [tab, setTab] = useState("questions");
  const responsesQuery = useFormResponsesQuery(id, tab === "responses");
  const updateMutation = useUpdateFormMutation(id ?? "");
  const [draft, setDraft] = useState<FormDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "idle">("idle");
  const skipSave = useRef(true);
  const initializedId = useRef<string | null>(null);

  useEffect(() => {
    if (!form) return;
    if (initializedId.current === form.id) return;
    initializedId.current = form.id;
    setDraft(form);
    setSelectedId(form.questions[0]?.id ?? null);
    skipSave.current = true;
  }, [form]);

  useEffect(() => {
    if (!draft || !id) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      setSaveState("saving");
      updateMutation.mutate(
        {
          title: draft.title,
          description: draft.description,
          published: draft.published,
          questions: draft.questions,
        },
        {
          onSuccess: (saved) => {
            setDraft((current) => {
              if (!current) return saved;
              const needsIds = current.questions.some((question, index) => question.id !== saved.questions[index]?.id);
              if (!needsIds) return current;
              return {
                ...current,
                slug: saved.slug,
                questions: current.questions.map((question, index) => ({
                  ...question,
                  id: saved.questions[index]?.id ?? question.id,
                })),
              };
            });
            setSaveState("saved");
          },
          onError: () => {
            setSaveState("idle");
            toast.error(t("forms.saveFailed"));
          },
        },
      );
    }, 700);

    return () => window.clearTimeout(timer);
  }, [draft, id]);

  const shareUrl = useMemo(() => {
    if (!draft?.slug || typeof window === "undefined") return "";
    return `${window.location.origin}/f/${draft.slug}`;
  }, [draft?.slug]);

  const updateDraft = (patch: Partial<FormDetail> | ((current: FormDetail) => FormDetail)) => {
    setDraft((current) => {
      if (!current) return current;
      return typeof patch === "function" ? patch(current) : { ...current, ...patch };
    });
  };

  const addQuestion = () => {
    const question = createLocalQuestion();
    updateDraft((current) => ({ ...current, questions: [...current.questions, question] }));
    setSelectedId(question.id);
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("forms.linkCopied"));
    } catch {
      toast.error(t("forms.copyFailed"));
    }
  };

  if (isLoading || !draft) {
    return (
      <div className="mx-auto max-w-3xl">
        <DataLoadingState label={t("forms.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("forms.error")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/forms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("forms.back")}
        </Link>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {saveState === "saving" ? t("forms.saving") : saveState === "saved" ? t("forms.saved") : ""}
          </p>
          <div className="flex items-center gap-2">
            <Label htmlFor="form-published" className="text-sm">
              {t("forms.publish")}
            </Label>
            <Switch
              id="form-published"
              checked={draft.published}
              onCheckedChange={(published) => updateDraft({ published })}
            />
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="questions">{t("forms.tab.questions")}</TabsTrigger>
          <TabsTrigger value="preview">{t("forms.tab.preview")}</TabsTrigger>
          <TabsTrigger value="responses">
            {t("forms.tab.responses")}
            {draft.responseCount > 0 ? ` (${draft.responseCount})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4 pt-4">
          <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-soft">
            <div className="h-2 bg-gradient-gold" />
            <div className="space-y-3 p-5">
              <Input
                value={draft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
                placeholder={t("forms.title.ph")}
                className="h-auto border-0 border-b border-border/70 px-0 text-2xl font-display font-semibold shadow-none focus-visible:ring-0"
              />
              <Textarea
                value={draft.description ?? ""}
                onChange={(event) => updateDraft({ description: event.target.value || null })}
                placeholder={t("forms.description.ph")}
                rows={2}
                className="border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </section>

          {draft.published && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 text-sm shadow-soft">
              <span className="text-muted-foreground">{t("forms.shareLink")}</span>
              <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs">{shareUrl}</code>
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => void copyLink()}>
                <Copy className="h-3.5 w-3.5" />
                {t("forms.copyLink")}
              </Button>
            </div>
          )}

          {draft.questions.map((question) => (
            <FormQuestionEditor
              key={question.id}
              question={question}
              selected={selectedId === question.id}
              onSelect={() => setSelectedId(question.id)}
              onChange={(next) =>
                updateDraft((current) => ({
                  ...current,
                  questions: current.questions.map((item) => (item.id === question.id ? next : item)),
                }))
              }
              onDuplicate={() => {
                const copy: FormQuestion = {
                  ...createLocalQuestion(question.type),
                  title: question.title,
                  description: question.description,
                  required: question.required,
                  options: [...question.options],
                };
                updateDraft((current) => {
                  const index = current.questions.findIndex((item) => item.id === question.id);
                  const questions = [...current.questions];
                  questions.splice(index + 1, 0, copy);
                  return { ...current, questions };
                });
                setSelectedId(copy.id);
              }}
              onDelete={() => {
                if (draft.questions.length === 1) {
                  toast.error(t("forms.needQuestion"));
                  return;
                }
                updateDraft((current) => ({
                  ...current,
                  questions: current.questions.filter((item) => item.id !== question.id),
                }));
              }}
            />
          ))}

          <Button type="button" variant="outline" className="gap-2" onClick={addQuestion}>
            <Plus className="h-4 w-4" />
            {t("forms.addQuestion")}
          </Button>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4 pt-4">
          <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-soft">
            <div className="h-2 bg-gradient-gold" />
            <div className="p-5">
              <h1 className="font-display text-2xl font-semibold">{draft.title || t("forms.untitled")}</h1>
              {draft.description && <p className="mt-2 text-muted-foreground">{draft.description}</p>}
            </div>
          </section>
          {draft.questions.map((question) => (
            <FormQuestionPreview key={question.id} question={question} readOnly />
          ))}
        </TabsContent>

        <TabsContent value="responses" className="space-y-4 pt-4">
          {responsesQuery.isLoading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("common.loading")}
            </p>
          )}
          {responsesQuery.isError && <p className="text-sm text-destructive">{t("forms.responsesError")}</p>}
          {responsesQuery.data && <FormResponsesTable form={draft} responses={responsesQuery.data} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormBuilderPage;
