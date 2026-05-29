import { useState } from "react";
import { Field, IntroGrid, TextArea, TextInput } from "./_shared";

const CELLS = [
  { key: "im_b", label: "Benefits — Immediate" },
  { key: "im_c", label: "Costs — Immediate" },
  { key: "lt_b", label: "Benefits — Long-term" },
  { key: "lt_c", label: "Costs — Long-term" },
] as const;

type CellKey = typeof CELLS[number]["key"];

function Grid({ title, vals, set }: { title: string; vals: Record<CellKey, string>; set: (k: CellKey, v: string) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CELLS.map((c) => (
          <Field key={c.key} label={c.label}>
            <TextArea rows={4} value={vals[c.key]} onChange={(e) => set(c.key, e.target.value)} />
          </Field>
        ))}
      </div>
    </div>
  );
}

export default function DecisionGrid() {
  const [decision, setDecision] = useState("");
  const empty = { im_b: "", im_c: "", lt_b: "", lt_c: "" } as Record<CellKey, string>;
  const [yes, setYes] = useState(empty);
  const [no, setNo] = useState(empty);

  return (
    <div className="space-y-8">
      <IntroGrid
        what="A 2×2 grid to weigh a difficult decision — the benefits and costs of acting, against those of staying the same."
        why="Big decisions are easier when you get them out of your head and onto paper. Equal attention to each option makes the choice more objective."
        how="Name the decision, then fill in both grids with similar care. Revisit over a few days for bigger choices."
      />

      <Field label="What are you trying to decide?">
        <TextInput value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="e.g. Should I switch majors?" />
      </Field>

      <Grid title="If I make this decision" vals={yes} set={(k, v) => setYes((s) => ({ ...s, [k]: v }))} />
      <Grid title="If things stay the same" vals={no} set={(k, v) => setNo((s) => ({ ...s, [k]: v }))} />

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm text-muted-foreground">
        Tip: don't decide today. Come back tomorrow with a fresh head — new costs or benefits often appear.
      </div>
    </div>
  );
}
