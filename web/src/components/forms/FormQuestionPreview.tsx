import { FormFillField } from "@/components/forms/FormFillField";
import type { FormAnswers, FormQuestion } from "@/lib/formTypes";
import { useT } from "@/i18n";

type Props = {
  question: FormQuestion;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  error?: string | null;
  readOnly?: boolean;
};

export const FormQuestionPreview = ({ question, value, onChange, error, readOnly }: Props) => {
  const { t } = useT();

  return (
    <article className="rounded-xl border border-border/70 bg-card p-5 shadow-soft">
      <p className="text-base font-medium">
        {question.title.trim() || t("forms.untitledQuestion")}
        {question.required && <span className="ml-1 text-destructive">*</span>}
      </p>
      {question.description && (
        <p className="mt-1 text-sm text-muted-foreground">{question.description}</p>
      )}
      <div className="mt-4">
        <FormFillField
          question={question}
          value={value}
          onChange={onChange ?? (() => undefined)}
          error={error}
          disabled={readOnly}
        />
      </div>
    </article>
  );
};
