// ============================================================
// REPORT HISTORY -- Service de gestion de l'historique (localStorage)
// ============================================================
// Sauvegarde automatiquement les rapports d'analyse
// dans le navigateur (jusqu'a 10 rapports)
// ============================================================

import type { FinalReport } from "@/types";

const STORAGE_KEY = "tloush_report_history";
const MAX_REPORTS = 10;

export interface SavedReport {
  id: string;
  savedAt: string;           // ISO timestamp
  period: string;            // "Avril 2024"
  employer: string;
  netSalary: number | null;
  alertLevel: "none" | "low" | "medium" | "high";
  report: FinalReport;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function saveReport(report: FinalReport): SavedReport {
  const saved: SavedReport = {
    id: generateId(),
    savedAt: new Date().toISOString(),
    period: report.summary.period,
    employer: report.summary.employer,
    netSalary: report.extractedData.netSalary,
    alertLevel: report.summary.alertLevel,
    report,
  };

  try {
    const existing = getReports();
    const updated = [saved, ...existing].slice(0, MAX_REPORTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage plein ou non disponible (SSR) - ignorer silencieusement
  }

  return saved;
}

export function getReports(): SavedReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedReport[];
  } catch {
    return [];
  }
}

export function getReportById(id: string): SavedReport | null {
  return getReports().find((r) => r.id === id) ?? null;
}

export function deleteReport(id: string): void {
  try {
    const updated = getReports().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getReportCount(): number {
  return getReports().length;
}
