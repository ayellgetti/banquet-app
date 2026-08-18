import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ClipboardList,
  ClipboardPen,
  NotebookPen,
  Contact,
  CreditCard,
  FileText,
  LayoutGrid,
  ScrollText,
  Package,
  ShoppingBasket,
  Sparkles,
  Settings,
  UserRound,
  CalendarCheck,
  PhoneForwarded,
  UtensilsCrossed,
  FilePlus2,
} from "lucide-react";

export type AdminNavGroupId = "scheduling" | "leads" | "manage" | "finance" | "tools";

export type AdminNavItem = {
  id: string;
  path: string;
  icon: LucideIcon;
  titleKey: string;
  subtitleKey: string;
  descKey?: string;
  group: AdminNavGroupId;
};

export const ADMIN_NAV_GROUPS: { id: AdminNavGroupId; labelKey: string }[] = [
  { id: "scheduling", labelKey: "admin.nav.group.scheduling" },
  { id: "leads", labelKey: "admin.nav.group.leads" },
  { id: "manage", labelKey: "admin.nav.group.manage" },
  { id: "finance", labelKey: "admin.nav.group.finance" },
  { id: "tools", labelKey: "admin.nav.group.tools" },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "calendar",
    path: "/calendar",
    icon: CalendarDays,
    titleKey: "module.calendar.title",
    subtitleKey: "module.calendar.subtitle",
    descKey: "module.calendar.desc",
    group: "scheduling",
  },
  {
    id: "enquiries",
    path: "/enquiries",
    icon: ClipboardList,
    titleKey: "module.enquiries.title",
    subtitleKey: "module.enquiries.subtitle",
    descKey: "module.enquiries.desc",
    group: "leads",
  },
  {
    id: "follow-up",
    path: "/follow-up",
    icon: PhoneForwarded,
    titleKey: "module.followUp.title",
    subtitleKey: "module.followUp.subtitle",
    descKey: "module.followUp.desc",
    group: "leads",
  },
  {
    id: "bookings",
    path: "/bookings",
    icon: CalendarCheck,
    titleKey: "module.bookings.title",
    subtitleKey: "module.bookings.subtitle",
    descKey: "module.bookings.desc",
    group: "leads",
  },
  {
    id: "contacts",
    path: "/contacts",
    icon: UserRound,
    titleKey: "module.customers.title",
    subtitleKey: "module.customers.subtitle",
    descKey: "module.customers.desc",
    group: "manage",
  },
  {
    id: "inventory",
    path: "/inventory",
    icon: Package,
    titleKey: "module.inventory.title",
    subtitleKey: "module.inventory.subtitle",
    descKey: "module.inventory.desc",
    group: "manage",
  },
  {
    id: "visiting-card",
    path: "/visiting-card",
    icon: Contact,
    titleKey: "module.visitingCard.title",
    subtitleKey: "module.visitingCard.subtitle",
    descKey: "module.visitingCard.desc",
    group: "manage",
  },
  {
    id: "payments",
    path: "/payments",
    icon: CreditCard,
    titleKey: "module.payments.title",
    subtitleKey: "module.payments.subtitle",
    descKey: "module.payments.desc",
    group: "finance",
  },
  {
    id: "generate-invoice",
    path: "/generate-invoice",
    icon: FileText,
    titleKey: "module.generateInvoice.title",
    subtitleKey: "module.generateInvoice.subtitle",
    descKey: "module.generateInvoice.desc",
    group: "finance",
  },
  {
    id: "extra",
    path: "/extra",
    icon: Sparkles,
    titleKey: "module.extra.title",
    subtitleKey: "module.extra.subtitle",
    descKey: "module.extra.desc",
    group: "tools",
  },
];

export const EXTRA_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "forms",
    path: "/forms",
    icon: FilePlus2,
    titleKey: "module.forms.title",
    subtitleKey: "module.forms.subtitle",
    descKey: "module.forms.desc",
    group: "tools",
  },
  {
    id: "enquiry",
    path: "/enquiry",
    icon: ClipboardList,
    titleKey: "module.enquiry.title",
    subtitleKey: "module.enquiry.subtitle",
    descKey: "module.enquiry.desc",
    group: "tools",
  },
  {
    id: "enquiry-v2",
    path: "/enquiry-v2",
    icon: ClipboardPen,
    titleKey: "module.enquiryV2.title",
    subtitleKey: "module.enquiryV2.subtitle",
    descKey: "module.enquiryV2.desc",
    group: "tools",
  },
  {
    id: "enquiry-v3",
    path: "/enquiry-v3",
    icon: NotebookPen,
    titleKey: "module.enquiryV3.title",
    subtitleKey: "module.enquiryV3.subtitle",
    descKey: "module.enquiryV3.desc",
    group: "tools",
  },
  {
    id: "menu",
    path: "/menu-selection",
    icon: UtensilsCrossed,
    titleKey: "module.menu.title",
    subtitleKey: "module.menu.subtitle",
    descKey: "module.menu.desc",
    group: "tools",
  },
  {
    id: "menu-package-card",
    path: "/menu-package-card",
    icon: LayoutGrid,
    titleKey: "module.menuPackageCard.title",
    subtitleKey: "module.menuPackageCard.subtitle",
    descKey: "module.menuPackageCard.desc",
    group: "tools",
  },
  {
    id: "menu-catalog",
    path: "/menu-catalog",
    icon: ScrollText,
    titleKey: "module.menuCatalog.title",
    subtitleKey: "module.menuCatalog.subtitle",
    descKey: "module.menuCatalog.desc",
    group: "tools",
  },
  {
    id: "procurement",
    path: "/procurement",
    icon: ShoppingBasket,
    titleKey: "module.procurement.title",
    subtitleKey: "module.procurement.subtitle",
    descKey: "module.procurement.desc",
    group: "tools",
  },
];

const ACCOUNT_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "profile",
    path: "/profile",
    icon: UserRound,
    titleKey: "profile.title",
    subtitleKey: "profile.subtitle",
    descKey: "profile.desc",
    group: "manage",
  },
  {
    id: "settings",
    path: "/settings",
    icon: Settings,
    titleKey: "settings.title",
    subtitleKey: "settings.subtitle",
    descKey: "settings.desc",
    group: "manage",
  },
];

/** Flat sidebar links (main groups + tools extras), excluding account-only pages. */
export const SIDEBAR_NAV_ITEMS: AdminNavItem[] = [...ADMIN_NAV_ITEMS, ...EXTRA_NAV_ITEMS];

const ALL_NAV_ITEMS = [...ADMIN_NAV_ITEMS, ...EXTRA_NAV_ITEMS, ...ACCOUNT_NAV_ITEMS];

export function isGenerateInvoicePath(pathname: string): boolean {
  return pathname === "/generate-invoice" || pathname === "/bill" || pathname.startsWith("/bill/");
}

export function isExtraNavPath(pathname: string): boolean {
  return pathname === "/extra" || EXTRA_NAV_ITEMS.some((item) => isAdminNavActive(pathname, item));
}

export function getAdminNavItem(pathname: string): AdminNavItem {
  if (
    pathname === "/customers" ||
    pathname.startsWith("/customers/") ||
    pathname === "/vendors" ||
    pathname.startsWith("/vendors/")
  ) {
    return ADMIN_NAV_ITEMS.find((item) => item.id === "contacts") ?? ADMIN_NAV_ITEMS[0];
  }

  if (isGenerateInvoicePath(pathname)) {
    return ADMIN_NAV_ITEMS.find((item) => item.id === "generate-invoice") ?? ADMIN_NAV_ITEMS[0];
  }

  const exact = ALL_NAV_ITEMS.find((item) => item.path === pathname);
  if (exact) return exact;

  const nested = ALL_NAV_ITEMS.filter((item) => item.path !== "/").find((item) =>
    pathname.startsWith(item.path),
  );
  return nested ?? ADMIN_NAV_ITEMS[0];
}

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.id === "contacts") {
    return (
      pathname === "/contacts" ||
      pathname.startsWith("/contacts/") ||
      pathname === "/customers" ||
      pathname.startsWith("/customers/") ||
      pathname === "/vendors" ||
      pathname.startsWith("/vendors/")
    );
  }
  if (item.path === "/") return pathname === "/";
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
