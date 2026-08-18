import { useMemo, useState } from "react";
import { FollowUpBoardCard } from "@/components/follow-up/FollowUpBoardCard";
import type { FollowUpEnquiryRecord } from "@/data/banquetData";
import { useWorkspaceQuery } from "@/hooks/useWorkspace";
import {
  FOLLOW_UP_BOARD_STATUSES,
  OPEN_PIPELINE_STATUSES,
  PIPELINE_COLUMN_ACCENT,
  boardStatusFor,
  isOpenEnquiryStatus,
  type FollowUpBoardStatus,
} from "@/lib/enquiryPipeline";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  enquiries: FollowUpEnquiryRecord[];
  onView: (enquiry: FollowUpEnquiryRecord) => void;
  onEdit: (enquiry: FollowUpEnquiryRecord) => void;
  onMove: (enquiry: FollowUpEnquiryRecord, status: FollowUpBoardStatus) => void;
  onConvert: (enquiry: FollowUpEnquiryRecord) => void;
  movingId?: string | null;
};

function leadsForColumn(enquiries: FollowUpEnquiryRecord[], status: FollowUpBoardStatus) {
  return enquiries.filter((enquiry) => boardStatusFor(enquiry.status) === status);
}

export const FollowUpBoard = ({ enquiries, onView, onEdit, onMove, onConvert, movingId }: Props) => {
  const { t } = useT();
  const { data: workspace } = useWorkspaceQuery();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<FollowUpBoardStatus | null>(null);

  const boardStatuses = useMemo(() => {
    const stages = workspace?.followUpStages ?? [];
    if (stages.length === 0) return [...FOLLOW_UP_BOARD_STATUSES];
    return stages
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((stage) => stage.key as FollowUpBoardStatus);
  }, [workspace]);

  const stageLabel = (status: FollowUpBoardStatus) => {
    const fromWorkspace = workspace?.followUpStages.find((stage) => stage.key === status)?.label;
    return fromWorkspace ?? t(`enquiries.status.${status}`);
  };

  const firstOpen =
    boardStatuses.find((status) => {
      const kind = workspace?.followUpStages.find((stage) => stage.key === status)?.kind;
      return kind === "open" || (OPEN_PIPELINE_STATUSES as readonly string[]).includes(status);
    }) ?? boardStatuses[0];

  const firstConvert =
    boardStatuses.find((status) => {
      const kind = workspace?.followUpStages.find((stage) => stage.key === status)?.kind;
      return kind === "convert" || status === "booked";
    }) ?? "booked";

  const dragging = enquiries.find((enquiry) => enquiry.id === draggingId) ?? null;

  const handleDrop = (status: FollowUpBoardStatus) => {
    const enquiry = dragging;
    setOverStatus(null);
    setDraggingId(null);
    if (!enquiry || boardStatusFor(enquiry.status) === status) return;
    if (!isOpenEnquiryStatus(enquiry.status) || enquiry.bookingId) return;

    if (status === "booked") {
      onConvert(enquiry);
      return;
    }

    onMove(enquiry, status);
  };

  return (
    <div className="overflow-x-auto pb-2 scrollbar-subtle">
      <div className="flex min-w-max items-start gap-3">
        {boardStatuses.map((status) => {
          const leads = leadsForColumn(enquiries, status);
          const isFirstOutcome = status === firstConvert;

          return (
            <section
              key={status}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverStatus(status);
              }}
              onDragLeave={() => {
                setOverStatus((current) => (current === status ? null : current));
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(status);
              }}
              className={cn(
                "flex w-64 shrink-0 flex-col rounded-xl border border-border/70 bg-muted/30",
                isFirstOutcome && "ml-2 border-dashed",
                overStatus === status && "border-primary/50 bg-primary/5",
              )}
            >
              <header className="sticky top-0 z-10 rounded-t-xl bg-muted/40 px-3 pb-3 pt-3 backdrop-blur-sm">
                {isFirstOutcome && (
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("followUp.outcome")}
                  </p>
                )}
                {!isFirstOutcome && status === firstOpen && (
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t("followUp.pipeline")}
                  </p>
                )}
                <div
                  className={cn(
                    "mb-2 h-1 rounded-full",
                    PIPELINE_COLUMN_ACCENT[status] ?? "bg-muted-foreground",
                  )}
                />
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
                    {stageLabel(status)}
                  </h2>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {leads.length}
                  </span>
                </div>
              </header>

              <div className="flex max-h-[min(70vh,44rem)] min-h-[12rem] flex-col gap-2 overflow-y-auto px-2 pb-3 scrollbar-subtle">
                {leads.length === 0 ? (
                  <p className="px-1 py-8 text-center text-xs text-muted-foreground">
                    {t("followUp.columnEmpty")}
                  </p>
                ) : (
                  leads.map((enquiry) => (
                    <div
                      key={enquiry.id}
                      className={cn(movingId === enquiry.id && "pointer-events-none opacity-50")}
                    >
                      <FollowUpBoardCard
                        enquiry={enquiry}
                        onView={onView}
                        onEdit={onEdit}
                        onDragStart={(item) => setDraggingId(item.id)}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setOverStatus(null);
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
