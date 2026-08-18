import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { banquetQueryKeys } from "@/lib/banquetApi";
import { ApiError } from "@/lib/apiClient";
import {
  createContactViaApi,
  fetchVendorCategoriesFromApi,
} from "@/lib/contactsApi";
import type { VendorCategoryOption } from "@/lib/vendorsApi";
import { normalizeMobileNo } from "@/lib/mappers/enquiryMapper";
import type { ContactType } from "@/data/banquetData";
import { useT } from "@/i18n";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: ContactType;
};

const NONE_CATEGORY = "__none__";
const CONTACT_TYPES: ContactType[] = ["customer", "vendor", "employee", "other"];

export const ContactCreateModal = ({ open, onOpenChange, defaultType = "customer" }: Props) => {
  const { t } = useT();
  const queryClient = useQueryClient();
  const [type, setType] = useState<ContactType>(defaultType);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [categoryId, setCategoryId] = useState(NONE_CATEGORY);
  const [categories, setCategories] = useState<VendorCategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setType(defaultType);
  }, [open, defaultType]);

  useEffect(() => {
    if (!open || type !== "vendor") return;

    let cancelled = false;
    setIsLoadingCategories(true);
    void fetchVendorCategoriesFromApi()
      .then((items) => {
        if (!cancelled) setCategories(items);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCategories(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, type]);

  const reset = () => {
    setType(defaultType);
    setName("");
    setMobile("");
    setEmail("");
    setCity("");
    setAddress("");
    setNotes("");
    setGstNumber("");
    setCategoryId(NONE_CATEGORY);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedMobile = normalizeMobileNo(mobile);

    if (!trimmedName) {
      toast.error(t("toast.formErrors"));
      return;
    }

    if (type === "customer" && trimmedMobile.length !== 10) {
      toast.error(t("toast.formErrors"));
      return;
    }

    setIsSubmitting(true);
    try {
      await createContactViaApi({
        type,
        name: trimmedName,
        mobile: trimmedMobile || undefined,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        gstNumber: gstNumber.trim() || null,
        categoryId: categoryId === NONE_CATEGORY ? null : categoryId,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: banquetQueryKeys.contacts() }),
        queryClient.invalidateQueries({ queryKey: banquetQueryKeys.customers() }),
        queryClient.invalidateQueries({ queryKey: banquetQueryKeys.vendors() }),
      ]);
      toast.success(t("contacts.created"));
      reset();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t("contacts.createError");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("contacts.add")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-type">{t("contacts.col.type")}</Label>
            <Select value={type} onValueChange={(v) => setType(v as ContactType)}>
              <SelectTrigger id="contact-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`contacts.type.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-name">{t("customers.col.name")}</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "vendor" ? "Radhe Water Supply" : "Rahul Sharma"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-mobile">{t("customers.col.phone")}</Label>
            <Input
              id="contact-mobile"
              inputMode="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="9876543210"
              required={type === "customer"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">{t("customers.col.email")}</Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {type === "customer" && (
            <div className="space-y-2">
              <Label htmlFor="contact-city">City</Label>
              <Input id="contact-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          )}

          {type === "vendor" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="contact-category">{t("vendors.form.category")}</Label>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  disabled={isLoadingCategories}
                >
                  <SelectTrigger id="contact-category">
                    <SelectValue placeholder={t("vendors.form.categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_CATEGORY}>{t("vendors.form.noCategory")}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-address">{t("vendors.form.address")}</Label>
                <Input
                  id="contact-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-gst">{t("vendors.form.gst")}</Label>
                <Input
                  id="contact-gst"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-notes">{t("vendors.form.notes")}</Label>
                <Textarea
                  id="contact-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}

          {(type === "employee" || type === "other") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="contact-address">{t("vendors.form.address")}</Label>
                <Input
                  id="contact-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-notes">{t("vendors.form.notes")}</Label>
                <Textarea
                  id="contact-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
