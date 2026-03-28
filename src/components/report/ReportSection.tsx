import type { PayrollDocument } from "@/types";

interface ReportSectionProps {
  doc: PayrollDocument;
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-neutral-50 last:border-0">
      <div>
        <p className="text-sm text-neutral-700 font-medium">{label}</p>
        {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
      </div>
      <span className="text-sm font-bold text-neutral-900 text-right shrink-0">{value}</span>
    </div>
  );
}

const fmt = (v: number | null, unit = "₪") =>
  v !== null ? `${v.toLocaleString("fr-FR")} ${unit}` : "Non identifié";

export default function ReportSection({ doc }: ReportSectionProps) {
  return (
    <div className="space-y-4">
      {/* Salaires */}
      <div className="card">
        <h4 className="font-semibold text-neutral-700 text-sm mb-3 flex items-center gap-2">
          <span className="text-lg">💰</span> Salaires
        </h4>
        <Row label="Salaire de base"   value={fmt(doc.baseSalary)} />
        <Row label="Salaire brut"      value={fmt(doc.grossSalary)} />
        <Row label="Salaire net"       value={fmt(doc.netSalary)}   sub="Montant versé sur votre compte" />
        {doc.hourlyRate   && <Row label="Taux horaire"      value={fmt(doc.hourlyRate, "₪/h")} />}
        {doc.regularHours && <Row label="Heures normales"   value={fmt(doc.regularHours, "heures")} />}
        {doc.overtimeHours !== null && (
          <Row label="Heures supplémentaires" value={fmt(doc.overtimeHours, "heures")} />
        )}
      </div>

      {/* Déductions */}
      <div className="card">
        <h4 className="font-semibold text-neutral-700 text-sm mb-3 flex items-center gap-2">
          <span className="text-lg">📊</span> Déductions détectées
        </h4>
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${doc.nationalInsuranceDetected ? "bg-success/10 text-success" : "bg-neutral-100 text-neutral-400"}`}>
            {doc.nationalInsuranceDetected ? "✓" : "✗"} Bituah Leumi
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${doc.incomeTaxDetected ? "bg-success/10 text-success" : "bg-neutral-100 text-neutral-400"}`}>
            {doc.incomeTaxDetected ? "✓" : "✗"} Impôt
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${doc.pensionDetected ? "bg-success/10 text-success" : "bg-neutral-100 text-neutral-400"}`}>
            {doc.pensionDetected ? "✓" : "✗"} Pension
          </span>
        </div>
        {doc.rawLines
          .filter((l) => l.value !== null && l.value < 0)
          .map((l, i) => (
            <Row
              key={i}
              label={l.frenchLabel}
              value={`−${Math.abs(l.value!).toLocaleString("fr-FR")} ₪`}
            />
          ))}
        {doc.totalDeductions && (
          <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between">
            <span className="text-sm font-bold text-neutral-700">Total déductions</span>
            <span className="text-sm font-bold text-danger">
              −{Math.abs(doc.totalDeductions).toLocaleString("fr-FR")} ₪
            </span>
          </div>
        )}
      </div>

      {/* Congés & Maladie */}
      {(doc.leaveBalance !== null || doc.sickBalance !== null) && (
        <div className="card">
          <h4 className="font-semibold text-neutral-700 text-sm mb-3 flex items-center gap-2">
            <span className="text-lg">🏖️</span> Congés & Maladie
          </h4>
          {doc.leaveBalance !== null && (
            <Row label="Solde congés restants"  value={`${doc.leaveBalance} jours`} sub="Jours disponibles à votre crédit" />
          )}
          {doc.sickBalance !== null && (
            <Row label="Solde maladie restants" value={`${doc.sickBalance} jours`} sub="Jours de maladie cumulés" />
          )}
        </div>
      )}

      {/* Toutes les lignes */}
      <details className="card">
        <summary className="cursor-pointer font-semibold text-neutral-600 text-sm flex items-center gap-2 select-none">
          <span className="text-lg">📋</span>
          Toutes les lignes de la fiche ({doc.rawLines.length})
          <span className="ml-auto text-xs text-neutral-400">Cliquer pour développer</span>
        </summary>
        <div className="mt-4 space-y-1">
          {doc.rawLines.map((l, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0 gap-4">
              <div>
                <p className="text-xs font-medium text-neutral-700">{l.frenchLabel}</p>
                <p className="text-[10px] text-neutral-400" dir="rtl">{l.hebrewLabel}</p>
              </div>
              {l.value !== null ? (
                <span className={`text-xs font-bold ${l.value < 0 ? "text-danger" : "text-neutral-800"}`}>
                  {l.value < 0 ? "−" : "+"}
                  {Math.abs(l.value).toLocaleString("fr-FR")}{" "}
                  {l.unit === "ILS" ? "₪" : l.unit}
                </span>
              ) : (
                <span className="text-xs text-neutral-300 italic">—</span>
              )}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
