import { Card, CardContent } from "@/components/ui/card";
import { ContactTypeBadge } from "@/components/contacts/ContactTypeBadge";
import type { ContactRecord } from "@/lib/contactsApi";
import { useT } from "@/i18n";

type Props = {
  contact: ContactRecord;
};

export const ContactCard = ({ contact }: Props) => {
  const { t } = useT();

  return (
    <Card className="rounded-xl border-border/70 shadow-soft transition-colors hover:border-primary/20">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{contact.name}</h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">{contact.email || "—"}</p>
          </div>
          <ContactTypeBadge type={contact.type} />
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("customers.col.phone")}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{contact.phone || "—"}</p>
          </div>
          {contact.detail && (
            <div className="max-w-[55%] text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {contact.type === "vendor" ? t("vendors.col.category") : t("contacts.col.detail")}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-foreground">{contact.detail}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
