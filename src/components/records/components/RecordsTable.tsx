"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import StatusBadge from "@/components/ui/StatusBadge";
import { useTranslation } from "@/context/I18nContext";
import { useAppSelector } from "@/store/hooks";
import type { RecordItem } from "../types";

interface Props {
  rows: RecordItem[];
  onSelect: (record: RecordItem) => void;
}

export default function RecordsTable({ rows, onSelect }: Props) {
  const { t } = useTranslation();
  const density = useAppSelector((s) => s.ui.density); // Redux demo
  const pad = density === "compact" ? "!py-1" : "!py-2.5";

  return (
    <div className="hidden md:block bg-[var(--card)] border border-[var(--card-border)] rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("records.table.code")}</TableHead>
            <TableHead>{t("records.table.title")}</TableHead>
            <TableHead>{t("records.table.status")}</TableHead>
            <TableHead>{t("records.table.date")}</TableHead>
            <TableHead>{t("records.table.owner")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} onClick={() => onSelect(r)} className="cursor-pointer">
              <TableCell className={`font-mono text-xs ${pad}`}>{r.code}</TableCell>
              <TableCell className={pad}>{r.title}</TableCell>
              <TableCell className={pad}>
                <StatusBadge status={r.status} label={t(`records.estados.${r.status}`)} size="sm" />
              </TableCell>
              <TableCell className={`text-[var(--muted)] ${pad}`}>{r.date}</TableCell>
              <TableCell className={`text-[var(--muted)] ${pad}`}>{r.owner}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
