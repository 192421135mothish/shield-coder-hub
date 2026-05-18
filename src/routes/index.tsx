import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, Activity, Bug, Cpu, LineChart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SecAI — Analyze, Detect, Protect" },
      { name: "description", content: "AI Secure Code Compiler — real-time vulnerability detection, attack simulation, and security dashboards." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pt-24 pb-32">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-xs uppercase tracking-[0.3em] text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  v1.0 // neural-scan online
                </div>
                <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
                  AI Secure
                  <br />
                  <span className="text-gradient">Code Compiler</span>
                </h1>
                <p className="mt-6 max-w-xl font-mono text-sm uppercase tracking-[0.25em] text-muted-foreground">
                  Analyze · Detect · Protect
                </p>
                <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                  Compile with confidence. SecAI scans every line in real time, predicts threats,
                  simulates attacks, and ships actionable fixes — before your code ever ships.
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground glow hover:opacity-90">
                    <Link to="/editor">
                      <Zap className="mr-2 h-4 w-4" />
                      Start Coding
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
                    <Link to="/dashboard">View Dashboard</Link>
                  </Button>
                </div>
                <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 font-mono">
                  {[
                    ["10+", "rule patterns"],
                    ["5", "languages"],
                    ["RT", "scanning"],
                  ].map(([k, v]) => (
                    <div key={v}>
                      <dt className="text-2xl font-semibold text-primary">{k}</dt>
                      <dd className="text-[10px] uppercase tracking-widest text-muted-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="relative">
                <div className="scanline relative overflow-hidden rounded-xl border border-primary/30 bg-card/80 p-6 glow">
                  <div className="mb-4 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    <span>~/secai/scan.log</span>
                    <span className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-destructive/70" />
                      <span className="h-2 w-2 rounded-full bg-warning/70" />
                      <span className="h-2 w-2 rounded-full bg-success/70" />
                    </span>
                  </div>
                  <pre className="font-mono text-[12px] leading-relaxed text-foreground/90">
{`> compile main.java
[ok]   parsed 124 tokens
[warn] line 7  ─ hardcoded password
[crit] line 12 ─ SQL injection via string concat
       └ suggest: PreparedStatement
[info] line 19 ─ weak hash (md5)
[ai]   threat model: credential exfiltration
[sim]  attack: SQL Injection → BYPASSED
[fix]  patch generated · 3 edits ready
score: 42 / 100 — threat level: CRITICAL`}
                  </pre>
                </div>
                <div className="absolute -bottom-6 -right-6 hidden h-32 w-32 rounded-full bg-accent/20 blur-3xl md:block" />
                <div className="absolute -top-6 -left-6 hidden h-40 w-40 rounded-full bg-primary/20 blur-3xl md:block" />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-background/40">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Built for engineers who ship <span className="text-gradient">unbreakable</span> code
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="group relative overflow-hidden rounded-lg border border-border bg-card/60 p-6 transition hover:border-primary/40 hover:bg-card">
                  <f.icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-border/60 py-10 text-center font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          SecAI // secure compiler · {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}

const features = [
  { icon: Bug, title: "Vulnerability Detection", desc: "Pattern engine flags SQLi, XSS, RCE, weak crypto, and unsafe APIs the moment you write them." },
  { icon: Activity, title: "Attack Simulation", desc: "See what would actually happen — login bypass, stack smash, RCE — before an attacker does." },
  { icon: Cpu, title: "AI Threat Prediction", desc: "Heuristics surface the most likely exploit class for your codebase and language." },
  { icon: ShieldCheck, title: "Auto-Fix Suggestions", desc: "Each finding ships with the canonical hardened replacement." },
  { icon: LineChart, title: "Security Dashboard", desc: "Score, threat level, and breakdown by severity across every scan." },
  { icon: Zap, title: "Multi-Language", desc: "Java, JavaScript, Python, C, and C++ supported out of the box." },
];
