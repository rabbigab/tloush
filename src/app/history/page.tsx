"use client";

import { useState, useEffect } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Trash2,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { FinalReport } from "@/types";

const STORAGE_KEY = "tloush_analysis_history";

interface SavedReport {
  id: string;
  savedAt: string;
  report: FinalReport;
}

interface AlertConfig {
  icon: ElementType;
  color: string;
  bg: string;
  label: string;
}

const ALERT_CONFIG: Record<string, AlertConfig> = {
  none: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
    label: "Aucune anomalie",
  },
  low: {
    icon: Info,
    color: "text-brand-600",
    bg: "bg-brand-50",
    label: "Attention légère",
  },
  medium: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "À vérifier",
  },
  high: {
    icon: XCircle,
    color: "text-danger",
    bg: "bg-danger/10",
    label: "Alerte importante",
  },
};

export default function HistoryPage() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setReports(JSON.parse(raw) as SavedReport[]);
    } catch {
      // ignore
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

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Retour
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Mes analyses</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {reports.length === 0
                ? "Aucune analyse sauvegardée"
                : `${reports.length} analyse${reports.length > 1 ? "s" : ""} sauvegardée${reports.length > 1 ? "s" : ""}`}
            </p>
          </div>

          {reports.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Supprimer tout l'historique ?")) {
                  setReports([]);
                  localStorage.removeItem(STORAGE_KEY);
                }
              }}
              className="text-xs text-neutral-400 hover:text-danger transition-colors flex items-center gap-1"
            >
              <Trash2 size={12} />
              Tout effacer
            </button>
          )}
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
            <Clock size={32} className="text-neutral-300 mx-auto mb-3" />
            <p className="font-medium text-neutral-600 mb-1">
              Aucune analyse pour le moment
            </p>
            <p className="text-sm text-neutral-400 mb-4">
              Vos analyses de fiches de paie apparaîtront ici automatiquement.
            </p>
            <Link href="/analyze" className="btn-primary text-sm px-4 py-2">
              Analyser ma fiche de paie
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((saved) => {
              const level = saved.report.summary?.alertLevel ?? "none";
              const config: AlertConfig = ALERT_CONFIG[level] ?? ALERT_CONFIG.none;
              const Icon = config.icon;

              return (
                <div
                  key={saved.id}
                  className="bg-white rounded-2xl border border-neutral-100 p-4 flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                    <Icon size={18} className={config.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-800 text-sm truncate">
                      {saved.report.summary?.employer ?? "Employé inconnu"}
                    </p>
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {formatDate(saved.savedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                    <button
                      onClick={() => handleDelete(saved.id)}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                        confirmDelete === saved.id
                          ? "bg-danger text-white"
                          : "text-neutral-400 hover:text-danger hover:bg-danger/10"
                      }`}
                    >
                      {confirmDelete === saved.id ? "Confirmer" : <Trash2 size={13} />}
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
