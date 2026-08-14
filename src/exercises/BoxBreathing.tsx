import { useEffect, useRef, useState } from "react";
import { IntroGrid, PrimaryButton } from "./_shared";

const PHASES = ["Inhale", "Hold", "Exhale", "Hold"] as const;
type Phase = typeof PHASES[number];

export default function BoxBreathing() {
  const [secondsPerPhase, setSeconds] = useState(4);
  const [totalCycles, setTotalCycles] = useState(4);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick] = useState(secondsPerPhase);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setTick((t) => {
        if (t > 1) return t - 1;
        setPhaseIdx((p) => {
          const next = (p + 1) % 4;
          if (next === 0) {
            setCycle((c) => {
              if (c + 1 >= totalCycles) {
                setRunning(false);
                return 0;
              }
              return c + 1;
            });
          }
          return next;
        });
        return secondsPerPhase;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, secondsPerPhase, totalCycles]);

  const start = () => { setCycle(0); setPhaseIdx(0); setTick(secondsPerPhase); setRunning(true); };
  const stop = () => { setRunning(false); setCycle(0); setPhaseIdx(0); setTick(secondsPerPhase); };

  const phase: Phase = PHASES[phaseIdx];
  const progress = ((secondsPerPhase - tick) / secondsPerPhase) * 100;

  return (
    <div className="space-y-8">
      <IntroGrid
        what="A simple square-breathing technique: inhale, hold, exhale, hold — all for equal counts."
        why="Box breathing regulates the autonomic nervous system, pulling you out of stress and back into calm. It's discreet and works anywhere."
        how={<ol className="list-decimal pl-4 space-y-1.5"><li>Inhale 4 counts.</li><li>Hold 4 counts.</li><li>Exhale 4 counts.</li><li>Hold 4 counts. Repeat.</li></ol>}
      />

      <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-6">
        <BreathingBox phaseIdx={phaseIdx} progress={progress} running={running} />
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{running ? `Cycle ${cycle + 1} of ${totalCycles}` : "Ready"}</p>
          <p className="text-3xl font-semibold mt-1">{running ? phase : "Press start"}</p>
          {running && <p className="text-5xl font-bold tabular-nums mt-2 text-primary">{tick}</p>}
        </div>
        {!running && (
          <div className="flex items-center gap-6 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-muted-foreground">Seconds / phase</span>
              <select value={secondsPerPhase} onChange={(e) => { const v = Number(e.target.value); setSeconds(v); setTick(v); }} className="rounded-md border border-input bg-card px-2 py-1">
                {[3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-muted-foreground">Cycles</span>
              <select value={totalCycles} onChange={(e) => setTotalCycles(Number(e.target.value))} className="rounded-md border border-input bg-card px-2 py-1">
                {[2, 4, 6, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
        )}
        {!running ? <PrimaryButton onClick={start}>Start →</PrimaryButton> : (
          <button onClick={stop} className="rounded-full border border-border bg-card px-5 py-2 text-sm hover:bg-secondary">Stop</button>
        )}
      </div>
    </div>
  );
}

function BreathingBox({ phaseIdx, progress, running }: { phaseIdx: number; progress: number; running: boolean }) {
  // The dot travels along the perimeter of a square, one side per phase.
  // Side 0 (Inhale): top, left→right; Side 1 (Hold): right, top→bottom;
  // Side 2 (Exhale): bottom, right→left; Side 3 (Hold): left, bottom→top.
  const size = 260;
  const pad = 30;
  const inner = size - pad * 2;
  const p = running ? progress / 100 : 0;
  let dx = pad, dy = pad;
  if (phaseIdx === 0) { dx = pad + inner * p; dy = pad; }
  else if (phaseIdx === 1) { dx = pad + inner; dy = pad + inner * p; }
  else if (phaseIdx === 2) { dx = pad + inner * (1 - p); dy = pad + inner; }
  else if (phaseIdx === 3) { dx = pad; dy = pad + inner * (1 - p); }

  const r = 10;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-64 h-64">
      <rect x={pad} y={pad} width={inner} height={inner} fill="none" stroke="hsl(var(--border))" strokeWidth={2} rx={12} />
      <rect x={pad} y={pad} width={inner} height={inner} fill="hsl(var(--primary))" fillOpacity={0.08} rx={12} />
      <circle cx={dx} cy={dy} r={r * 2.2} fill="hsl(var(--primary))" fillOpacity={0.12} />
      <circle cx={dx} cy={dy} r={r} fill="hsl(var(--primary))" />
    </svg>
  );
}

