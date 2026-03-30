"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getReports, deleteReport, type SavedReport } from "@/lib/reportHistory";
import { useAnalysisStore } from "@/store/analysisStore";
import {
  Trash2, ArrowRight, Clock, AlertTriangle,
  CheckCircle2, FileText, XCircle, Info
} from "lucide-react";

const ALERT_CONFIG = {
  none:   { bg: "bg-success/10",  border: "border-success/20",  text: "text-success",    Icon: CheckCircle2,  label: "Aucune anomalie" },
  low:    { bg: "bg-brand-50",    border: "border-brand-100",   text: "text-brand-600",  Icon: Info,          label: "Attention faible" },
  medium: { bg: "bg-warning/10",  border: "border-warning/20",  text: "text-warning",    Icon: AlertTriangle, label: "A verifier" },
  high:   { bg: "bg-danger/10",   border: "border-danger/20",   text: "text-danger",     Icon: XCircle,       label: "Alerte importante" },
} as const;

export default function HistoryPage() {
  const router = useRouter();
  const { setFinalReport } = useAnalysisStore();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setReports(getReports());
    setLoaded(true);
  }, []);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteReport(id);
      setReports(getReports());
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  const handleReopen = (saved: SavedReport) => {
    setFinalReport(saved.report);
    router.push("/results");
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* En-tete */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900 mb-1">Mes analyses</h1>
            <p className="text-sm text-neutral-500">
              Vos rapports sont stockes uniquement dans ce navigateur.
              Ils disparaitront si vous videz le cache.
            </p>
          </div>
          <Link href="/analyze" className="btn-primary text-sm py-2 px-4 shrink-0">
            Nouvelle analyse
          </Link>
        </div>

        {/* Contenu */}
        {!loaded ? (
          <div className="card text-center py-12 text-neutral-400 text-sm">Chargement...</div>
        ) : reports.length === 0 ? (
          <div className="card text-center py-16">
            <FileText size={44} className="text-neutral-200 mx-auto mb-4" />
            <p className="font-semibold text-neutral-700 mb-1 text-lg">Aucune analyse sauvegardee</p>
            <p className="text-sm text-neutral-500 mb-6 max-w-xs mx-auto">
              Vos prochains rapports apparaitront ici automatiquement apres chaque analyse.
            </p>
            <Link href="/analyze" className="btn-primary text-sm">
              Analyser ma premiere fiche
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((saved) => {
              const cfg = ALERT_CONFIG[saved.alertLevel];
              const Icon = cfg.Icon;

              return (
                <div
                  key={saved.id}
                  className={`card flex items-center gap-4 border ${cfg.border} transition-all`}
                >
                  {/* Icone niveau d'alerte */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon size={20} className={cfg.text} />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-800 text-sm truncate">
                      {saved.period}
                      {saved.employer && saved.employer !== "Employeur inconnu" && (
                        <span className="text-neutral-400 font-normal"> · {saved.employer}</span>
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                      {saved.netSalary !== null && (
                        <span className="text-xs text-neutral-400">
                          Net : {saved.netSalary.toLocaleString("fr-FR")} NIS
                        </span>
                      )}
                      <span className="text-xs text-neutral-300 flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(saved.savedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleReopen(saved)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Voir <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(saved.id)}
                      className={`text-xs py-1.5 px-2 rounded-lg transition-colors ${
                        confirmDelete === saved.id
                          ? "bg-danger text-white"
                          : "text-danger hover:bg-danger/10"
                      }`}
                      title={confirmDelete === saved.id ? "Cliquez encore pour confirmer" : "Supprimer"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Note de confidentialite */}
        {reports.length > 0 && (
          <p className="text-xs text-neutral-400 text-center mt-6">
            Ces rapports sont stockes localement dans votre navigateur et ne sont pas envoyes a nos serveurs.
          </p>
        )}
      </div>
      <Footer />
    </main>
  );
}
