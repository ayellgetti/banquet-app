import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FormFillField } from "@/components/forms/FormFillField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EnquiryRecord } from "@/data/banquetData";
import { DecorationMultiSelect } from "@/components/enquiry/DecorationMultiSelect";
import {
  APPROX_BUDGET_RANGES,
  DECOR_OPTIONS,
  EVENT_TYPES,
  PACKAGES,
  PLATE_PACKAGES,
  SOURCES,
  VENUE_OPTIONS,
  getDefaultVenueId,
} from "@/data/enquiryOptions";
import { type EnquiryLeadPayload } from "@/lib/enquiryApi";
import { fetchEnquiryFormValues, updateEnquiryFromQuickForm } from "@/lib/enquiriesApi";
import { banquetQueryKeys } from "@/lib/banquetApi";
import { createLeadViaCrm } from "@/lib/leadApi";
import { submitQuickEnquiryDualWrite } from "@/lib/leadSubmitService";
import {
  getMinEventDateISO,
  sanitizeEventDate,
  validateEventDate,
} from "@/lib/eventDateValidation";
import { useCustomersQuery } from "@/hooks/useBanquetData";
import { useWorkspaceQuery } from "@/hooks/useWorkspace";
import { splitCustomerName } from "@/lib/mappers/enquiryMapper";
import type { FormAnswers, FormQuestion } from "@/lib/formTypes";
import type { EnquiryEditContext } from "@/lib/enquiryEditMapper";
import { useT } from "@/i18n";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type QuickEnquiryFormValues = {
  customerName: string;
  phone: string;
  eventType: string;
  eventDate: string;
  timeSlotId: string;
  guestCount: number;
  venueId: string;
  source: string;
  approxBudget: string;
  menuPackageId: string;
  decorationIds: string[];
};

const emptyForm = (defaultDate?: string): QuickEnquiryFormValues => ({
  customerName: "",
  phone: "",
  eventType: "",
  eventDate: sanitizeEventDate(defaultDate),
  timeSlotId: "",
  guestCount: 100,
  venueId: getDefaultVenueId(),
  source: "",
  approxBudget: "",
  menuPackageId: "",
  decorationIds: [],
});

const Req = () => (
  <span aria-hidden="true" className="ml-0.5 text-destructive">
    *
  </span>
);

const NAME_RE = /^[\p{L}\p{M}\s.\-']+$/u;

type ContactMode = "existing" | "new";

type Props = {
  enquiry?: EnquiryRecord | null;
  defaultDate?: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
};

export const QuickEnquiryForm = ({ enquiry, defaultDate, onSubmitted, onCancel }: Props) => {
  const { t } = useT();
  const queryClient = useQueryClient();
  const isEdit = Boolean(enquiry);
  const { data: workspace, isLoading: workspaceLoading } = useWorkspaceQuery();
  const { data: customers = [], isLoading: customersLoading } = useCustomersQuery();

  const [contactMode, setContactMode] = useState<ContactMode>("new");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [form, setForm] = useState<QuickEnquiryFormValues>(() => emptyForm(defaultDate));
  const [editContext, setEditContext] = useState<EnquiryEditContext | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const enquiryQuestions = useMemo<FormQuestion[]>(() => {
    return (workspace?.enquiryForm?.questions ?? []).map((question) => ({
      id: question.id,
      sortOrder: question.sortOrder,
      type: question.type,
      title: question.title,
      description: question.description,
      required: question.required,
      options: question.options,
      fieldKey: question.fieldKey,
    }));
  }, [workspace]);

  const useDynamicForm = !isEdit && enquiryQuestions.length > 0;

  useEffect(() => {
    if (!enquiry) {
      setForm(emptyForm(defaultDate));
      setEditContext(null);
      setTouched(false);
      setContactMode("new");
      setCustomerId("");
      setCustomerName("");
      setPhone("");
      setAnswers({});
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoadingEdit(true);
      try {
        const { values, context } = await fetchEnquiryFormValues(enquiry.id);
        if (!cancelled) {
          setForm(values);
          setEditContext(context);
          setTouched(false);
        }
      } catch {
        if (!cancelled) {
          toast.error(t("enquiries.error"));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingEdit(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enquiry, defaultDate, t]);

  useEffect(() => {
    if (!enquiry && defaultDate) {
      setForm((current) => ({ ...current, eventDate: sanitizeEventDate(defaultDate) }));
    }
  }, [defaultDate, enquiry]);

  const selectedCustomer = customers.find((customer) => customer.id === customerId);

  useEffect(() => {
    if (contactMode !== "existing" || !selectedCustomer) return;
    setCustomerName(selectedCustomer.name);
    setPhone(selectedCustomer.phone.replace(/\D/g, "").slice(0, 10));
  }, [contactMode, selectedCustomer]);

  const minEventDate = getMinEventDateISO();

  const update = <K extends keyof QuickEnquiryFormValues>(key: K, value: QuickEnquiryFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validateName = (raw: string) => {
    const v = raw.trim();
    if (!v) return t("validate.nameRequired");
    if (v.length < 2) return t("validate.nameShort");
    if (!NAME_RE.test(v)) return t("validate.nameInvalid");
    return null;
  };

  const validatePhone = (raw: string) => {
    const v = raw.trim();
    if (!v) return t("validate.phoneRequired");
    if (v.replace(/\D/g, "").length !== 10) return t("validate.phoneInvalid");
    return null;
  };

  const contactErrors = {
    customerId: contactMode === "existing" && !customerId ? t("enquiry.contact.required") : null,
    name: contactMode === "new" ? validateName(customerName) : null,
    phone: contactMode === "new" ? validatePhone(phone) : null,
  };

  const legacyErrors = {
    name: validateName(form.customerName),
    phone: validatePhone(form.phone),
    eventType: !form.eventType.trim() ? t("validate.eventTypeRequired") : null,
    eventDate: validateEventDate(form.eventDate, t),
    timeSlot: !form.timeSlotId ? t("validate.timeSlotRequired") : null,
    guests: !form.guestCount || form.guestCount < 1 ? t("validate.guestsRequired") : null,
    source: !form.source.trim() ? t("validate.sourceRequired") : null,
  };

  const answerErrors = useMemo(() => {
    const next: Record<string, string | null> = {};
    for (const question of enquiryQuestions) {
      if (!question.required) {
        next[question.id] = null;
        continue;
      }
      const value = answers[question.id];
      const empty = Array.isArray(value)
        ? value.filter((item) => item.trim()).length === 0
        : !value?.trim();
      next[question.id] = empty ? t("forms.validate.required") : null;
    }
    return next;
  }, [answers, enquiryQuestions, t]);

  const showContact = (key: keyof typeof contactErrors) => touched && contactErrors[key];
  const showLegacy = (key: keyof typeof legacyErrors) => touched && legacyErrors[key];

  const handleSubmit = async () => {
    setTouched(true);

    if (useDynamicForm) {
      const contactInvalid = Object.values(contactErrors).some(Boolean);
      const answersInvalid = Object.values(answerErrors).some(Boolean);
      if (contactInvalid || answersInvalid) {
        toast.error(t("toast.fixErrors"));
        return;
      }

      setIsSubmitting(true);
      try {
        const nameParts = splitCustomerName(customerName);
        await createLeadViaCrm({
          ...(contactMode === "existing" && customerId
            ? { customerId }
            : {
                firstName: nameParts.firstName,
                lastName: nameParts.lastName,
                mobileNo: phone.trim(),
              }),
          answers,
        });
        await queryClient.invalidateQueries({ queryKey: banquetQueryKeys.all });
        toast.success(t("enquiryV2.saveSuccess"));
        setContactMode("new");
        setCustomerId("");
        setCustomerName("");
        setPhone("");
        setAnswers({});
        setTouched(false);
        onSubmitted?.();
      } catch {
        toast.error(t("toast.leadSubmitFailed"));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const allErrors = Object.values(legacyErrors).filter(Boolean);
    if (allErrors.length) {
      toast.error(t("toast.fixErrors"));
      return;
    }

    const timeSlot = PACKAGES.find((pkg) => pkg.id === form.timeSlotId);
    const menu = PLATE_PACKAGES.find((pkg) => pkg.id === form.menuPackageId);
    const venue = VENUE_OPTIONS.find((item) => item.id === form.venueId);
    const decorations = DECOR_OPTIONS.filter((item) => form.decorationIds.includes(item.id)).map(
      (item) => item.name,
    );

    const payload: EnquiryLeadPayload = {
      name: form.customerName.trim(),
      mobileNo: form.phone.trim(),
      eventDate: form.eventDate,
      eventSlot: timeSlot?.slots?.[0]?.label ?? timeSlot?.name ?? "",
      eventMenuRange: menu ? `${menu.name} (₹${menu.basePrice}/plate)` : "",
      eventNumberOfGuest: String(form.guestCount),
      eventType: form.eventType,
      eventAdditionDetail: [
        venue ? `Venue: ${venue.name}` : "",
        `Source: ${form.source}`,
        form.approxBudget ? `Approx budget: ${form.approxBudget}` : "",
        decorations.length ? `Decoration: ${decorations.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };

    setIsSubmitting(true);
    try {
      if (isEdit && enquiry && editContext) {
        await updateEnquiryFromQuickForm(editContext, form);
        await queryClient.invalidateQueries({ queryKey: banquetQueryKeys.all });
        toast.success(t("enquiryV2.saveSuccess"));
        onSubmitted?.();
        return;
      }

      const result = await submitQuickEnquiryDualWrite(
        {
          customerName: form.customerName.trim(),
          phone: form.phone.trim(),
          eventType: form.eventType,
          eventDate: form.eventDate,
          timeSlotId: form.timeSlotId,
          timeSlotLabel: timeSlot?.slots?.[0]?.label ?? timeSlot?.name ?? "",
          guestCount: form.guestCount,
          venueName: venue?.name ?? "",
          source: form.source,
          approxBudget: form.approxBudget,
          menuPackageLabel: menu ? `${menu.name} (₹${menu.basePrice}/plate)` : "",
          decorationNames: decorations,
        },
        payload,
      );

      if (result.sheetOk || result.crmOk) {
        await queryClient.invalidateQueries({ queryKey: banquetQueryKeys.enquiries() });
        await queryClient.invalidateQueries({ queryKey: banquetQueryKeys.openEnquiries() });
        setForm(emptyForm(defaultDate));
        setTouched(false);
        onSubmitted?.();
      }
    } catch {
      toast.error(t("toast.leadSubmitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingEdit || (!isEdit && workspaceLoading)) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t("enquiries.loading")}
      </div>
    );
  }

  if (useDynamicForm) {
    return (
      <div className="space-y-5">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">{t("enquiry.contact.title")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("enquiry.contact.hint")}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={contactMode === "existing" ? "default" : "outline"}
              onClick={() => setContactMode("existing")}
            >
              {t("enquiry.contact.existing")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={contactMode === "new" ? "default" : "outline"}
              onClick={() => {
                setContactMode("new");
                setCustomerId("");
              }}
            >
              {t("enquiry.contact.new")}
            </Button>
          </div>

          {contactMode === "existing" ? (
            <div className="space-y-2">
              <Label>
                {t("enquiry.contact.select")}
                <Req />
              </Label>
              <Select
                value={customerId || undefined}
                onValueChange={setCustomerId}
                disabled={customersLoading}
              >
                <SelectTrigger className={cn(showContact("customerId") && "border-destructive")}>
                  <SelectValue placeholder={t("enquiry.contact.selectPh")} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} · {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showContact("customerId") && (
                <p className="text-xs text-destructive">{contactErrors.customerId}</p>
              )}
              {selectedCustomer && (
                <p className="text-xs text-muted-foreground">
                  {selectedCustomer.name} · {selectedCustomer.phone}
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="qe-dyn-name">
                  {t("basics.customerName")}
                  <Req />
                </Label>
                <Input
                  id="qe-dyn-name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value.slice(0, 100))}
                  placeholder={t("basics.customerName.ph")}
                  className={cn(showContact("name") && "border-destructive")}
                />
                {showContact("name") && <p className="text-xs text-destructive">{contactErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="qe-dyn-phone">
                  {t("basics.phone")}
                  <Req />
                </Label>
                <Input
                  id="qe-dyn-phone"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                  className={cn(showContact("phone") && "border-destructive")}
                />
                {showContact("phone") && (
                  <p className="text-xs text-destructive">{contactErrors.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-border/60 pt-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {workspace?.enquiryForm?.title ?? t("enquiry.form.title")}
            </p>
            {workspace?.enquiryForm?.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{workspace.enquiryForm.description}</p>
            )}
          </div>

          {enquiryQuestions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label>
                {question.title}
                {question.required ? <Req /> : null}
              </Label>
              {question.description && (
                <p className="text-xs text-muted-foreground">{question.description}</p>
              )}
              <FormFillField
                question={question}
                value={answers[question.id]}
                onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
                error={touched ? answerErrors[question.id] : null}
              />
              {touched && answerErrors[question.id] && (
                <p className="text-xs text-destructive">{answerErrors[question.id]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {t("common.cancel")}
            </Button>
          )}
          <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("enquiryV2.submit")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="qe-customerName">
              {t("basics.customerName")}
              <Req />
            </Label>
            <Input
              id="qe-customerName"
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value.slice(0, 100))}
              placeholder={t("basics.customerName.ph")}
              aria-invalid={!!showLegacy("name")}
              className={showLegacy("name") ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {showLegacy("name") && <p className="text-xs text-destructive">{legacyErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qe-phone">
              {t("basics.phone")}
              <Req />
            </Label>
            <Input
              id="qe-phone"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
              maxLength={10}
              aria-invalid={!!showLegacy("phone")}
              className={showLegacy("phone") ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {showLegacy("phone") && <p className="text-xs text-destructive">{legacyErrors.phone}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              {t("event.eventType")}
              <Req />
            </Label>
            <Select value={form.eventType || undefined} onValueChange={(value) => update("eventType", value)}>
              <SelectTrigger className={showLegacy("eventType") ? "border-destructive" : ""}>
                <SelectValue placeholder={t("event.eventType.ph")} />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showLegacy("eventType") && (
              <p className="text-xs text-destructive">{legacyErrors.eventType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qe-eventDate">
              {t("event.eventDate")}
              <Req />
            </Label>
            <Input
              id="qe-eventDate"
              type="date"
              min={minEventDate}
              value={form.eventDate}
              onChange={(e) => update("eventDate", e.target.value)}
              className={showLegacy("eventDate") ? "border-destructive" : ""}
            />
            {showLegacy("eventDate") && (
              <p className="text-xs text-destructive">{legacyErrors.eventDate}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              {t("event.timeSlot")}
              <Req />
            </Label>
            <Select value={form.timeSlotId || undefined} onValueChange={(value) => update("timeSlotId", value)}>
              <SelectTrigger className={showLegacy("timeSlot") ? "border-destructive" : ""}>
                <SelectValue placeholder={t("event.timeSlot.ph")} />
              </SelectTrigger>
              <SelectContent>
                {PACKAGES.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showLegacy("timeSlot") && (
              <p className="text-xs text-destructive">{legacyErrors.timeSlot}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qe-guests">
              {t("event.guests")}
              <Req />
            </Label>
            <Input
              id="qe-guests"
              type="number"
              min={1}
              value={form.guestCount}
              onChange={(e) => update("guestCount", Number(e.target.value) || 0)}
              className={showLegacy("guests") ? "border-destructive" : ""}
            />
            {showLegacy("guests") && <p className="text-xs text-destructive">{legacyErrors.guests}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("event.venue")}</Label>
            <Select value={form.venueId || undefined} onValueChange={(value) => update("venueId", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("event.venue.ph")} />
              </SelectTrigger>
              <SelectContent>
                {VENUE_OPTIONS.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {t("event.source")}
              <Req />
            </Label>
            <Select value={form.source || undefined} onValueChange={(value) => update("source", value)}>
              <SelectTrigger className={showLegacy("source") ? "border-destructive" : ""}>
                <SelectValue placeholder={t("event.source.ph")} />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showLegacy("source") && <p className="text-xs text-destructive">{legacyErrors.source}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("event.budget")}</Label>
            <Select
              value={form.approxBudget || undefined}
              onValueChange={(value) => update("approxBudget", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("event.budget.ph")} />
              </SelectTrigger>
              <SelectContent>
                {APPROX_BUDGET_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("event.menu")}</Label>
            <Select
              value={form.menuPackageId || undefined}
              onValueChange={(value) => update("menuPackageId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("event.menu.ph")} />
              </SelectTrigger>
              <SelectContent>
                {PLATE_PACKAGES.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("quickEnquiry.decoration")}</Label>
          <DecorationMultiSelect
            options={DECOR_OPTIONS}
            value={form.decorationIds}
            onChange={(decorationIds) => update("decorationIds", decorationIds)}
            placeholder={t("quickEnquiry.decoration.ph")}
            searchPlaceholder={t("quickEnquiry.decoration.search")}
            emptyLabel={t("quickEnquiry.decoration.empty")}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? t("enquiryV2.save") : t("enquiryV2.submit")}
        </Button>
      </div>
    </div>
  );
};
