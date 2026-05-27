import type { ReactNode } from "react";

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

export function IntroGrid({ what, why, how }: { what: ReactNode; why: ReactNode; how: ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <InfoCard title="What">{what}</InfoCard>
      <InfoCard title="Why">{why}</InfoCard>
      <InfoCard title="How">{how}</InfoCard>
    </div>
  );
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 ${props.className ?? ""}`}>
      {children}
    </button>
  );
}

export function GhostButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-secondary disabled:opacity-40 ${props.className ?? ""}`}>
      {children}
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${props.className ?? ""}`} />;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${props.className ?? ""}`} />;
}
