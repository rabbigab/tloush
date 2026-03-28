"use client";

import { useState } from "react";
import type { AnalysisFlag } from "@/types";
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import clsx from "clsx";

interface WarningCardProps {
  flag: AnalysisFlag;
}

const SEVERITY_CONFIG = {
  high: {
    border: "border-danger/30",
    bg:     "bg-danger/5",
    badge:  "badge-severity-high",
    icon:   AlertTriangle,
    iconColor: "text-danger",
    label:  "Alerte importante",
  },
  medium: {
    border: "border-warning/30",
    bg:     "bg-warning/5",
    badge:  "badge-severity-medium",
    icon:   AlertCircle,
    iconColor: "text-warning",
    label:  "À vérifier",
  },
  low: {
    border: "border-brand-200",
    bg:     "bg-brand-50/50",
    badge:  "badge-severity-low",
    icon:   Info,
    iconColor: "text-brand-500",
    label:  "Point d'attention",
  },
};

export default function WarningCard({ flag }: WarningCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[flag.severity];
  const SeverityIcon = cfg.icon;

  return (
    <div className={clsx("rounded-xl border p-4 transition-all", cfg.border, cfg.bg)}>
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <SeverityIcon size={18} className={clsx(cfg.iconColor, "mt-0.5 shrink-0")} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cfg.badge}>{cfg.label}</span>
          </div>
          <p className="font-semibold text-neutral-800 text-sm">{flag.title}</p>
          <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{flag.message}</p>
        </div>
        <button className="shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-3 animate-fade-in-up">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Pourquoi c'est important
            </p>
            <p className="text-xs text-neutral-600 leading-relaxed">{flag.explanation}</p>
          </div>
          <div className="flex items-start gap-2 bg-white rounded-lg p-3 border border-neutral-100">
            <Lightbulb size={13} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-neutral-600 mb-0.5">Que faire ?</p>
              <p className="text-xs text-neutral-500 leading-relaxed">{flag.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
