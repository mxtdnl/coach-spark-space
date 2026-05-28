import { useState } from "react";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const DEFAULT_AREAS = ["Finances", "Physical Environment", "Personal Growth", "Health", "Career", "Relationships", "Academics", "Fun & Recreation"] as const;

const REFLECTIONS = [
  { key: "balance", label: "How balanced is your wheel?" },
  { key: "surprise", label: "What has surprised you about how you've ranked each area?" },
  { key: "attention", label: "Which areas need attention?" },
  { key: "goals", label: "What goal could lift one area by 1? By 2?" },
] as const;

export default function WheelOfLife() {
  const [step, setStep] = useState<"intro" | "rate" | "reflect" | "summary">("intro");
  const [areas] = useState<string[]>([...DEFAULT_AREAS]);
  const [scores, setScores] = useState<Record<string, number>>(() => Object.fromEntries(DEFAULT_AREAS.map((a) => [a, 5])));
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A visual snapshot of your satisfaction across eight life areas."
            why="Balance matters. The wheel shows where you're thriving and where things need attention."
            how={<ol className="list-decimal pl-4 space-y-1.5"><li>Rate each area 1–10.</li><li>See the shape of your wheel.</li><li>Reflect and set a small goal.</li></ol>}
          />
          <PrimaryButton onClick={() => setStep("rate")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "rate" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Rate each area</h2>
            <p className="text-sm text-muted-foreground mt-1">1 = very low satisfaction, 10 = very high.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {areas.map((a) => (
              <div key={a} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{a}</h3>
                  <span className="text-2xl font-semibold tabular-nums">{scores[a]}</span>
                </div>
                <input type="range" min={1} max={10} value={scores[a]} onChange={(e) => setScores({ ...scores, [a]: Number(e.target.value) })} className="w-full mt-2 accent-[hsl(var(--primary))]" />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("reflect")}>See your wheel →</PrimaryButton>
          </div>
        </section>
      )}

      {(step === "reflect" || step === "summary") && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your wheel of life</h2>
          <div className="rounded-xl border border-border bg-card p-6 flex justify-center">
            <RadarChart scores={scores} categories={areas} />
          </div>
          {step === "reflect" && (
            <>
              <div className="space-y-4">
                {REFLECTIONS.map((r) => (
                  <Field key={r.key} label={r.label}>
                    <TextArea rows={3} value={notes[r.key] ?? ""} onChange={(e) => setNotes({ ...notes, [r.key]: e.target.value })} />
                  </Field>
                ))}
              </div>
              <div className="flex justify-between">
                <GhostButton onClick={() => setStep("rate")}>← Edit ratings</GhostButton>
                <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
              </div>
            </>
          )}
          {step === "summary" && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                {REFLECTIONS.map((r) => notes[r.key] && (
                  <div key={r.key} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{r.label}</p>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{notes[r.key]}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                <GhostButton onClick={() => setStep("reflect")}>← Back</GhostButton>
                <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function RadarChart({ scores, categories }: { scores: Record<string, number>; categories: readonly string[] }) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 80;
  const n = categories.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, value: number) => {
    const a = angle(i);
    const d = (value / 10) * r;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
  };
  const polygon = categories.map((c, i) => point(i, scores[c]).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[460px]" role="img" aria-label="Wheel of life">
      {[2, 4, 6, 8, 10].map((g) => (
        <polygon key={g} points={categories.map((_, i) => point(i, g).join(",")).join(" ")} fill="none" stroke="hsl(var(--border))" strokeWidth={1} />
      ))}
      {categories.map((_, i) => {
        const [x, y] = point(i, 10);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth={1} />;
      })}
      <polygon points={polygon} fill="hsl(var(--primary))" fillOpacity={0.25} stroke="hsl(var(--primary))" strokeWidth={2} />
      {categories.map((c, i) => {
        const [x, y] = point(i, 11.4);
        return <text key={c} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground" fontSize={11} fontWeight={500}>{c} · {scores[c]}</text>;
      })}
    </svg>
  );
}
