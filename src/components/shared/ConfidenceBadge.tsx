import clsx from "clsx";

interface ConfidenceBadgeProps {
  score: number;
}

export default function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  const level = score >= 70 ? "high" : score >= 45 ? "medium" : "low";
  const label = level === "high" ? "Bonne confiance" : level === "medium" ? "Confiance partielle" : "Confiance limitée";
  const color = level === "high" ? "text-success bg-success/10 border-success/20" : level === "medium" ? "text-warning bg-warning/10 border-warning/20" : "text-danger bg-danger/10 border-danger/20";
  return (
    <span className={clsx("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", color)}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", level === "high" && "bg-success", level === "medium" && "bg-warning", level === "low" && "bg-danger")} />
      {label} ({score}%)
    </span>
  );
}
