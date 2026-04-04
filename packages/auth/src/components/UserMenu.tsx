"use client";

import { useState, useRef, useEffect } from "react";
import type { Locale, AuthUser, TranslationOverrides } from "../types";
import { t } from "../i18n";
import { MarbleAvatar } from "../ui/marble-avatar";
import { LogOut, Settings, User } from "lucide-react";

export interface UserMenuProps {
  locale: Locale;
  user: AuthUser;
  role: "admin" | "user";
  onMyPage: () => void;
  onAdmin: () => void;
  onSignOut: () => void;
  translations?: TranslationOverrides;
}

export function UserMenu({
  locale,
  user,
  role,
  onMyPage,
  onAdmin,
  onSignOut,
  translations,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = role === "admin";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center rounded-full transition-opacity hover:opacity-80"
      >
        <MarbleAvatar name={`justapps:${user.email ?? user.id}`} size={32} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card p-1 shadow-md z-50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium truncate">{user.email}</p>
            {isAdmin && (
              <span className="text-xs text-muted-foreground">
                {t("usermenu.admin_badge", locale, translations)}
              </span>
            )}
          </div>

          {isAdmin ? (
            <button
              onClick={() => {
                setOpen(false);
                onAdmin();
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4" />
              {t("usermenu.admin", locale, translations)}
            </button>
          ) : (
            <button
              onClick={() => {
                setOpen(false);
                onMyPage();
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <User className="h-4 w-4" />
              {t("usermenu.mypage", locale, translations)}
            </button>
          )}

          <button
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t("usermenu.logout", locale, translations)}
          </button>
        </div>
      )}
    </div>
  );
}
