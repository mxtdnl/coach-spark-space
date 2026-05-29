import { useState } from "react";
import { IntroGrid, PrimaryButton, TextInput } from "./_shared";

type Q = "do" | "schedule" | "delegate" | "delete";
type Task = { id: string; text: string; q: Q };

const META: Record<Q, { title: string; sub: string; eg: string; tone: string }> = {
  do: { title: "Do Now", sub: "Important · Urgent", eg: "Assignments, team meetings, wellbeing needs", tone: "border-primary/40 bg-primary/5" },
  schedule: { title: "Schedule It", sub: "Important · Not Urgent", eg: "Self-reflection, socialising, training", tone: "border-emerald-500/40 bg-emerald-500/5" },
  delegate: { title: "Delegate", sub: "Not Important · Urgent", eg: "Chores, replying to emails", tone: "border-amber-500/40 bg-amber-500/5" },
  delete: { title: "Delete or Reduce", sub: "Not Important · Not Urgent", eg: "Doomscrolling, over-analysis", tone: "border-muted bg-card" },
};

export default function UrgentImportant() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState<Q>("do");

  const add = () => {
    if (!draft.trim()) return;
    setTasks((t) => [...t, { id: crypto.randomUUID(), text: draft.trim(), q }]);
    setDraft("");
  };

  const move = (id: string, newQ: Q) => setTasks((t) => t.map((x) => (x.id === id ? { ...x, q: newQ } : x)));

  return (
    <div className="space-y-8">
      <IntroGrid
        what="The Eisenhower Matrix — sort each task by urgency and importance to decide what actually deserves your attention."
        why="Research shows we naturally favour urgent-but-unimportant tasks over important ones with bigger payoffs. This makes the trade-off visible."
        how="Add each task and place it into a quadrant. Drag between quadrants by clicking the small chips."
      />

      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-2">
          <TextInput placeholder="Task" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <select value={q} onChange={(e) => setQ(e.target.value as Q)} className="rounded-md border border-input bg-card px-3 py-2 text-sm">
            {(Object.keys(META) as Q[]).map((k) => <option key={k} value={k}>{META[k].title}</option>)}
          </select>
          <PrimaryButton onClick={add}>Add</PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(META) as Q[]).map((k) => (
          <div key={k} className={`rounded-xl border p-4 min-h-[180px] ${META[k].tone}`}>
            <h4 className="font-semibold">{META[k].title}</h4>
            <p className="text-xs text-muted-foreground">{META[k].sub}</p>
            <p className="text-xs italic text-muted-foreground mt-1">e.g. {META[k].eg}</p>
            <ul className="mt-3 space-y-2">
              {tasks.filter((t) => t.q === k).map((t) => (
                <li key={t.id} className="rounded-md border border-border bg-background/60 p-2 text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <span>{t.text}</span>
                    <button onClick={() => setTasks((arr) => arr.filter((x) => x.id !== t.id))} className="text-xs text-muted-foreground hover:text-destructive">×</button>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(Object.keys(META) as Q[]).filter((o) => o !== k).map((o) => (
                      <button key={o} onClick={() => move(t.id, o)} className="text-[10px] rounded border border-border px-1.5 py-0.5 hover:bg-secondary">
                        → {META[o].title}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
