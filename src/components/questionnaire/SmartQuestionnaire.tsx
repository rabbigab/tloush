"use client";

import { useState } from "react";
import type { UserContext } from "@/types";
import {
  QUESTIONS,
  QUESTION_BLOCKS,
  getVisibleQuestions,
} from "@/lib/questionnaireLogic";
import type { Question } from "@/types";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";

interface SmartQuestionnaireProps {
  initialContext: UserContext;
  onComplete: (ctx: UserContext) => void;
}

function QuestionField({
  question,
  value,
  onChange,
  inputId,
}: {
  question: Question;
  value: unknown;
  onChange: (v: unknown) => void;
  inputId?: string;
}) {
  if (question.type === "boolean") {
    return (
      <div className="flex gap-3">
        {[
          { v: true,  label: "Oui" },
          { v: false, label: "Non" },
        ].map(({ v, label }) => (
          <button
            key={String(v)}
            onClick={() => onChange(v)}
            className={clsx(
              "flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all",
              value === v
                ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                : "bg-white border-neutral-200 text-neutral-600 hover:border-brand-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "select" && question.options) {
    return (
      <select
        id={inputId}
        className="input-field text-sm"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">Choisissez une option…</option>
        {question.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (question.type === "number") {
    return (
      <input
        id={inputId}
        type="number"
        min={0}
        className="input-field text-sm"
        placeholder="Entrez un nombre…"
        value={(value as number) ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
      />
    );
  }

  if (question.type === "date") {
    return (
      <input
        id={inputId}
        type="date"
        className="input-field text-sm"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      />
    );
  }

  return null;
}

export default function SmartQuestionnaire({
  initialContext,
  onComplete,
}: SmartQuestionnaireProps) {
  const [ctx, setCtx] = useState<UserContext>({ ...initialContext });
  const [blockIndex, setBlockIndex] = useState(0);

  const blockIds = QUESTION_BLOCKS.map((b) => b.id);
  const currentBlock = QUESTION_BLOCKS[blockIndex];
  const currentBlockId = blockIds[blockIndex];
  const visibleQuestions = getVisibleQuestions(ctx, currentBlockId);

  const updateCtx = (id: keyof UserContext, value: unknown) => {
    setCtx((prev) => ({ ...prev, [id]: value }));
  };

  const isLastBlock = blockIndex === QUESTION_BLOCKS.length - 1;

  const handleNext = () => {
    if (isLastBlock) {
      onComplete(ctx);
    } else {
      setBlockIndex((i) => i + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {QUESTION_BLOCKS.map((block, i) => (
          <button
            key={block.id}
            onClick={() => setBlockIndex(i)}
            className={clsx(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
              i === blockIndex
                ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                : i < blockIndex
                ? "bg-neutral-100 text-neutral-500 border-neutral-200"
                : "bg-white text-neutral-400 border-neutral-200"
            )}
          >
            {i < blockIndex && "✓ "}
            {block.id}. {block.title}
          </button>
        ))}
      </div>
      <div className="card bg-gradient-to-r from-brand-50 to-white border-brand-100">
        <h3 className="font-bold text-neutral-800 text-base mb-1">Bloc {currentBlock.id} — {currentBlock.title}</h3>
        <p className="text-sm text-neutral-500">{currentBlock.description}</p>
      </div>
      <div className="space-y-5">
        {visibleQuestions.map((q) => {
          const inputId = `q-${q.id}`
          const isInteractiveLabel = q.type !== 'boolean'
          return (
            <div key={q.id} className="card animate-fade-in-up">
              <div className="mb-3">
                <label
                  htmlFor={isInteractiveLabel ? inputId : undefined}
                  className="font-semibold text-neutral-800 text-sm leading-snug block mb-1"
                >
                  {q.label}{q.required && <span className="text-danger ml-1">*</span>}
                </label>
                {q.helpText && (
                  <div className="flex items-start gap-1.5 mt-1">
                    <HelpCircle size={13} className="text-neutral-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-neutral-400 leading-relaxed">{q.helpText}</p>
                  </div>
                )}
              </div>
              <QuestionField question={q} value={ctx[q.id]} onChange={(v) => updateCtx(q.id, v)} inputId={isInteractiveLabel ? inputId : undefined} />
            </div>
          )
        })}
      </div>
      {visibleQuestions.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-neutral-400 text-sm">Aucune question pour ce bloc selon vos réponses précédentes.</p>
        </div>
      )}
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setBlockIndex((i) => Math.max(0, i - 1))} disabled={blockIndex === 0} className="btn-ghost disabled:opacity-40">
          <ChevronLeft size={16} /> Précédent
        </button>
        <span className="text-xs text-neutral-400">Bloc {blockIndex + 1} / {QUESTION_BLOCKS.length}</span>
        <button onClick={handleNext} className="btn-primary px-6 py-2.5 text-sm">
          {isLastBlock ? "Générer mon rapport" : "Suivant"}{!isLastBlock && <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
}
