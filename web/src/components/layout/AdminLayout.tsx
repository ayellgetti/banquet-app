import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { getAdminNavItem } from "@/config/adminNav";
import { AdminNavLinks } from "@/components/layout/AdminNavLinks";
import { UserMenu } from "@/components/layout/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES, useT } from "@/i18n";

function Brand({ appName, badge, onNavigate }: { appName: string; badge: string; onNavigate?: () => void }) {
  return (
    <Link
      to="/calendar"
      className="flex items-center gap-3 px-5 py-5 transition-opacity hover:opacity-90"
      onClick={onNavigate}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-base font-bold text-primary-foreground shadow-gold">
        ✦
      </span>
      <div className="min-w-0 leading-tight">
        <p className="font-display truncate text-base font-bold">{appName}</p>
        <p className="truncate text-xs text-muted-foreground">{badge}</p>
      </div>
    </Link>
  );
}

function LanguageSelect({ className }: { className?: string }) {
  const { t, lang, setLang } = useT();
  return (
    <Select value={lang} onValueChange={(v) => setLang(v as typeof lang)}>
      <SelectTrigger aria-label={t("lang.label")} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.native}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const AdminLayout = () => {
  const { t } = useT();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = getAdminNavItem(pathname);
  const appName = t("app.title");
  const badge = t("admin.badge");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand appName={appName} badge={badge} />
        <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto">
          <AdminNavLinks />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl lg:hidden" aria-label={t("admin.nav.open")}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex h-full w-72 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>{t("admin.nav.label")}</SheetTitle>
                </SheetHeader>
                <Brand appName={appName} badge={badge} onNavigate={() => setMobileOpen(false)} />
                <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto">
                  <AdminNavLinks onNavigate={() => setMobileOpen(false)} />
                </div>
                <div className="border-t border-sidebar-border p-4">
                  <LanguageSelect className="w-full" />
                </div>
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-bold tracking-tight md:text-2xl">
                {t(active.titleKey)}
              </h1>
              <p className="truncate text-sm text-muted-foreground">{t(active.subtitleKey)}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageSelect className="hidden w-[7.5rem] sm:flex" />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
