import { Eye, Pencil } from "lucide-react";
import { LeadPipelineTrack } from "@/components/follow-up/LeadPipelineTrack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFollowUpUrgency, type FollowUpEnquiryRecord } from "@/data/banquetData";
import { isOpenEnquiryStatus } from "@/lib/enquiryPipeline";
import { formatFollowUpDateTime } from "@/lib/followUpDateTime";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  enquiry: FollowUpEnquiryRecord;
  onView: (enquiry: FollowUpEnquiryRecord) => void;
  onEdit: (enquiry: FollowUpEnquiryRecord) => void;
  onDragStart?: (enquiry: FollowUpEnquiryRecord) => void;
  onDragEnd?: () => void;
};

export const FollowUpBoardCard = ({ enquiry, onView, onEdit, onDragStart, onDragEnd }: Props) => {
  const { t } = useT();
  const urgency = getFollowUpUrgency(enquiry.nextFollowUpDate);
  const canMove = isOpenEnquiryStatus(enquiry.status) && !enquiry.bookingId;

  return (
    <article
      draggable={canMove}
      onDragStart={(event) => {
        if (!canMove) return;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", enquiry.id);
        onDragStart?.(enquiry);
      }}
      onDragEnd={() => onDragEnd?.()}
      className={cn(
        "rounded-lg border border-border/70 bg-card p-3 shadow-soft transition-colors",
        canMove && "cursor-grab active:cursor-grabbing hover:border-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate font-medium leading-snug text-foreground">{enquiry.clientName}</h3>
        <div className="flex shrink-0 gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={t("followUp.view")}
            onClick={() => onView(enquiry)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {canMove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label={t("followUp.edit")}
              onClick={() => onEdit(enquiry)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">{enquiry.eventType}</p>

      <div className="mt-3">
        <LeadPipelineTrack status={enquiry.status} orientation="horizontal" compact />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {urgency === "overdue" && (
          <Badge
            variant="outline"
            className="border-destructive/25 bg-destructive/10 text-[10px] font-semibold text-destructive"
          >
            {t("followUp.urgency.overdue")}
          </Badge>
        )}
        {urgency === "due" && (
          <Badge
            variant="outline"
            className="border-amber-500/25 bg-amber-500/10 text-[10px] font-semibold text-amber-800"
          >
            {t("followUp.urgency.due")}
          </Badge>
        )}
        {enquiry.nextFollowUpDate && (
          <span className="text-[11px] text-muted-foreground">
            {formatFollowUpDateTime(enquiry.nextFollowUpDate)}
          </span>
        )}
      </div>
    </article>
  );
};
