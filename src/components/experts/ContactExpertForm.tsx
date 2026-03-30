"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  expertSlug: string;
  expertName: string;
}

export default function ContactExpertForm({ expertSlug, expertName }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/contact-expert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, expertSlug, expertName }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 size={40} className="text-success mx-auto mb-3" />
        <p className="font-semibold text-neutral-800 mb-1">Message envoyé !</p>
        <p className="text-sm text-neutral-500">{expertName} vous répondra dans les 48 heures.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Votre nom *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Prénom Nom" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="votre@email.com" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Téléphone (facultatif)</label>
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="05X-XXX-XXXX" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Décrivez votre situation *</label>
        <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="Ex : Je pense que mes heures supplémentaires ne sont pas payées correctement depuis 3 mois..." className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none" />
      </div>
      {status === "error" && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
      )}
      <button type="submit" disabled={status === "loading"} className="btn-primary w-full py-3 text-sm">
        {status === "loading" ? (
          <><Loader2 size={15} className="animate-spin" /> Envoi en cours...</>
        ) : (
          <><Send size={15} /> Envoyer ma demande</>
        )}
      </button>
      <p className="text-[11px] text-neutral-400 text-center">
        Vos coordonnées sont transmises uniquement à l&apos;expert sélectionné. Tloush ne les partage pas avec des tiers.
      </p>
    </form>
  );
}
