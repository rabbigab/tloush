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

const fmt = (v: number | null, unit = "ILS") => {
  if (v === null) return "Non identifie";
  if (unit === "ILS") return v.toLocaleString("fr-FR") + " ILS";
  return v.toLocaleString("fr-FR") + " " + unit;
};

export default function ReportSection({ doc }: ReportSectionProps) {
  // Fallback: extraire leave/sick depuis rawLines si top-level null
  const leaveFromRaw = doc.rawLines.find(l => l.normalizedKey === "leaveBalance" && l.value !== null);
  const sickFromRaw  = doc.rawLines.find(l => l.normalizedKey === "sickBalance"  && l.value !== null);
  const leaveBalance = doc.leaveBalance ?? (leaveFromRaw?.value ?? null);
  const sickBalance  = doc.sickBalance  ?? (sickFromRaw?.value  ?? null);

  // Lignes de conges prises ce mois (vacationPay / sickPay)
  const vacationPayLine = doc.rawLines.find(l => l.normalizedKey === "vacationPay");
  const sickPayLine     = doc.rawLines.find(l => l.normalizedKey === "sickPay");

  return (
    <div className="space-y-4">
      {/* Salaires */}
      <div className="card">
        <h4 className="font-semibold text-neutral-700 text-sm mb-3 flex items-center gap-2">
          <span className="text-lg">💰</span> Salaires
        </h4>
        <Row label="Salaire de base"   value={fmt(doc.baseSalary)} />
        <Row label="Salaire brut"      value={fmt(doc.grossSalary)} />
        <Row label="Salaire net"       value={fmt(doc.netSalary)} sub="Montant verse sur votre compte" />
        {doc.hourlyRate   ? <Row label="Taux horaire"      value={fmt(doc.hourlyRate, "ILS/h")} /> : null}
        {doc.regularHours ? <Row label="Heures normales"   value={fmt(doc.regularHours, "heures")} /> : null}
        {doc.overtimeHours !== null && (
          <Row label="Heures supplementaires" value={fmt(doc.overtimeHours, "heures")} />
        )}
      </div>

      {/* Deductions */}
      <div className="card">
        <h4 className="font-semibold text-neutral-700 text-sm mb-3 flex items-center gap-2">
          <span className="text-lg">📊</span> Deductions detectees
        </h4>
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${doc.nationalInsuranceDetected ? "bg-success/10 text-success" : "bg-neutral-100 text-neutral-400"}`}>
            {doc.nationalInsuranceDetected ? "✓" : "✗"} Bituah Leumi
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${doc.incomeTaxDetected ? "bg-success/10 text-success" : "bg-neutral-100 text-neutral-400"}`}>
            {doc.incomeTaxDetected ? "✓" : "✗"} Impot
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
              value={`−${Math.abs(l.value!).toLocaleString("fr-FR")} ILS`}
            />
          ))}
        {doc.totalDeductions ? (
          <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between">
            <span className="text-sm font-bold text-neutral-700">Total deductions</span>
            <span className="text-sm font-bold text-danger">
              −{Math.abs(doc.totalDeductions).toLocaleString("fr-FR")} ILS
            </span>
          </div>
        ) : null}
      </div>

      {/* Conges & Maladie */}
      <div className="card">
        <h4 className="font-semibold text-neutral-700 text-sm mb-3 flex items-center gap-2">
          <span className="text-lg">🏖️</span> Conges & Maladie
        </h4>
        {leaveBalance !== null ? (
          <Row
            label="Solde conges payes restants"
            value={`${leaveBalance} jour${leaveBalance !== 1 ? "s" : ""}`}
            sub="Jours disponibles a votre credit (yitrat chofsha)"
          />
        ) : (
          <Row label="Solde conges payes" value="Non detecte sur la fiche" sub="Cherchez la ligne yitrat chofsha en bas de page" />
        )}
        {vacationPayLine && vacationPayLine.value !== null && (
          <Row
            label="Conges pris ce mois"
            value={`${Math.abs(vacationPayLine.value)} ${vacationPayLine.unit === "days" ? "jours" : "ILS"}`}
            sub="Conges utilises sur cette periode"
          />
        )}
        {sickBalance !== null ? (
          <Row
            label="Solde maladie restants"
            value={`${sickBalance} jour${sickBalance !== 1 ? "s" : ""}`}
            sub="Jours de maladie disponibles (yitrat machala)"
          />
        ) : (
          <Row label="Solde maladie" value="Non detecte sur la fiche" sub="Cherchez la ligne yitrat machala en bas de page" />
        )}
        {sickPayLine && sickPayLine.value !== null && (
          <Row
            label="Jours maladie ce mois"
            value={`${Math.abs(sickPayLine.value)} ${sickPayLine.unit === "days" ? "jours" : "ILS"}`}
            sub="Jours maladie sur cette periode"
          />
        )}
      </div>

      {/* Toutes les lignes */}
      <details className="card">
        <summary className="cursor-pointer font-semibold text-neutral-600 text-sm flex items-center gap-2 select-none">
          <span className="text-lg">📋</span>
          Toutes les lignes de la fiche ({doc.rawLines.length})
          <span className="ml-auto text-xs text-neutral-400">Cliquer pour developper</span>
        </summary>
        <div className="mt-4 space-y-1">
          {doc.rawLines.map((l, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0 gap-4">
              <div>
                <p className="text-xs font-medium text-neutral-700">{l.frenchLabel}</p>
                <p className="text-[10px] text-neutral-400" dir="rtl">{l.hebrewLabel}</p>
              </div>
              {l.value !== null ? (
                <span className={`text-xs font-bold ${l.unit === "days" || l.unit === "hours" ? "text-brand-600" : l.value < 0 ? "text-danger" : "text-neutral-800"}`}>
                  {l.unit === "days" || l.unit === "hours" ? "" : l.value < 0 ? "−" : "+"}
                  {Math.abs(l.value).toLocaleString("fr-FR")}{" "}
                  {l.unit === "ILS" ? "ILS" : l.unit === "days" ? "jours" : l.unit === "hours" ? "h" : l.unit}
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
