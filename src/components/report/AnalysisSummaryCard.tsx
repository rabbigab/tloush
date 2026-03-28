import type { ReportSummary } from "@/types";
import { Calendar, Building2, Clock, AlertTriangle, CheckCircle, Info } from "lucide-react";
import clsx from "clsx";

interface AnalysisSummaryCardProps {
  summary: ReportSummary;
  generatedAt: string;
}

export default function AnalysisSummaryCard({ summary, generatedAt }: AnalysisSummaryCardProps) {
  const alertColors = {
    none:   { bg: "bg-success/10",  border: "border-success/20",  text: "text-success",  icon: CheckCircle,     label: "Aucune alerte détectée" },
    low:    { bg: "bg-brand-50",    border: "border-brand-200",   text: "text-brand-600", icon: Info,            label: "Points à vérifier" },
    medium: { bg: "bg-warning/10",  border: "border-warning/20",  text: "text-warning",  icon: AlertTriangle,   label: "Points importants à vérifier" },
    high:   { bg: "bg-danger/10",   border: "border-danger/20",   text: "text-danger",   icon: AlertTriangle,   label: "Anomalies à traiter" },
  };

  const alert = alertColors[summary.alertLevel];
  const AlertIcon = alert.icon;
  const date = new Date(generatedAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="card">
      {/* Alerte globale */}
      <div className={clsx("flex items-center gap-3 rounded-xl p-4 border mb-6", alert.bg, alert.border)}>
        <AlertIcon size={22} className={clsx(alert.text, "shrink-0")} />
        <div className="flex-1">
          <p className={clsx("font-bold text-base", alert.text)}>{alert.label}</p>
          <p className="text-xs text-neutral-500">
            {summary.alertCount} point{summary.alertCount > 1 ? "s" : ""} à examiner
          </p>
        </div>
        <div className="text-right">
          <div className={clsx(
            "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full",
            summary.confidenceLevel === "high"   && "bg-success/20 text-success",
            summary.confidenceLevel === "medium" && "bg-warning/20 text-warning",
            summary.confidenceLevel === "low"    && "bg-danger/20 text-danger",
          )}>
            Extraction :{" "}
            {summary.confidenceLevel === "high"   ? "bonne" :
             summary.confidenceLevel === "medium" ? "partielle" : "limitée"}
          </div>
        </div>
      </div>

      {/* Infos principales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="flex items-start gap-2.5">
          <Calendar size={16} className="text-neutral-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-neutral-400">Période analysée</p>
            <p className="text-sm font-semibold text-neutral-800">{summary.period}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Building2 size={16} className="text-neutral-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-neutral-400">Employeur</p>
            <p className="text-sm font-semibold text-neutral-800 leading-tight">{summary.employer}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Clock size={16} className="text-neutral-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-neutral-400">Type de rémunération</p>
            <p className="text-sm font-semibold text-neutral-800">{summary.payType}</p>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-neutral-300 mt-4 text-right">Rapport généré le {date}</p>
    </div>
  );
}
