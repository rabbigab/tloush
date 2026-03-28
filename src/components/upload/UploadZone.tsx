"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import clsx from "clsx";

interface UploadZoneProps {
  onFileAccepted: (file: File) => void;
}

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_SIZE_MB = 10;

export default function UploadZone({ onFileAccepted }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ name: string; size: string; type: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return "Format non supporté. Accepté : PDF, JPG, PNG.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `Fichier trop volumineux. Maximum : ${MAX_SIZE_MB} Mo.`;
    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    const err = validate(file);
    if (err) { setError(err); return; }
    setPreview({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + " Mo", type: file.type === "application/pdf" ? "PDF" : "Image" });
    onFileAccepted(file);
  }, [onFileAccepted]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => { setPreview(null); setError(null); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={clsx("relative cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200", dragOver ? "border-brand-500 bg-brand-50 scale-[1.01]" : "border-neutral-200 bg-neutral-50 hover:border-brand-300 hover:bg-brand-50/40")}
        >
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={onInputChange} />
          <div className="flex flex-col items-center gap-4">
            <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center transition-colors", dragOver ? "bg-brand-100" : "bg-white shadow-soft")}>
              <Upload size={28} className={dragOver ? "text-brand-600" : "text-neutral-400"} />
            </div>
            <div>
              <p className="font-semibold text-neutral-800 text-base mb-1">{dragOver ? "Lâchez le fichier ici" : "Glissez votre fiche de paie ici"}</p>
              <p className="text-sm text-neutral-500 mb-3">ou{" "}<span className="text-brand-600 font-semibold underline underline-offset-2">cliquez pour parcourir</span></p>
              <p className="text-xs text-neutral-400">PDF, JPG, PNG — Max {MAX_SIZE_MB} Mo</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 bg-success/10 border border-success/20 rounded-2xl p-4">
          <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={22} className="text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <CheckCircle size={14} className="text-success" />
              <p className="font-semibold text-neutral-800 text-sm truncate">{preview.name}</p>
            </div>
            <p className="text-xs text-neutral-500">{preview.type} · {preview.size}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); clearFile(); }} className="w-8 h-8 bg-white rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 shrink-0">
            <X size={14} className="text-neutral-400" />
          </button>
        </div>
      )}
      {error && <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">{error}</div>}
      <p className="text-xs text-neutral-400 text-center">🔒 Votre document n'est pas conservé.</p>
    </div>
  );
}
