"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import { useTranslation } from "@/context/I18nContext";
import type { RecordItem } from "../types";

interface Props {
  record: RecordItem | null;
  onClose: () => void;
  onDelete: (record: RecordItem) => void;
}

export default function RecordDetailModal({ record, onClose, onDelete }: Props) {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState(false);

  if (!record) return null;

  const rows: [string, string][] = [
    [t("records.table.code"), record.code],
    [t("records.table.title"), record.title],
    [t("records.table.date"), record.date],
    [t("records.table.owner"), record.owner],
  ];

  return (
    <>
      <Modal open={!!record} onClose={onClose} title={t("records.detail.title")} subtitle={record.code}>
        <div className="space-y-3">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-[var(--card-border)] pb-2">
              <span className="text-sm text-[var(--muted)]">{k}</span>
              <span className="text-sm text-[var(--foreground)] text-right">{v}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4 items-center">
            <span className="text-sm text-[var(--muted)]">{t("records.table.status")}</span>
            <StatusBadge status={record.status} label={t(`records.estados.${record.status}`)} size="sm" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-[var(--card-border)] text-[var(--foreground)] row-hover"
          >
            {t("common.close")}
          </button>
          <button
            onClick={() => setConfirm(true)}
            className="px-4 py-2 text-sm rounded-lg text-white bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 btn-press"
          >
            {t("common.delete")}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm}
        variant="danger"
        title={t("records.detail.deleteTitle")}
        message={t("records.detail.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          onDelete(record);
          onClose();
        }}
      />
    </>
  );
}
