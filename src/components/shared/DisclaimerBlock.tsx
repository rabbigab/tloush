import { AlertCircle } from "lucide-react";

interface DisclaimerBlockProps {
  compact?: boolean;
  text?: string;
}

const DEFAULT_TEXT =
  "Cet outil fournit une analyse indicative à des fins de compréhension uniquement. " +
  "Il ne remplace pas l'avis d'un avocat, d'un expert-comptable ou d'un conseiller en droit du travail. " +
  "Certaines vérifications nécessitent des documents complémentaires.";

export default function DisclaimerBlock({ compact = false, text }: DisclaimerBlockProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <AlertCircle size={13} />
        <span>Analyse indicative — ne remplace pas un professionnel</span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
      <AlertCircle size={18} className="text-neutral-400 mt-0.5 shrink-0" />
      <p className="text-xs text-neutral-500 leading-relaxed">{text ?? DEFAULT_TEXT}</p>
    </div>
  );
}
