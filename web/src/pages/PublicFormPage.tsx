import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { FormQuestionPreview } from "@/components/forms/FormQuestionPreview";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { Button } from "@/components/ui/button";
import { usePublicFormQuery, useSubmitPublicFormMutation } from "@/hooks/useForms";
import type { FormAnswers } from "@/lib/formTypes";
import { ApiError } from "@/lib/apiClient";
import { useT } from "@/i18n";
import { toast } from "sonner";

const PublicFormPage = () => {
  const { t } = useT();
  const { slug } = useParams<{ slug: string }>();
  const { data: form, isLoading, isError } = usePublicFormQuery(slug);
  const submitMutation = useSubmitPublicFormMutation(slug ?? "");
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const emptyAnswers = useMemo(() => {
    const next: FormAnswers = {};
    for (const question of form?.questions ?? []) {
      next[question.id] = question.type === "CHECKBOXES" ? [] : "";
    }
    return next;
  }, [form]);

  const handleSubmit = async () => {
    if (!form) return;
    const nextErrors: Record<string, string> = {};
    for (const question of form.questions) {
      const value = answers[question.id];
      const empty = question.type === "CHECKBOXES"
        ? !Array.isArray(value) || value.length === 0
        : !String(value ?? "").trim();
      if (question.required && empty) {
        nextErrors[question.id] = t("forms.requiredError");
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t("forms.fixErrors"));
      return;
    }

    try {
      await submitMutation.mutateAsync(answers);
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t("forms.submitFailed");
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <DataLoadingState label={t("forms.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("forms.publicMissing")}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-border/70 bg-card shadow-soft">
        <div className="h-2 bg-gradient-gold" />
        <div className="p-8">
          <h1 className="font-display text-2xl font-semibold">{form.title}</h1>
          <p className="mt-3 text-muted-foreground">{t("forms.thanks")}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={() => {
              setSubmitted(false);
              setAnswers(emptyAnswers);
              setErrors({});
            }}
          >
            {t("forms.submitAnother")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-16">
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-soft">
        <div className="h-2 bg-gradient-gold" />
        <div className="p-6">
          <h1 className="font-display text-2xl font-semibold">{form.title}</h1>
          {form.description && <p className="mt-2 text-muted-foreground">{form.description}</p>}
          <p className="mt-4 text-sm text-destructive">* {t("forms.requiredHint")}</p>
        </div>
      </section>

      {form.questions.map((question) => (
        <FormQuestionPreview
          key={question.id}
          question={question}
          value={answers[question.id] ?? (question.type === "CHECKBOXES" ? [] : "")}
          error={errors[question.id]}
          onChange={(value) => {
            setAnswers((current) => ({ ...current, [question.id]: value }));
            setErrors((current) => {
              const next = { ...current };
              delete next[question.id];
              return next;
            });
          }}
        />
      ))}

      <div className="flex justify-end">
        <Button
          type="button"
          className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
          disabled={submitMutation.isPending}
          onClick={() => void handleSubmit()}
        >
          {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitMutation.isPending ? t("forms.submitting") : t("forms.submit")}
        </Button>
      </div>
    </div>
  );
};

export default PublicFormPage;
