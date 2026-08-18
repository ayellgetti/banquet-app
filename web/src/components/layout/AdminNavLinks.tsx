import { NavLink, useLocation } from "react-router-dom";
import {
  ADMIN_NAV_GROUPS,
  SIDEBAR_NAV_ITEMS,
  isAdminNavActive,
  isGenerateInvoicePath,
} from "@/config/adminNav";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  onNavigate?: () => void;
  className?: string;
};

const linkClass = (isActive: boolean) =>
  cn(
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
    isActive
      ? "bg-primary text-primary-foreground shadow-gold"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );

export const AdminNavLinks = ({ onNavigate, className }: Props) => {
  const { t } = useT();
  const { pathname } = useLocation();

  return (
    <nav className={cn("flex flex-col gap-6 px-3 py-4", className)} aria-label={t("admin.nav.label")}>
      {ADMIN_NAV_GROUPS.map((group) => {
        const items = SIDEBAR_NAV_ITEMS.filter((item) => item.group === group.id);
        if (!items.length) return null;

        return (
          <div key={group.id}>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(group.labelKey)}
            </p>
            <div className="flex flex-col gap-1">
              {items.map((item) => {
                const active =
                  item.id === "generate-invoice"
                    ? isGenerateInvoicePath(pathname) || isAdminNavActive(pathname, item)
                    : isAdminNavActive(pathname, item);

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onNavigate}
                    className={() => linkClass(active)}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    <span className="truncate">{t(item.titleKey)}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
};
