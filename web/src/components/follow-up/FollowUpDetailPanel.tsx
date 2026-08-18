import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FollowUpHistoryList } from "@/components/follow-up/FollowUpHistoryList";
import { LeadPipelineTrack } from "@/components/follow-up/LeadPipelineTrack";
import {
  formatEnquiryBudget,
  type EnquiryStatus,
  type FollowUpEnquiryRecord,
} from "@/data/banquetData";
import { useFollowUpHistoryQuery, useLogFollowUpMutation } from "@/hooks/useBanquetData";
import { getMinEventDateISO, validateEventDate } from "@/lib/eventDateValidation";
import {
  combineFollowUpDateTime,
  splitFollowUpDateTime,
} from "@/lib/followUpDateTime";
import { useWorkspaceQuery } from "@/hooks/useWorkspace";
import {
  ENQUIRY_STATUS_CLASS,
  LEAD_OUTCOME_STATUSES,
  OPEN_PIPELINE_STATUSES,
  isClosingOutcomeStatus,
  selectableEnquiryStatus,
} from "@/lib/enquiryPipeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";
import { toast } from "sonner";

type Props = {
  enquiry: FollowUpEnquiryRecord;
  compact?: boolean;
  onSaved?: () => void;
  onConvert?: (enquiry: FollowUpEnquiryRecord) => void;
};

export const FollowUpDetailPanel = ({ enquiry, compact, onSaved, onConvert }: Props) => {
  const { t } = useT();
  const { data: workspace } = useWorkspaceQuery();
  const { data: history, isLoading: historyLoading } = useFollowUpHistoryQuery(enquiry.id);
  const logMutation = useLogFollowUpMutation();

  const stageLabel = (value: EnquiryStatus) =>
    workspace?.followUpStages.find((stage) => stage.key === value)?.label ??
    t(`enquiries.status.${value}`);

  const initialSchedule = splitFollowUpDateTime(enquiry.nextFollowUpDate);
  const [status, setStatus] = useState<EnquiryStatus>(() => selectableEnquiryStatus(enquiry.status));
  const [comment, setComment] = useState("");
  const [nextDate, setNextDate] = useState(initialSchedule.date);
  const [nextTime, setNextTime] = useState(initialSchedule.time);
  const [touched, setTouched] = useState(false);
  const minDate = getMinEventDateISO();

  useEffect(() => {
    const schedule = splitFollowUpDateTime(enquiry.nextFollowUpDate);
    setStatus(selectableEnquiryStatus(enquiry.status));
    setNextDate(schedule.date);
    setNextTime(schedule.time);
    setComment("");
    setTouched(false);
  }, [enquiry.id, enquiry.status, enquiry.nextFollowUpDate]);

  const commentError = touched && !comment.trim() ? t("followUp.validate.comment") : null;
  const closingOutcome = isClosingOutcomeStatus(status);
  const dateError = touched && nextDate && !closingOutcome ? validateEventDate(nextDate, t) : null;

  const handleSubmit = async () => {
    setTouched(true);
    if (!comment.trim()) {
      toast.error(t("followUp.validate.comment"));
      return;
    }
    if (!closingOutcome && nextDate && validateEventDate(nextDate, t)) {
      toast.error(t("toast.fixErrors"));
      return;
    }

    try {
      if (status === "booked") {
        await logMutation.mutateAsync({
          enquiryId: enquiry.id,
          comment: comment.trim(),
          status: enquiry.status,
          nextFollowUpDate: nextDate ? combineFollowUpDateTime(nextDate, nextTime) : undefined,
        });
        toast.success(t("followUp.saved"));
        setComment("");
        setTouched(false);
        onSaved?.();
        onConvert?.(enquiry);
        return;
      }

      await logMutation.mutateAsync({
        enquiryId: enquiry.id,
        comment: comment.trim(),
        status,
        nextFollowUpDate: closingOutcome
          ? undefined
          : nextDate
            ? combineFollowUpDateTime(nextDate, nextTime)
            : undefined,
      });
      toast.success(t("followUp.saved"));
      setComment("");
      setTouched(false);
      onSaved?.();
    } catch {
      toast.error(t("followUp.saveFailed"));
    }
  };

  return (
    <div className="space-y-6">
      {!compact && (
        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold">{enquiry.clientName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{enquiry.email}</p>
              {enquiry.phone && <p className="text-sm text-muted-foreground">{enquiry.phone}</p>}
            </div>
            <Badge variant="outline" className={cn(ENQUIRY_STATUS_CLASS[enquiry.status])}>
              {t(`enquiries.status.${enquiry.status}`)}
            </Badge>
          </div>

          <div className="mt-5 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("followUp.section")}
            </p>
            <LeadPipelineTrack status={enquiry.status} orientation="horizontal" />
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("enquiries.col.event")}
              </dt>
              <dd className="mt-1 text-sm font-medium">{enquiry.eventType}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("enquiries.col.preferredDate")}
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {format(parseISO(enquiry.preferredDate), "MMM d, yyyy")}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("enquiries.col.guests")}
              </dt>
              <dd className="mt-1 text-sm font-medium">{enquiry.guests}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("enquiries.col.budget")}
              </dt>
              <dd className="mt-1 text-sm font-medium">{formatEnquiryBudget(enquiry.budget)}</dd>
            </div>
          </dl>

          {enquiry.note && (
            <p className="mt-4 rounded-lg bg-muted/40 px-3 py-2 text-sm italic text-muted-foreground">{enquiry.note}</p>
          )}
        </div>
      )}

      {compact && (
        <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("followUp.section")}
          </p>
          <LeadPipelineTrack status={enquiry.status} orientation="horizontal" />
        </div>
      )}

      {compact && (
        <dl className="grid gap-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.preferredDate")}
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{format(parseISO(enquiry.preferredDate), "MMM d, yyyy")}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.guests")}
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{enquiry.guests}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("enquiries.col.budget")}
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{formatEnquiryBudget(enquiry.budget)}</dd>
          </div>
        </dl>
      )}

      <div className={cn(!compact && "rounded-xl border border-border/70 bg-card p-5 shadow-soft")}>
        <h3 className="font-display text-lg font-semibold">{t("followUp.logTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("followUp.logDesc")}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("followUp.updateStatus")}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as EnquiryStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t("followUp.pipeline")}</SelectLabel>
                  {OPEN_PIPELINE_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {stageLabel(value)}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>{t("followUp.outcome")}</SelectLabel>
                  {LEAD_OUTCOME_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {stageLabel(value)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fu-next-date">{t("followUp.nextDate")}</Label>
            <Input
              id="fu-next-date"
              type="date"
              min={minDate}
              value={closingOutcome ? "" : nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              disabled={closingOutcome}
              aria-invalid={!!dateError}
              className={dateError ? "border-destructive" : ""}
            />
            {dateError && <p className="text-xs text-destructive">{dateError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fu-next-time">{t("followUp.nextTime")}</Label>
            <Input
              id="fu-next-time"
              type="time"
              value={nextTime}
              onChange={(e) => setNextTime(e.target.value)}
              disabled={closingOutcome || !nextDate}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fu-comment">{t("followUp.comment")}</Label>
            <Textarea
              id="fu-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("followUp.comment.ph")}
              rows={4}
              aria-invalid={!!commentError}
              className={commentError ? "border-destructive" : ""}
            />
            {commentError && <p className="text-xs text-destructive">{commentError}</p>}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            disabled={logMutation.isPending}
            onClick={() => void handleSubmit()}
          >
            {logMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {logMutation.isPending ? t("followUp.saving") : t("followUp.save")}
          </Button>
        </div>
      </div>

      <div className={cn(!compact && "rounded-xl border border-border/70 bg-card p-5 shadow-soft")}>
        <h3 className="font-display text-lg font-semibold">{t("followUp.history")}</h3>
        {historyLoading && <p className="mt-3 text-sm text-muted-foreground">{t("common.loading")}</p>}
        {!historyLoading && (!history || history.length === 0) && (
          <p className="mt-3 text-sm text-muted-foreground">{t("followUp.historyEmpty")}</p>
        )}
        {!historyLoading && history && history.length > 0 && (
          <FollowUpHistoryList entries={history} />
        )}
      </div>
    </div>
  );
};
