import { useEffect, useRef, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const DEFAULT_AREAS = ["Finances", "Physical Environment", "Personal Growth", "Health", "Career", "Relationships", "Academics", "Fun & Recreation"] as const;

const REFLECTIONS = [
  { key: "balance", label: "How balanced is your wheel?" },
  { key: "surprise", label: "What has surprised you about how you've ranked each area?" },
  { key: "attention", label: "Which areas need attention?" },
  { key: "goals", label: "What goal could lift one area by 1? By 2?" },
] as const;

export default function WheelOfLife() {
  const [step, setStep] = usePersistentState<"intro" | "rate" | "summary">("wheel-of-life", "step", "intro");
  const [areas] = useState<string[]>([...DEFAULT_AREAS]);
  const [scores, setScores] = usePersistentState<Record<string, number>>("wheel-of-life", "scores", () => Object.fromEntries(DEFAULT_AREAS.map((a) => [a, 5])));
  const [notes, setNotes] = usePersistentState<Record<string, string>>("wheel-of-life", "notes", {});

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A visual snapshot of your satisfaction across eight life areas."
            why="Balance matters. The wheel shows where you're thriving and where things need attention."
            how={<ol className="list-decimal pl-4 space-y-1.5"><li>Drag each dot along its spoke to rate that area.</li><li>Watch your wheel reshape live.</li><li>Reflect and set a small goal.</li></ol>}
          />
          <PrimaryButton onClick={() => setStep("rate")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "rate" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Drag each dot</h2>
            <p className="text-sm text-muted-foreground mt-1">Outward = more satisfaction (10). Inward = less (1). The shape morphs as you drag.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 flex justify-center">
            <DraggableRadar scores={scores} setScores={setScores} categories={areas} />
          </div>

          <div className="space-y-4">
            {REFLECTIONS.map((r) => (
              <Field key={r.key} label={r.label}>
                <TextArea rows={3} value={notes[r.key] ?? ""} onChange={(e) => setNotes({ ...notes, [r.key]: e.target.value })} />
              </Field>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your wheel of life</h2>
          <div className="rounded-xl border border-border bg-card p-6 flex justify-center">
            <DraggableRadar scores={scores} setScores={setScores} categories={areas} readOnly />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {REFLECTIONS.map((r) => notes[r.key] && (
              <div key={r.key} className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{r.label}</p>
                <p className="mt-2 text-sm whitespace-pre-wrap">{notes[r.key]}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("rate")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}

export function DraggableRadar({
  scores,
  setScores,
  categories,
  readOnly = false,
}: {
  scores: Record<string, number>;
  setScores: (s: Record<string, number>) => void;
  categories: readonly string[];
  readOnly?: boolean;
}) {
  const size = 460;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 90;
  const n = categories.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, value: number) => {
    const a = angle(i);
    const d = (value / 10) * r;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
  };

  const svgRef = useRef<SVGSVGElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (dragIdx === null) return;
    const move = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * size - cx;
      const y = ((e.clientY - rect.top) / rect.height) * size - cy;
      const a = angle(dragIdx);
      const proj = x * Math.cos(a) + y * Math.sin(a);
      const v = Math.max(1, Math.min(10, Math.round((proj / r) * 10)));
      setScores({ ...scores, [categories[dragIdx]]: v });
    };
    const up = () => setDragIdx(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragIdx, scores, setScores, categories, r, cx, cy]);

  const polygon = categories.map((c, i) => point(i, scores[c]).join(",")).join(" ");

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[480px] touch-none select-none"
      role="img"
      aria-label="Interactive wheel of life"
    >
      {[2, 4, 6, 8, 10].map((g) => (
        <polygon
          key={g}
          points={categories.map((_, i) => point(i, g).join(",")).join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray={g === 10 ? "0" : "2 3"}
        />
      ))}
      {categories.map((_, i) => {
        const [x, y] = point(i, 10);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth={1} />;
      })}
      <polygon
        points={polygon}
        fill="var(--primary)"
        fillOpacity={0.22}
        stroke="var(--primary)"
        strokeWidth={2}
        style={{ transition: dragIdx === null ? "all 180ms ease-out" : "none" }}
      />
      {categories.map((c, i) => {
        const [x, y] = point(i, scores[c]);
        const isActive = dragIdx === i || hover === i;
        return (
          <g key={c}>
            {!readOnly && (
              <circle
                cx={x}
                cy={y}
                r={22}
                fill="transparent"
                style={{ cursor: "grab" }}
                onPointerDown={(e) => {
                  (e.target as Element).setPointerCapture(e.pointerId);
                  setDragIdx(i);
                }}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={isActive ? 11 : 8}
              fill="var(--primary)"
              stroke="var(--background)"
              strokeWidth={2}
              style={{ pointerEvents: "none", transition: dragIdx === null ? "r 120ms" : "none" }}
            />
          </g>
        );
      })}
      {categories.map((c, i) => {
        const [x, y] = point(i, 11.5);
        return (
          <text key={c + "-label"} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground" fontSize={11} fontWeight={600}>
            {c} · {scores[c]}
          </text>
        );
      })}
    </svg>
  );
}
