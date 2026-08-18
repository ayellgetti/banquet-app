import { Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FORM_QUESTION_TYPES,
  createLocalQuestion,
  isChoiceQuestionType,
  type FormQuestion,
  type FormQuestionType,
} from "@/lib/formTypes";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  question: FormQuestion;
  selected: boolean;
  onSelect: () => void;
  onChange: (question: FormQuestion) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export const FormQuestionEditor = ({ question, selected, onSelect, onChange, onDuplicate, onDelete }: Props) => {
  const { t } = useT();
  const choice = isChoiceQuestionType(question.type);

  const update = (patch: Partial<FormQuestion>) => onChange({ ...question, ...patch });

  const handleTypeChange = (type: FormQuestionType) => {
    const nextOptions = isChoiceQuestionType(type)
      ? question.options.length > 0
        ? question.options
        : createLocalQuestion(type).options
      : [];
    update({ type, options: nextOptions });
  };

  return (
    <article
      onClick={onSelect}
      className={cn(
        "rounded-xl border bg-card p-5 shadow-soft transition-colors",
        selected ? "border-primary ring-1 ring-primary/30" : "border-border/70",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          value={question.title}
          placeholder={t("forms.question.ph")}
          onChange={(event) => update({ title: event.target.value })}
          onFocus={onSelect}
          className="text-base"
        />
        <Select value={question.type} onValueChange={(value) => handleTypeChange(value as FormQuestionType)}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORM_QUESTION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`forms.type.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Textarea
        value={question.description ?? ""}
        placeholder={t("forms.questionDesc.ph")}
        rows={2}
        onChange={(event) => update({ description: event.target.value || null })}
        onFocus={onSelect}
        className="mt-3"
      />

      {choice && (
        <div className="mt-4 space-y-2">
          {question.options.map((option, index) => (
            <div key={`${question.id}-opt-${index}`} className="flex items-center gap-2">
              <span className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/40" />
              <Input
                value={option}
                placeholder={t("forms.option.ph").replace("{n}", String(index + 1))}
                onChange={(event) => {
                  const options = [...question.options];
                  options[index] = event.target.value;
                  update({ options });
                }}
              />
              {question.options.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => update({ options: question.options.filter((_, i) => i !== index) })}
                  aria-label={t("forms.removeOption")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 text-primary"
            onClick={() => update({ options: [...question.options, `Option ${question.options.length + 1}`] })}
          >
            <Plus className="h-4 w-4" />
            {t("forms.addOption")}
          </Button>
        </div>
      )}

      {!choice && (
        <p className="mt-4 border-b border-dashed border-border pb-2 text-sm text-muted-foreground">
          {question.type === "PARAGRAPH" ? t("forms.longAnswer") : t("forms.shortAnswer")}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-border/60 pt-4">
        <Button type="button" variant="ghost" size="icon" onClick={onDuplicate} aria-label={t("forms.duplicate")}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onDelete} aria-label={t("forms.deleteQuestion")}>
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Label htmlFor={`${question.id}-required`} className="text-xs uppercase tracking-wide">
            {t("forms.required")}
          </Label>
          <Switch
            id={`${question.id}-required`}
            checked={question.required}
            onCheckedChange={(required) => update({ required })}
          />
        </div>
      </div>
    </article>
  );
};
