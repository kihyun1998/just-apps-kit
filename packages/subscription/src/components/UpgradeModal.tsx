"use client";

import { Zap } from "lucide-react";
import { t } from "../i18n";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import type { Locale } from "../types";

export interface UpgradeModalProps {
  locale: Locale;
  open: boolean;
  feature?: string;
  onUpgrade: () => void;
  onClose: () => void;
}

export function UpgradeModal({ locale, open, feature, onUpgrade, onClose }: UpgradeModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={t("upgrade.title", locale)}>
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center py-2">
          <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-brand" />
          </div>
          <p className="text-sm text-muted-foreground">
            {feature
              ? t("upgrade.description.feature", locale, undefined, { feature })
              : t("upgrade.description", locale)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t("upgrade.cancel", locale)}
          </Button>
          <Button className="flex-1" onClick={onUpgrade}>
            {t("upgrade.button", locale)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
