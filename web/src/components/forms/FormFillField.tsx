import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormAnswers, FormQuestion } from "@/lib/formTypes";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  question: FormQuestion;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string | null;
  disabled?: boolean;
};

export const FormFillField = ({ question, value, onChange, error, disabled }: Props) => {
  const { t } = useT();
  const stringValue = Array.isArray(value) ? "" : (value ?? "");
  const listValue = Array.isArray(value) ? value : [];
  const options = question.options.filter((option) => option.trim().length > 0);

  return (
    <div className="space-y-3">
      {question.type === "SHORT_ANSWER" && (
        <Input
          value={stringValue}
          disabled={disabled}
          placeholder={t("forms.answer.ph")}
          onChange={(event) => onChange(event.target.value)}
          className={cn("max-w-md", error && "border-destructive")}
        />
      )}

      {question.type === "PARAGRAPH" && (
        <Textarea
          value={stringValue}
          disabled={disabled}
          placeholder={t("forms.answer.ph")}
          rows={4}
          onChange={(event) => onChange(event.target.value)}
          className={error ? "border-destructive" : ""}
        />
      )}

      {question.type === "DATE" && (
        <Input
          type="date"
          value={stringValue}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={cn("max-w-xs", error && "border-destructive")}
        />
      )}

      {question.type === "TIME" && (
        <Input
          type="time"
          value={stringValue}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={cn("max-w-xs", error && "border-destructive")}
        />
      )}

      {question.type === "MULTIPLE_CHOICE" && (
        <RadioGroup
          value={stringValue}
          onValueChange={onChange}
          disabled={disabled}
          className="gap-2"
        >
          {options.map((option) => (
            <div key={option} className="flex items-center gap-2">
              <RadioGroupItem value={option} id={`${question.id}-${option}`} disabled={disabled} />
              <Label htmlFor={`${question.id}-${option}`} className="font-normal">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {question.type === "CHECKBOXES" && (
        <div className="space-y-2">
          {options.map((option) => {
            const checked = listValue.includes(option);
            return (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={(next) => {
                    if (next === true) onChange([...listValue, option]);
                    else onChange(listValue.filter((item) => item !== option));
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`} className="font-normal">
                  {option}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {question.type === "DROPDOWN" && (
        <Select value={stringValue || undefined} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className={cn("max-w-md", error && "border-destructive")}>
            <SelectValue placeholder={t("forms.choose")} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
