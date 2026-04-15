"use client";

import { useMemo, useState } from "react";
import { Copy, Check, RefreshCw, Download } from "lucide-react";
import type { LetterTemplate } from "@/data/templates";

interface Props {
  template: LetterTemplate;
}

function renderTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = values[key];
    if (!v || !v.trim()) return `[${key}]`;
    return v;
  });
}

function formatDateFR(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TemplateFiller({ template }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Format date fields for rendering (ISO -> "15 avril 2026")
  const displayValues = useMemo(() => {
    const result: Record<string, string> = {};
    for (const field of template.fields) {
      const raw = values[field.key] || "";
      result[field.key] = field.type === "date" ? formatDateFR(raw) : raw;
    }
    // Add some niceties: wrap reason in a paragraph if provided,
    // prepend file number with "réf. " if provided
    if (result.reason && result.reason.trim()) {
      result.reason = `Motif : ${result.reason}`;
    }
    if (result.endDate && result.endDate.trim()) {
      result.endDate = ` jusqu'au ${result.endDate}`;
    }
    if (result.fileNumber && result.fileNumber.trim()) {
      result.fileNumber = ` (dossier n° ${result.fileNumber})`;
    }
    return result;
  }, [values, template.fields]);

  const generated = useMemo(
    () => renderTemplate(template.templateFR, displayValues),
    [template.templateFR, displayValues],
  );

  function handleChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the textarea content
    }
  }

  function handleDownload() {
    const blob = new Blob([generated], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.slug}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setValues({});
  }

  const requiredCount = template.fields.filter((f) => f.required).length;
  const filledRequiredCount = template.fields.filter(
    (f) => f.required && values[f.key]?.trim(),
  ).length;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-neutral-900">Remplir le modèle</h2>
          <span className="text-xs text-neutral-500">
            {filledRequiredCount}/{requiredCount} champs obligatoires
          </span>
        </div>

        <div className="space-y-4">
          {template.fields.map((field) => {
            const value = values[field.key] || "";
            const id = `field-${field.key}`;
            return (
              <div key={field.key}>
                <label
                  htmlFor={id}
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-0.5">*</span>
                  )}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={id}
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                  />
                ) : (
                  <input
                    id={id}
                    type={field.type}
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={12} />
            Réinitialiser
          </button>
          <p className="text-xs text-neutral-400">
            Les champs non remplis apparaîtront en{" "}
            <code className="text-neutral-600">[crochets]</code>
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-neutral-900">Aperçu</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs bg-brand-600 hover:bg-brand-700 text-white font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} /> Copié !
                </>
              ) : (
                <>
                  <Copy size={14} /> Copier
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="text-xs bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} /> .txt
            </button>
          </div>
        </div>
        <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-4 flex-1 min-h-[300px]">
          <pre className="text-xs text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed">
            {generated}
          </pre>
        </div>
      </div>
    </div>
  );
}
