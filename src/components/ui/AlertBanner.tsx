"use client";

import { FiAlertTriangle, FiInfo, FiAlertCircle, FiX, FiArrowRight } from "react-icons/fi";

interface AlertBannerProps {
  title: string;
  message: string;
  type?: "warning" | "error" | "info";
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
}

const typeConfig = {
  warning: { bg: "bg-amber-50/80 dark:bg-amber-950/30", border: "border-l-amber-500", title: "text-amber-900 dark:text-amber-100", message: "text-amber-800/80 dark:text-amber-200/80", icon: "text-amber-500", dismiss: "text-amber-400 hover:text-amber-600", actionText: "text-amber-700 hover:text-amber-900 dark:text-amber-300", Icon: FiAlertTriangle },
  error: { bg: "bg-rose-50/80 dark:bg-rose-950/30", border: "border-l-rose-500", title: "text-rose-900 dark:text-rose-100", message: "text-rose-800/80 dark:text-rose-200/80", icon: "text-rose-500", dismiss: "text-rose-400 hover:text-rose-600", actionText: "text-rose-700 hover:text-rose-900 dark:text-rose-300", Icon: FiAlertCircle },
  info: { bg: "bg-blue-50/80 dark:bg-blue-950/30", border: "border-l-blue-500", title: "text-blue-900 dark:text-blue-100", message: "text-blue-800/80 dark:text-blue-200/80", icon: "text-blue-500", dismiss: "text-blue-400 hover:text-blue-600", actionText: "text-blue-700 hover:text-blue-900 dark:text-blue-300", Icon: FiInfo },
};

export default function AlertBanner({ title, message, type = "warning", action, onClose }: AlertBannerProps) {
  const c = typeConfig[type];
  const Icon = c.Icon;

  return (
    <div className={`${c.bg} rounded-xl border-l-4 ${c.border} px-5 py-4`}>
      <div className="flex items-start gap-3.5">
        <Icon className={`mt-0.5 flex-shrink-0 ${c.icon}`} style={{ width: 22, height: 22 }} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${c.title}`}>{title}</p>
          <p className={`text-sm mt-1 leading-relaxed ${c.message}`}>{message}</p>
          {action && (
            <button onClick={action.onClick} className={`mt-2.5 text-sm font-medium inline-flex items-center gap-1.5 ${c.actionText}`}>
              {action.label} <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className={`p-1 rounded-lg ${c.dismiss} hover:bg-black/5 dark:hover:bg-white/5`}>
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
