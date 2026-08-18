import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContactTypeBadge } from "@/components/contacts/ContactTypeBadge";
import type { ContactRecord } from "@/lib/contactsApi";
import { useT } from "@/i18n";

type Props = {
  contacts: ContactRecord[];
};

export const ContactsTable = ({ contacts }: Props) => {
  const { t } = useT();

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-soft scrollbar-subtle">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("customers.col.name")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("contacts.col.type")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("customers.col.email")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("customers.col.phone")}
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("contacts.col.detail")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id} className="border-border/50">
              <TableCell className="py-4 font-medium text-foreground">{contact.name}</TableCell>
              <TableCell className="py-4">
                <ContactTypeBadge type={contact.type} />
              </TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">{contact.email || "—"}</TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">{contact.phone || "—"}</TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">{contact.detail || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
