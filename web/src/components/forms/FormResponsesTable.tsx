import { format, parseISO } from "date-fns";
import { formatAnswer, type FormDetail, type FormResponseItem } from "@/lib/formTypes";
import { useT } from "@/i18n";

type Props = {
  form: FormDetail;
  responses: FormResponseItem[];
};

export const FormResponsesTable = ({ form, responses }: Props) => {
  const { t } = useT();

  if (responses.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("forms.responsesEmpty")}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-soft">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border/70 bg-muted/40">
          <tr>
            <th className="px-4 py-3 font-semibold">{t("forms.submittedAt")}</th>
            {form.questions.map((question) => (
              <th key={question.id} className="px-4 py-3 font-semibold">
                {question.title.trim() || t("forms.untitledQuestion")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {responses.map((response) => (
            <tr key={response.id} className="border-b border-border/50 last:border-0">
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {format(parseISO(response.submittedAt), "MMM d, yyyy · h:mm a")}
              </td>
              {form.questions.map((question) => (
                <td key={question.id} className="max-w-xs truncate px-4 py-3">
                  {formatAnswer(response.answers[question.id]) || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
