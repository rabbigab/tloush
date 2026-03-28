import { ShieldCheck, Lock, Eye, Scale } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, title: "Données confidentielles", desc: "Votre fiche n'est pas stockée ni partagée. L'analyse est locale.", color: "text-success", bg: "bg-success/10" },
  { icon: Lock, title: "Aucun compte requis", desc: "Pas d'inscription. Pas d'email. Juste votre fiche et votre analyse.", color: "text-brand-600", bg: "bg-brand-50" },
  { icon: Eye, title: "Analyse informative", desc: "Nous identifions les points à vérifier, pas de verdict définitif.", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: Scale, title: "Pas un cabinet juridique", desc: "Tloush est un outil d'aide à la compréhension, pas un avocat.", color: "text-purple-600", bg: "bg-purple-50" },
];

export default function TrustBadges() {
  return (
    <section className="bg-white border-t border-neutral-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-8">Ce que vous devez savoir</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="flex flex-col items-center text-center gap-3 p-4">
                <div className={`w-12 h-12 rounded-2xl ${badge.bg} flex items-center justify-center`}>
                  <Icon size={22} className={badge.color} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 text-sm mb-1">{badge.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
