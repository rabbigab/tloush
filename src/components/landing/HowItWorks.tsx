import { Upload, FileSearch, ClipboardList, FileText } from "lucide-react";

const STEPS = [
  { icon: Upload, number: "01", title: "Téléversez votre fiche", desc: "Glissez-déposez votre tloush (PDF ou photo). Votre document n'est utilisé que pour l'analyse.", color: "bg-brand-50 text-brand-600" },
  { icon: FileSearch, number: "02", title: "Vérifiez l'extraction", desc: "Notre système identifie et traduit les lignes hébraïques. Vous corrigez si nécessaire.", color: "bg-purple-50 text-purple-600" },
  { icon: ClipboardList, number: "03", title: "Répondez au questionnaire", desc: "Quelques questions sur votre situation : congés, heures sup, ancienneté…", color: "bg-amber-50 text-amber-600" },
  { icon: FileText, number: "04", title: "Recevez votre rapport", desc: "Un rapport clair en français : ce qui est cohérent, ce qui est à vérifier, les questions à poser.", color: "bg-green-50 text-green-600" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-neutral-900 mb-3">Comment ça marche ?</h2>
        <p className="text-neutral-500 max-w-xl mx-auto text-base">Un parcours guidé en 4 étapes, sans jargon technique ni hébreu obligatoire.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${step.color}`}><Icon size={20} /></div>
                <span className="text-3xl font-black text-neutral-100">{step.number}</span>
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 mb-1 text-base">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
