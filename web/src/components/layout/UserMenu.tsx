import { useNavigate } from "react-router-dom";
import { LogOut, Settings, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";
import type { StoredUser } from "@/lib/authStorage";

function getUserDisplayName(user: StoredUser | null, fallback: string): string {
  if (!user) return fallback;
  const name = `${user.firstName} ${user.lastName}`.replace(/\s+\./g, "").trim();
  return name || user.username;
}

function getUserInitials(user: StoredUser | null): string {
  if (!user) return "?";
  const name = getUserDisplayName(user, "");
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();

  if (!user) return null;

  const displayName = getUserDisplayName(user, t("profile.guest"));
  const initials = getUserInitials(user);
  const subtitle = user.email || user.username;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t("profile.menu")}>
          <Avatar className="h-9 w-9 border border-border">
            <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <UserRound className="mr-2 h-4 w-4" />
          {t("profile.view")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          {t("profile.settings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          {t("profile.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
