import { useMemo, useState } from "react";
import { Field, IntroGrid, TextArea } from "./_shared";

const LEGEND = [
  { mark: ".", action: "Pause, breathe, change direction", color: "bg-primary/15 text-primary" },
  { mark: ",", action: "Brief pause, breathe", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  { mark: "—", action: "Swipe your arm", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  { mark: "?", action: "Clap your hands", color: "bg-sky-500/15 text-sky-700 dark:text-sky-400" },
  { mark: "!", action: "Jump in place", color: "bg-pink-500/15 text-pink-700 dark:text-pink-400" },
  { mark: ":", action: "Snap your fingers", color: "bg-violet-500/15 text-violet-700 dark:text-violet-400" },
];

const STYLE: Record<string, string> = {
  ".": "bg-primary/20 text-primary",
  ",": "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  "—": "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  "-": "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  "?": "bg-sky-500/20 text-sky-700 dark:text-sky-300",
  "!": "bg-pink-500/20 text-pink-700 dark:text-pink-300",
  ":": "bg-violet-500/20 text-violet-700 dark:text-violet-300",
};

export default function WalkAndTalk() {
  const [text, setText] = useState("");

  const highlighted = useMemo(() => {
    const parts = text.split(/([.,?!:—-])/g);
    return parts.map((p, i) => {
      const cls = STYLE[p];
      if (cls) return <span key={i} className={`rounded px-1 mx-0.5 font-bold ${cls}`}>{p}</span>;
      return <span key={i}>{p}</span>;
    });
  }, [text]);

  return (
    <div className="space-y-8">
      <IntroGrid
        what="A movement-based rehearsal: walk forward as you speak, change direction at every full stop, and add a small action for each other punctuation mark."
        why="Movement engages body and mind together. You'll build clearer articulation, awareness of punctuation, and pacing — and remember the text more deeply."
        how="Paste your text, learn the legend, then deliver it aloud while moving. Afterwards, deliver it again standing still and notice the difference."
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-3">Movement legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {LEGEND.map((l) => (
            <div key={l.mark} className="flex items-center gap-2 rounded-md border border-border p-2">
              <span className={`inline-flex w-7 h-7 items-center justify-center rounded font-bold ${l.color}`}>{l.mark}</span>
              <span className="text-xs">{l.action}</span>
            </div>
          ))}
        </div>
      </div>

      <Field label="Your text" hint="Punctuation will be highlighted so you can see where to move.">
        <TextArea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a paragraph from your speech or presentation." />
      </Field>

      {text && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold mb-3">Highlighted text</h3>
          <p className="text-base leading-relaxed whitespace-pre-wrap">{highlighted}</p>
          <p className="text-xs text-muted-foreground mt-4">If you run out of breath in a long sentence, that's the text telling you to add a comma — or simplify.</p>
        </div>
      )}
    </div>
  );
}
