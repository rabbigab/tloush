"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Info, AlertTriangle, XCircle, Trash2, Clock, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { FinalReport } from "@/types";

const STORAGE_KEY = "tloush_analysis_history";

interface SavedReport {
  id: string;
  savedAt: string;
  report: FinalReport;
}

const ALERT_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  none: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Aucune anomalie" },
  low: { icon: Info, color: "text-brand-600", bg: "bg-brand-50", label: "Attention legere" },
  medium: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "A verifier" },
  high: { icon: XCircle, color: "text-danger", bg: "bg-danger/10", label: "Alerte importante" },
};

export default function HistoryPage() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedReport[];
        setReports(
          parsed.sort(
            (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
          )
        );
      }
    } catch {
      setReports([]);
    }
  }, []);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      const updated = reports.filter((r) => r.id !== id);
      setReports(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link
          href="/analyze"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Retour
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Mes analyses</h1>
        <p className="text-neutral-500 text-sm mb-8">
          Retrouvez vos analyses de fiches de paie precedentes.
        </p>

        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
            <div className="text-4xl mb-3">📄</div>
            <p className="font-semibold text-neutral-700 mb-1">Aucune analyse sauvegardee</p>
            <p className="text-sm text-neutral-500 mb-4">
              Vos prochaines analyses seront automatiquement enregistrees ici.
            </p>
            <Link href="/analyze" className="btn-primary text-sm py-2 px-4">
              Analyser ma fiche de paie
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((saved) => {
              const level = saved.report.summary.alertLevel || "none";
              const config = ALERT_CONFIG[level] || ALERT_CONFIG.none;
              const Icon = config.icon;
              return (
                <div
                  key={saved.id}
                  className="bg-white rounded-2xl border border-neutral-100 p-5 hover:border-neutral-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={"p-2 rounded-xl shrink-0 " + config.bg}>
                        <Icon size={16} className={config.color} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-800 text-sm">
                          {saved.report.summary.employer || "Employeur inconnu"}{" — "}
                          {saved.report.summary.period || "Periode inconnue"}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {saved.report.summary.alertCount > 0
                            ? saved.report.summary.alertCount + " point(s) a verifier"
                            : "Aucune anomalie detectee"}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5 text-neutral-400" style={{fontSize: "11px"}}>
                          <Clock size={11} />
                          <span>{new Date(saved.savedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(saved.id)}
                      className={"shrink-0 text-xs px-2.5 py-1.5 rounded-lg transition-colors " + (confirmDelete === saved.id ? "bg-danger text-white" : "text-neutral-400 hover:text-danger")}
                    >
                      {confirmDelete === saved.id ? "Confirmer" : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
