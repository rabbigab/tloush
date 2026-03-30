"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { templates } from "@/data/templates";
import { ChevronLeft, Copy, CheckCircle2, Download } from "lucide-react";

export default function TemplateGeneratorPage({ params }: { params: { slug: string } }) {
  const template = templates.find((t) => t.slug === params.slug);
  if (!template) notFound();

  const [values, setValues] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const generateLetter = () => {
    let letter = template.templateFR;
    Object.entries(values).forEach(([k, v]) => {
      letter = letter.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), v || `[${k}]`);
    });
    letter = letter.replace(/{{(\w+)}}/g, "[$1 à compléter]");
    setGenerated(letter);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([generated], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tloush-${template.slug}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allFilled = template.fields
    .filter((f) => f.required)
    .every((f) => values[f.key]?.trim());

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link href="/modeles" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-600 mb-6">
          <ChevronLeft size={14} /> Modèles de lettres
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{template.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{template.title}</h1>
            <p className="text-sm text-neutral-500">{template.description}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <h2 className="font-semibold text-neutral-800 mb-4 text-sm">1. Remplissez les informations</h2>
            <div className="space-y-3">
              {template.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    {field.label} {field.required && <span className="text-danger">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea rows={3} value={values[field.key] || ""} onChange={(e) => handleChange(field.key, e.target.value)} placeholder={field.placeholder} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none" />
                  ) : (
                    <input type={field.type} value={values[field.key] || ""} onChange={(e) => handleChange(field.key, e.target.value)} placeholder={field.placeholder} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                  )}
                </div>
              ))}
            </div>
            <button onClick={generateLetter} disabled={!allFilled} className="btn-primary w-full mt-4 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Générer ma lettre
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-neutral-800 text-sm">2. Votre lettre générée</h2>
              {generated && (
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
                    {copied ? <CheckCircle2 size={13} className="text-success" /> : <Copy size={13} />}
                    {copied ? "Copié !" : "Copier"}
                  </button>
                  <button onClick={downloadTxt} className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 font-medium">
                    <Download size={13} /> .txt
                  </button>
                </div>
              )}
            </div>
            {generated ? (
              <pre className="text-xs text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed bg-neutral-50 rounded-xl p-4 max-h-96 overflow-y-auto">{generated}</pre>
            ) : (
              <div className="h-48 flex items-center justify-center text-neutral-300 bg-neutral-50 rounded-xl">
                <div className="text-center">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-xs">Remplissez le formulaire et cliquez sur &quot;Générer&quot;</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-warning/10 border border-warning/20 rounded-2xl p-4">
          <p className="text-xs text-neutral-600">
            ⚠️ Ce modèle est fourni à titre indicatif. Pour les situations complexes,{" "}
            <Link href="/experts?specialite=droit-travail" className="text-brand-600 underline font-medium">
              consultez un avocat francophone
            </Link>
            {" "}avant envoi.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
