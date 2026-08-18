import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LANGUAGES, useT } from "@/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  title: string;
  subtitle: string;
  backTo?: string;
  children: React.ReactNode;
};

export const AppShell = ({ title, subtitle, backTo = "/", children }: AppShellProps) => {
  const { t, lang, setLang } = useT();
  const isHome = !backTo;
  const appName = t("app.title");

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print relative overflow-hidden border-b border-border/70 bg-gradient-noir text-primary-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(60% 80% at 85% 20%, hsl(var(--primary) / 0.55), transparent 60%), radial-gradient(40% 60% at 10% 90%, hsl(var(--primary-glow) / 0.35), transparent 70%)",
          }}
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-gold opacity-80" />
        <div className="container relative flex flex-wrap items-center justify-between gap-4 py-7">
          <div className="flex min-w-0 items-center gap-3">
            {backTo && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="shrink-0 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Link to={backTo} aria-label={t("home.back")}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <Link
              to="/"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-base font-bold text-primary-foreground shadow-gold transition-opacity hover:opacity-90"
              aria-label={appName}
            >
              ✦
            </Link>
            <div className="min-w-0">
              {!isHome && (
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-gradient-gold">
                  {appName}
                </p>
              )}
              <h1
                className={`font-display truncate font-bold tracking-tight text-white ${
                  isHome ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
              >
                {title}
              </h1>
              <p className="mt-0.5 text-sm text-white/60">{subtitle}</p>
            </div>
          </div>
          <div className="w-40 shrink-0">
            <Select value={lang} onValueChange={(v) => setLang(v as typeof lang)}>
              <SelectTrigger
                aria-label={t("lang.label")}
                className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/15 focus:ring-primary/50"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.native}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
};
