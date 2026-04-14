"use client";

import { useState } from "react";
import type { PayrollDocument, PayrollRawLine } from "@/types";
import ConfidenceBadge from "@/components/shared/ConfidenceBadge";
import { Edit2, AlertCircle, CheckCircle } from "lucide-react";
import clsx from "clsx";

interface ExtractionReviewFormProps {
  document: PayrollDocument;
  onConfirm: (updated: PayrollDocument) => void;
}

function fieldId(label: string) {
  return 'field-' + label.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
}

function NumericField({ label, value, onChange, unit = "₪" }: { label: string; value: number | null; onChange: (v: number | null) => void; unit?: string; }) {
  const id = fieldId(label)
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
      <div className="relative">
        <input id={id} type="number" className="input-field pr-10 text-sm" placeholder="Non détecté" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">{unit}</span>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string | null; onChange: (v: string | null) => void; placeholder?: string; }) {
  const id = fieldId(label)
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
      <input id={id} type="text" className="input-field text-sm" placeholder={placeholder ?? "Non détecté"} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)} />
    </div>
  );
}

export default function ExtractionReviewForm({ document: doc, onConfirm }: ExtractionReviewFormProps) {
  const [data, setData] = useState<PayrollDocument>({ ...doc });
  const [editingLines, setEditingLines] = useState(false);
  const update = (partial: Partial<PayrollDocument>) => setData((prev) => ({ ...prev, ...partial }));
  const unknownLines = data.rawLines.filter((l) => l.normalizedKey === "unknown");
  const identifiedLines = data.rawLines.filter((l) => l.normalizedKey !== "unknown");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="section-title">Vérifiez les informations extraites</h3>
          <p className="text-sm text-neutral-500">Notre système a identifié ces données. Corrigez si nécessaire.</p>
        </div>
        <ConfidenceBadge score={data.confidenceScore} />
      </div>
      {data.confidenceScore < 70 && (
        <div className="flex items-start gap-3 bg-warning/10 border border-warning/20 rounded-xl p-4">
          <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
          <p className="text-xs text-warning font-medium">La qualité d'extraction est partielle. Vérifiez attentivement les champs ci-dessous.</p>
        </div>
      )}
      <div className="card">
        <h4 className="font-semibold text-neutral-700 text-sm mb-4">Informations générales</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Nom de l'employeur" value={data.employerName} onChange={(v) => update({ employerName: v })} placeholder="Ex : חברת ABC" />
          <TextField label="Nom du salarié" value={data.employeeName} onChange={(v) => update({ employeeName: v })} placeholder="Ex : David Cohen" />
          <TextField label="Période" value={data.period} onChange={(v) => update({ period: v })} placeholder="Ex : Avril 2024" />
          <TextField label="Date de paiement" value={data.paymentDate} onChange={(v) => update({ paymentDate: v })} placeholder="Ex : 30/04/2024" />
        </div>
      </div>
      <div className="card">
        <h4 className="font-semibold text-neutral-700 text-sm mb-4">Salaires principaux (₪)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumericField label="Salaire de base" value={data.baseSalary} onChange={(v) => update({ baseSalary: v })} />
          <NumericField label="Salaire brut" value={data.grossSalary} onChange={(v) => update({ grossSalary: v })} />
          <NumericField label="Salaire net" value={data.netSalary} onChange={(v) => update({ netSalary: v })} />
        </div>
      </div>
      <div className="card">
        <h4 className="font-semibold text-neutral-700 text-sm mb-4">Heures travaillées</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumericField label="Taux horaire" value={data.hourlyRate} onChange={(v) => update({ hourlyRate: v })} unit="₪/h" />
          <NumericField label="Heures normales" value={data.regularHours} onChange={(v) => update({ regularHours: v })} unit="h" />
          <NumericField label="Heures supplémentaires" value={data.overtimeHours} onChange={(v) => update({ overtimeHours: v })} unit="h" />
        </div>
      </div>
      <div className="card">
        <h4 className="font-semibold text-neutral-700 text-sm mb-4">Congés & Maladie</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumericField label="Solde congés restants (jours)" value={data.leaveBalance} onChange={(v) => update({ leaveBalance: v })} unit="j" />
          <NumericField label="Solde maladie restants (jours)" value={data.sickBalance} onChange={(v) => update({ sickBalance: v })} unit="j" />
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={() => onConfirm(data)} className="btn-primary px-8 py-3">Continuer vers le questionnaire →</button>
      </div>
    </div>
  );
}
