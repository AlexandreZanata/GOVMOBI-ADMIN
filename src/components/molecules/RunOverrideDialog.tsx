"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { useOverrideRunMutation } from "@/hooks/useOverrideRunMutation";
import { Permission } from "@/models";

/**
 * Props for run override confirmation dialog trigger.
 */
export interface RunOverrideDialogProps {
  /** Target run identifier for override action. */
  runId: string;
  /** Test selector prefix for trigger and dialog controls. */
  "data-testid"?: string;
}

/**
 * Renders a permission-gated override confirmation flow for runs.
 *
 * @param props - Target run identifier and optional test selector prefix
 * @returns Trigger button and confirmation dialog when authorized
 */
export function RunOverrideDialog({
  runId,
  "data-testid": testId,
}: RunOverrideDialogProps) {
  const { t } = useTranslation("runs");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const overrideMutation = useOverrideRunMutation();

  const canConfirm = reason.trim().length > 0 && !overrideMutation.isPending;

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    if (!canConfirm) {
      return;
    }

    await overrideMutation.mutateAsync({
      runId,
      reason: reason.trim(),
      auditEvent: "RUN_OVERRIDE_CONFIRMED",
    });

    setReason("");
    setOpen(false);
  };

  return (
    <Can perform={Permission.OVERRIDE_ACTION}>
      <Button
        data-testid={testId ? `${testId}-trigger` : "override-trigger"}
        size="sm"
        variant="destructive"
        onClick={(event) => {
          triggerRef.current = event.currentTarget;
          setOpen(true);
        }}
      >
        {t("dialogs.override.open")}
      </Button>

      <ConfirmDialog
        data-testid={testId ? `${testId}-dialog` : "override-dialog"}
        open={open}
        onClose={handleClose}
        onConfirm={() => void handleConfirm()}
        namespace="runs"
        titleKey="dialogs.override.title"
        descriptionKey="dialogs.override.description"
        confirmLabelKey="dialogs.override.confirm"
        cancelLabelKey="dialogs.override.cancel"
        confirmDisabled={!canConfirm}
        confirmLoading={overrideMutation.isPending}
        triggerRef={triggerRef}
        reasonField={
          <Input
            data-testid={testId ? `${testId}-reason` : "override-reason"}
            label={t("dialogs.override.reasonLabel")}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            aria-required="true"
          />
        }
      />
    </Can>
  );
}
