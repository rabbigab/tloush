"use client";

import type { EmployerQuestion } from "@/types";
import { MessageSquare, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

interface EmployerQuestionsCardProps {
  questions: EmployerQuestion[];
}

function QuestionItem({ q }: { q: EmployerQuestion }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(q.question);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex items-start gap-3 bg-neutral-50 rounded-xl p-4 border border-neutral-100 hover:border-brand-200 transition-all">
      <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <MessageSquare size={13} className="text-brand-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-800 leading-snug mb-1">
          « {q.question} »
        </p>
        <p className="text-xs text-neutral-400 leading-relaxed italic">{q.context}</p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center bg-white opacity-0 group-hover:opacity-100 transition-all hover:border-brand-300"
        title="Copier la question"
      >
        {copied ? (
          <CheckCheck size={13} className="text-success" />
        ) : (
          <Copy size={13} className="text-neutral-400" />
        )}
      </button>
    </div>
  );
}

export default function EmployerQuestionsCard({ questions }: EmployerQuestionsCardProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-500 leading-relaxed">
        Ces questions sont formulées pour être posées directement à votre employeur ou service RH.
        Vous pouvez les copier et les envoyer par email.
      </p>
      <div className="space-y-2.5">
        {questions.map((q) => (
          <QuestionItem key={q.id} q={q} />
        ))}
      </div>
    </div>
  );
}
