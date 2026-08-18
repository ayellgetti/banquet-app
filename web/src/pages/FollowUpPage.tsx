import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { QuickBookingModal } from "@/components/bookings/QuickBookingModal";
import { FollowUpBoard } from "@/components/follow-up/FollowUpBoard";
import { FollowUpCard } from "@/components/follow-up/FollowUpCard";
import { FollowUpModal } from "@/components/follow-up/FollowUpModal";
import { FollowUpViewModal } from "@/components/follow-up/FollowUpViewModal";
import { FollowUpTable } from "@/components/follow-up/FollowUpTable";
import { DataLoadingState } from "@/components/common/DataLoadingState";
import { ListSearchEmpty } from "@/components/common/ListSearchEmpty";
import { ListSearchInput } from "@/components/common/ListSearchInput";
import { ListPagination } from "@/components/common/ListPagination";
import { ListViewGrid } from "@/components/common/ListViewGrid";
import { ViewModeToggle } from "@/components/common/ViewModeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFollowUpStats, type FollowUpEnquiryRecord } from "@/data/banquetData";
import { useFollowUpEnquiriesQuery, useLogFollowUpMutation } from "@/hooks/useBanquetData";
import { useListViewMode } from "@/hooks/useListViewMode";
import { useListPagination } from "@/hooks/useListPagination";
import { isClosingOutcomeStatus, isOpenEnquiryStatus, type FollowUpBoardStatus } from "@/lib/enquiryPipeline";
import { useT } from "@/i18n";
import { matchesListSearch } from "@/lib/listSearch";
import { LIST_PAGE_SIZE } from "@/lib/pagination";
import { toast } from "sonner";

const FollowUpPage = () => {
  const { t } = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: enquiries, isLoading, isError } = useFollowUpEnquiriesQuery();
  const logMutation = useLogFollowUpMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [activeEnquiry, setActiveEnquiry] = useState<FollowUpEnquiryRecord | null>(null);
  const [viewEnquiry, setViewEnquiry] = useState<FollowUpEnquiryRecord | null>(null);
  const [convertEnquiryId, setConvertEnquiryId] = useState<string | undefined>();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useListViewMode("follow-up", "board");

  const paramId = searchParams.get("enquiryId");
  const openEnquiries = useMemo(
    () => (enquiries ?? []).filter((enquiry) => isOpenEnquiryStatus(enquiry.status) && !enquiry.bookingId),
    [enquiries],
  );

  const filtered = useMemo(() => {
    if (!enquiries) return [];
    return enquiries.filter((enquiry) =>
      matchesListSearch(
        search,
        enquiry.clientName,
        enquiry.email,
        enquiry.phone,
        enquiry.eventType,
        enquiry.note,
        enquiry.status,
      ),
    );
  }, [enquiries, search]);

  const pagination = useListPagination(filtered, {
    pageSize: view === "grid" ? LIST_PAGE_SIZE.card : LIST_PAGE_SIZE.table,
    resetKey: `${search}|${view}`,
  });

  const stats = useMemo(
    () => (enquiries ? getFollowUpStats(enquiries) : { open: 0, dueThisWeek: 0, overdue: 0 }),
    [enquiries],
  );

  useEffect(() => {
    if (paramId && enquiries) {
      const match = enquiries.find((e) => e.id === paramId);
      if (match) {
        if (!isOpenEnquiryStatus(match.status) || match.bookingId) {
          setViewEnquiry(match);
          setViewOpen(true);
          return;
        }
        setActiveEnquiry(match);
        setModalOpen(true);
      }
    }
  }, [paramId, enquiries]);

  const openLogFollowUp = () => {
    setActiveEnquiry(null);
    setModalOpen(true);
    setSearchParams({}, { replace: true });
  };

  const openEnquiry = (enquiry: FollowUpEnquiryRecord) => {
    if (!isOpenEnquiryStatus(enquiry.status) || enquiry.bookingId) {
      setViewEnquiry(enquiry);
      setViewOpen(true);
      return;
    }
    setActiveEnquiry(enquiry);
    setModalOpen(true);
    setSearchParams({ enquiryId: enquiry.id }, { replace: true });
  };

  const openViewEnquiry = (enquiry: FollowUpEnquiryRecord) => {
    setViewEnquiry(enquiry);
    setViewOpen(true);
  };

  const handleViewOpenChange = (open: boolean) => {
    setViewOpen(open);
    if (!open) setViewEnquiry(null);
  };

  const handleModalChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setActiveEnquiry(null);
      setSearchParams({}, { replace: true });
    }
  };

  const handleConvert = (enquiry: FollowUpEnquiryRecord) => {
    setConvertEnquiryId(enquiry.id);
    setBookingOpen(true);
  };

  const handleBookingOpenChange = (open: boolean) => {
    setBookingOpen(open);
    if (!open) setConvertEnquiryId(undefined);
  };

  const handleMove = async (enquiry: FollowUpEnquiryRecord, status: FollowUpBoardStatus) => {
    if (status === "booked" || status === enquiry.status) return;

    try {
      const statusLabel = t(`enquiries.status.${status}`);
      await logMutation.mutateAsync({
        enquiryId: enquiry.id,
        status,
        nextFollowUpDate: isClosingOutcomeStatus(status) ? undefined : enquiry.nextFollowUpDate,
        comment: isClosingOutcomeStatus(status)
          ? t("followUp.closedAs").replace("{status}", statusLabel)
          : t("followUp.movedComment").replace("{status}", statusLabel),
      });
      toast.success(t("followUp.moved").replace("{status}", statusLabel));
    } catch {
      toast.error(t("followUp.saveFailed"));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <DataLoadingState label={t("followUp.loading")} className="min-h-[24rem]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t("followUp.error")}
      </div>
    );
  }

  return (
    <>
      <div className={view === "board" ? "space-y-5" : "mx-auto max-w-7xl space-y-5"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {t("followUp.section")}
            </p>
            {view === "board" && (
              <p className="mt-1 text-xs text-muted-foreground">{t("followUp.dragHint")}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <ViewModeToggle
              value={view}
              onChange={setView}
              modes={["board", "list", "grid"]}
            />
            <ListSearchInput value={search} onChange={setSearch} placeholder={t("followUp.search")} />
            <Button
              type="button"
              size="sm"
              className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              onClick={openLogFollowUp}
              disabled={!openEnquiries.length}
            >
              <Plus className="h-4 w-4" />
              {t("followUp.recordFollowUp")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-xl border-border/70 shadow-soft">
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("followUp.stat.open")}
              </p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">{stats.open}</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-border/70 shadow-soft">
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("followUp.stat.dueWeek")}
              </p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">{stats.dueThisWeek}</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-border/70 shadow-soft">
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("followUp.stat.overdue")}
              </p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight text-destructive">{stats.overdue}</p>
            </CardContent>
          </Card>
        </div>

        {enquiries &&
          (filtered.length === 0 ? (
            <ListSearchEmpty />
          ) : view === "board" ? (
            <FollowUpBoard
              enquiries={filtered}
              onView={openViewEnquiry}
              onEdit={openEnquiry}
              onMove={(enquiry, status) => void handleMove(enquiry, status)}
              onConvert={handleConvert}
              movingId={logMutation.isPending ? logMutation.variables?.enquiryId : null}
            />
          ) : (
            <div className="space-y-4">
              {view === "grid" ? (
                <ListViewGrid>
                  {pagination.items.map((enquiry) => (
                    <FollowUpCard
                      key={enquiry.id}
                      enquiry={enquiry}
                      onView={openViewEnquiry}
                      onEdit={openEnquiry}
                    />
                  ))}
                </ListViewGrid>
              ) : (
                <FollowUpTable
                  enquiries={pagination.items}
                  onView={openViewEnquiry}
                  onEdit={openEnquiry}
                />
              )}
              <ListPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                pageSize={pagination.pageSize}
                onPageChange={pagination.setPage}
              />
            </div>
          ))}
      </div>

      <FollowUpViewModal open={viewOpen} onOpenChange={handleViewOpenChange} enquiry={viewEnquiry} />

      <FollowUpModal
        open={modalOpen}
        onOpenChange={handleModalChange}
        enquiries={openEnquiries}
        enquiry={activeEnquiry}
        onConvert={handleConvert}
      />

      <QuickBookingModal
        open={bookingOpen}
        onOpenChange={handleBookingOpenChange}
        initialEnquiryId={convertEnquiryId}
      />
    </>
  );
};

export default FollowUpPage;
