import { useState } from "react";
import { IntroGrid, PrimaryButton, TextArea } from "./_shared";

const CATEGORIES = [
  { name: "Personal", examples: ["Learning about yourself", "Planning goals", "Fostering friendships", "Social events", "Seeing family", "Learning new skills"] },
  { name: "Physical", examples: ["Safe housing & medical wellness", "Eating healthy", "Exercise", "Sleep", "Massages", "Taking a walk", "Physical affection"] },
  { name: "Psychological", examples: ["Self-reflection", "Therapy", "Consume/create art", "Relax", "Read a self-help book", "Joining a support group"] },
  { name: "Emotional", examples: ["Self-love & self-compassion", "Laughing", "Buying yourself a treat", "Practising forgiveness", "Crying", "Emotional release"] },
  { name: "Spiritual", examples: ["Going into nature", "Spiritual community", "Meditate", "Being inspired", "Volunteering", "Reflection on beliefs"] },
  { name: "Professional", examples: ["Taking lunch / breaks", "Setting boundaries", "Logging off", "Planning career moves", "Days off when needed", "Support from colleagues"] },
] as const;

type Scores = Record<string, number>;

export default function SelfCareWheel() {
  const [step, setStep] = useState<"intro" | "rate" | "reflect" | "summary">("intro");
  const [scores, setScores] = useState<Scores>(() => Object.fromEntries(CATEGORIES.map((c) => [c.name, 5])));
  const [reflections, setReflections] = useState({ balance: "", surprise: "", attention: "", goals: "" });

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A visual check-in on your wellbeing across six dimensions — physical, psychological, emotional, personal, spiritual, and professional."
            why="Self-care is holistic, not just relaxing. The wheel shows where you're balanced and where you may be lacking."
            how={<ol className="list-decimal pl-4 space-y-1.5"><li>Rate each area 1–10.</li><li>See the shape of your wheel.</li><li>Reflect and set one small goal.</li></ol>}
          />
          <PrimaryButton onClick={() => setStep("rate")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "rate" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Rate your satisfaction</h2>
            <p className="text-sm text-muted-foreground mt-1">1 = very low, 10 = very high. Use the examples for ideas.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {CATEGORIES.map((c) => (
              <div key={c.name} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{c.name}</h3>
                  <span className="text-2xl font-semibold tabular-nums">{scores[c.name]}</span>
                </div>
                <input type="range" min={1} max={10} value={scores[c.name]} onChange={(e) => setScores({ ...scores, [c.name]: Number(e.target.value) })} className="w-full mt-2 accent-[hsl(var(--primary))]" />
                <p className="text-xs text-muted-foreground mt-2"><span className="font-medium">Examples: </span>{c.examples.join(" · ")}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep("intro")} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            <PrimaryButton onClick={() => setStep("reflect")}>See your wheel →</PrimaryButton>
          </div>
        </section>
      )}

      {(step === "reflect" || step === "summary") && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your self-care wheel</h2>
          <div className="rounded-xl border border-border bg-card p-6 flex justify-center">
            <RadarChart scores={scores} categories={CATEGORIES.map((c) => c.name)} />
          </div>
          {step === "reflect" && (
            <>
              <div className="space-y-4">
                <Reflect label="How balanced is your wheel?" value={reflections.balance} onChange={(v) => setReflections({ ...reflections, balance: v })} />
                <Reflect label="What surprised you about your ratings?" value={reflections.surprise} onChange={(v) => setReflections({ ...reflections, surprise: v })} />
                <Reflect label="Which areas need attention?" value={reflections.attention} onChange={(v) => setReflections({ ...reflections, attention: v })} />
                <Reflect label="What small goal could lift one area by 1 or 2?" value={reflections.goals} onChange={(v) => setReflections({ ...reflections, goals: v })} />
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep("rate")} className="text-sm text-muted-foreground hover:text-foreground">← Edit ratings</button>
                <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
              </div>
            </>
          )}
          {step === "summary" && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(reflections).map(([k, v]) => v && (
                  <div key={k} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{k}</p>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{v}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setStep("reflect")} className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-secondary">← Back</button>
                <button onClick={() => window.print()} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">Print / Save PDF</button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function Reflect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <TextArea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2" />
    </div>
  );
}

function RadarChart({ scores, categories }: { scores: Record<string, number>; categories: readonly string[] }) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 60;
  const n = categories.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, value: number) => {
    const a = angle(i);
    const d = (value / 10) * r;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
  };
  const polygon = categories.map((c, i) => point(i, scores[c]).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[420px]" role="img" aria-label="Self-care wheel">
      {[2, 4, 6, 8, 10].map((g) => (
        <polygon key={g} points={categories.map((_, i) => point(i, g).join(",")).join(" ")} fill="none" stroke="hsl(var(--border))" strokeWidth={1} />
      ))}
      {categories.map((_, i) => {
        const [x, y] = point(i, 10);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth={1} />;
      })}
      <polygon points={polygon} fill="hsl(var(--primary))" fillOpacity={0.25} stroke="hsl(var(--primary))" strokeWidth={2} />
      {categories.map((c, i) => {
        const [x, y] = point(i, 11.5);
        return <text key={c} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground" fontSize={12} fontWeight={500}>{c} · {scores[c]}</text>;
      })}
    </svg>
  );
}
