import {
  LEAD_PIPELINE_STATUSES,
  isClosingOutcomeStatus,
  pipelineIndex,
  type LeadPipelineStatus,
} from "@/lib/enquiryPipeline";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";
import type { EnquiryStatus } from "@/data/banquetData";

type Props = {
  status: EnquiryStatus;
  orientation?: "vertical" | "horizontal";
  compact?: boolean;
  className?: string;
};

function StageNode({
  reached,
  current,
  compact,
}: {
  reached: boolean;
  current: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative z-10 shrink-0 rounded-full border-2",
        compact ? "h-2.5 w-2.5" : "h-4 w-4",
        current && "border-primary bg-primary shadow-gold",
        reached && !current && "border-primary bg-primary",
        !reached && "border-border bg-background",
      )}
    />
  );
}

export const LeadPipelineTrack = ({
  status,
  orientation = "horizontal",
  compact = false,
  className,
}: Props) => {
  const { t } = useT();
  const currentIndex = pipelineIndex(status);
  const closedOutcome = isClosingOutcomeStatus(status);
  const displayStatus = status === "lost" ? "not_interested" : status;

  const labelFor = (stage: LeadPipelineStatus) => t(`enquiries.status.${stage}`);

  const verticalTrack = (
    <ol className={cn("space-y-0", className)} aria-label={t("followUp.pipeline")}>
      {LEAD_PIPELINE_STATUSES.map((stage, index) => {
        const reached = currentIndex >= 0 && index <= currentIndex;
        const current = stage === status;
        const isLast = index === LEAD_PIPELINE_STATUSES.length - 1;

        return (
          <li key={stage} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  "absolute left-[7px] top-4 h-[calc(100%-8px)] w-px",
                  reached && index < currentIndex ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <StageNode reached={reached} current={current} />
            <p
              className={cn(
                "text-sm leading-5",
                current && "font-semibold text-foreground",
                reached && !current && "text-foreground",
                !reached && "text-muted-foreground",
              )}
            >
              {labelFor(stage)}
            </p>
          </li>
        );
      })}
    </ol>
  );

  const horizontalTrack = (
    <div className={cn("space-y-3", className)}>
      {closedOutcome && !compact && (
        <p className="text-center text-sm font-semibold text-foreground">
          {t("followUp.closedAs").replace("{status}", t(`enquiries.status.${displayStatus}`))}
        </p>
      )}
      <ol className="flex w-full min-w-0" aria-label={t("followUp.pipeline")}>
      {LEAD_PIPELINE_STATUSES.map((stage, index) => {
        const reached = currentIndex >= 0 && index <= currentIndex;
        const current = stage === status;
        const isLast = index === LEAD_PIPELINE_STATUSES.length - 1;
        const incomingGold = index > 0 && reached;
        const outgoingGold = !isLast && index < currentIndex;

        return (
          <li key={stage} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span className={cn("h-px flex-1", index === 0 ? "bg-transparent" : incomingGold ? "bg-primary" : "bg-border")} />
              <StageNode reached={reached} current={current} compact={compact} />
              <span className={cn("h-px flex-1", isLast ? "bg-transparent" : outgoingGold ? "bg-primary" : "bg-border")} />
            </div>
            {!compact && (
              <p
                className={cn(
                  "mt-2 max-w-[6.5rem] text-center text-[11px] leading-tight",
                  current && "font-semibold text-foreground",
                  reached && !current && "text-foreground",
                  !reached && "text-muted-foreground",
                )}
              >
                {labelFor(stage)}
              </p>
            )}
          </li>
        );
      })}
      </ol>
    </div>
  );

  if (orientation === "vertical") return verticalTrack;
  return horizontalTrack;
};
