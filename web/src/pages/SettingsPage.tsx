import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useUpdateWorkspaceMutation, useWorkspaceQuery } from "@/hooks/useWorkspace";
import type { IndustryTemplateKey } from "@/lib/workspaceApi";
import { LANGUAGES, useT } from "@/i18n";
import { toast } from "sonner";

const SettingsPage = () => {
  const { t, lang, setLang } = useT();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data: workspace, isLoading } = useWorkspaceQuery();
  const updateWorkspace = useUpdateWorkspaceMutation();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleIndustryChange = async (value: IndustryTemplateKey) => {
    try {
      await updateWorkspace.mutateAsync({ industryTemplate: value });
      toast.success(t("settings.industry.saved"));
    } catch {
      toast.error(t("settings.industry.saveFailed"));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="rounded-xl border-border/70 shadow-soft">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="font-display text-lg font-semibold">{t("settings.industry")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("settings.industryDesc")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-industry">{t("settings.industry")}</Label>
            <Select
              value={workspace?.industryTemplate}
              onValueChange={(value) => void handleIndustryChange(value as IndustryTemplateKey)}
              disabled={isLoading || updateWorkspace.isPending}
            >
              <SelectTrigger id="settings-industry" className="max-w-sm">
                <SelectValue placeholder={workspace?.industryLabel} />
              </SelectTrigger>
              <SelectContent>
                {(workspace?.availableTemplates ?? []).map((template) => (
                  <SelectItem key={template.key} value={template.key}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {workspace && (
              <p className="text-xs text-muted-foreground">{workspace.industryDescription}</p>
            )}
          </div>

          {workspace && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Enquiry form
                </p>
                <p className="mt-1 text-sm font-medium">
                  {workspace.enquiryForm?.title ?? "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {workspace.enquiryForm?.questions.length ?? 0} questions
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("settings.postConfirm")}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {workspace.postConfirmStages.map((stage) => stage.label).join(" → ")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/70 shadow-soft">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="font-display text-lg font-semibold">{t("settings.preferences")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("settings.preferencesDesc")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-language">{t("lang.label")}</Label>
            <Select value={lang} onValueChange={(value) => setLang(value as typeof lang)}>
              <SelectTrigger id="settings-language" className="max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.native}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/70 shadow-soft">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <h2 className="font-display text-lg font-semibold">{t("settings.account")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("settings.accountDesc")}</p>
          </div>
          <Button type="button" variant="outline" className="gap-2" onClick={() => void handleLogout()}>
            <LogOut className="h-4 w-4" />
            {t("profile.logout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
