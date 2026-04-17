"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Gift, Copy, Check, ExternalLink, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

const FB_GROUPS = [
  { name: "Coup de Pouce Netanya", url: "https://www.facebook.com/groups/coupdepoucenetanya" },
  { name: "Francophones Ashdod", url: "https://www.facebook.com/groups/francophonesashdod" },
  { name: "Olim Hadera", url: "https://www.facebook.com/groups/olimhadera" },
  { name: "Tel Aviv Francophones", url: "https://www.facebook.com/groups/telavivfrancophones" },
  { name: "Jérusalem Francophone", url: "https://www.facebook.com/groups/jerusalemfrancophone" },
];

const SHARE_MESSAGE = `🇫🇷 Les francophones en Israël, vous en avez marre de galérer avec l'administratif israélien ?

Je viens de découvrir Tloush — un outil qui simplifie TOUT :
✅ Analyse tes fiches de paie en 2 secondes
✅ Détecte toutes les aides auxquelles tu as droit (il y en a 125 !)
✅ Traduit et explique n'importe quel document hébreu
✅ Calcule tes droits (congés, pitzuim, remboursements d'impôts)

Tout en français, pensé pour les francophones.

Ils offrent 1 mois gratuit en ce moment 👉 https://tloush.com/parrainage

#TloushIsrael #FrancophonesEnIsrael #VieEnIsrael`;

const MAX_CODES = 200;

type SubmitState = "idle" | "loading" | "success" | "error" | "already_submitted" | "not_logged_in";

export default function ParrainagePage() {
  const [copied, setCopied] = useState(false);
  const [postUrl, setPostUrl] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [existingShare, setExistingShare] = useState<{ status: string; promo_code: string | null } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
      if (data.user) {
        supabase
          .from("social_shares")
          .select("status, promo_code")
          .eq("user_id", data.user.id)
          .maybeSingle()
          .then(({ data: share }) => {
            if (share) setExistingShare(share);
          });
      }
    });
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(SHARE_MESSAGE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!postUrl.trim()) return;

    setSubmitState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/parrainage/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_url: postUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setSubmitState("not_logged_in");
        } else if (res.status === 409) {
          setSubmitState("already_submitted");
        } else {
          setSubmitState("error");
          setErrorMsg(data.error || "Une erreur est survenue.");
        }
        return;
      }

      setSubmitState("success");
    } catch {
      setSubmitState("error");
      setErrorMsg("Erreur réseau. Vérifiez votre connexion.");
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 mb-4">
            <Gift size={32} className="text-brand-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            1 mois gratuit
          </h1>
          <p className="text-neutral-500 max-w-md mx-auto text-sm">
            Partagez Tloush dans un groupe Facebook francophone en Israël et
            recevez <strong>1 mois d'abonnement offert</strong> après validation.
          </p>
          <p className="text-xs text-neutral-400 mt-2">
            Offre limitée aux {MAX_CODES} premiers participants.
          </p>
        </div>

        {/* Existing share status */}
        {existingShare && (
          <div className={clsx(
            "rounded-xl border px-4 py-3 mb-8 flex items-start gap-3",
            existingShare.status === "approved" && "bg-emerald-50 border-emerald-200",
            existingShare.status === "pending" && "bg-amber-50 border-amber-200",
            existingShare.status === "rejected" && "bg-red-50 border-red-200",
          )}>
            {existingShare.status === "approved" ? (
              <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : existingShare.status === "pending" ? (
              <Loader2 size={20} className="text-amber-600 shrink-0 mt-0.5 animate-spin" />
            ) : (
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              {existingShare.status === "approved" && (
                <>
                  <p className="text-sm font-semibold text-emerald-800">Votre partage a été validé !</p>
                  {existingShare.promo_code && (
                    <p className="text-sm text-emerald-700 mt-1">
                      Code promo : <span className="font-mono font-bold bg-white px-2 py-0.5 rounded">{existingShare.promo_code}</span>
                    </p>
                  )}
                </>
              )}
              {existingShare.status === "pending" && (
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">En attente de validation.</span> Nous vérifions votre post, réponse sous 48h.
                </p>
              )}
              {existingShare.status === "rejected" && (
                <p className="text-sm text-red-800">
                  <span className="font-semibold">Partage non validé.</span> Le post n'a pas été retrouvé dans un groupe éligible.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 1 : Groupes éligibles */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-sm font-bold">1</span>
            <h2 className="font-semibold text-neutral-900">Choisissez un groupe</h2>
          </div>
          <div className="space-y-2">
            {FB_GROUPS.map((g) => (
              <a
                key={g.name}
                href={g.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl px-4 py-3 hover:border-brand-300 hover:shadow-sm transition-all group"
              >
                <span className="text-sm font-medium text-neutral-800 group-hover:text-brand-700">{g.name}</span>
                <ExternalLink size={14} className="text-neutral-400 group-hover:text-brand-500" />
              </a>
            ))}
          </div>
        </section>

        {/* Step 2 : Message */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-sm font-bold">2</span>
            <h2 className="font-semibold text-neutral-900">Copiez et postez ce message</h2>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4 relative">
            <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed">
              {SHARE_MESSAGE}
            </pre>
            <button
              onClick={handleCopy}
              className={clsx(
                "absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                copied
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-brand-50 text-brand-700 hover:bg-brand-100"
              )}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
        </section>

        {/* Step 3 : Submit */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-sm font-bold">3</span>
            <h2 className="font-semibold text-neutral-900">Envoyez-nous le lien du post</h2>
          </div>

          {isLoggedIn === false && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">
                <strong>Connexion requise.</strong>{" "}
                <a href="/auth/login?redirect=/parrainage" className="underline font-semibold">Connectez-vous</a>{" "}
                ou <a href="/auth/register" className="underline font-semibold">créez un compte gratuit</a> pour soumettre votre post.
              </p>
            </div>
          )}

          {!existingShare && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.facebook.com/groups/..."
                required
                disabled={isLoggedIn === false || submitState === "loading" || submitState === "success"}
                className="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-neutral-100 disabled:text-neutral-400"
              />
              <button
                type="submit"
                disabled={isLoggedIn === false || submitState === "loading" || submitState === "success" || !postUrl.trim()}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-neutral-300 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {submitState === "loading" ? (
                  <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                ) : submitState === "success" ? (
                  <><CheckCircle size={16} /> Demande envoyée !</>
                ) : (
                  "Envoyer pour validation"
                )}
              </button>
            </form>
          )}

          {submitState === "success" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mt-3 flex items-start gap-3">
              <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">
                Merci ! Votre demande sera validée sous <strong>48 heures</strong>. Vous recevrez votre code promo par email.
              </p>
            </div>
          )}
          {submitState === "already_submitted" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3">
              <p className="text-sm text-amber-800">Vous avez déjà soumis un partage. Un seul code par utilisateur.</p>
            </div>
          )}
          {submitState === "not_logged_in" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mt-3">
              <p className="text-sm text-blue-900">
                <a href="/auth/login?redirect=/parrainage" className="underline font-semibold">Connectez-vous</a> pour soumettre.
              </p>
            </div>
          )}
          {submitState === "error" && errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-3">
              <p className="text-sm text-red-800">{errorMsg}</p>
            </div>
          )}
        </section>

        {/* Rules */}
        <div className="bg-neutral-100 rounded-xl px-4 py-3 text-xs text-neutral-500 space-y-1">
          <p><strong>Règles :</strong></p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>1 code promo par utilisateur</li>
            <li>Le post doit être public et visible dans le groupe</li>
            <li>Offre limitée aux {MAX_CODES} premiers codes</li>
            <li>Validation manuelle sous 48h</li>
            <li>Le code est valable 30 jours après activation</li>
          </ul>
        </div>
      </div>
      <Footer />
    </main>
  );
}
