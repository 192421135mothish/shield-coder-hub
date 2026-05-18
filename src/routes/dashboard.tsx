import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { getHistory, type ScanRecord } from "@/lib/history-store";
import { threatLevel } from "@/lib/security-engine";
import { cn } from "@/lib/utils";
import { Activity, ShieldCheck, AlertTriangle, Bug } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SecAI" },
      { name: "description", content: "Security score, threat level, and breakdown of detected vulnerabilities." },
    ],
  }),
  component: Dashboard,
});

function useHistory() {
  const [h, setH] = useState<ScanRecord[]>([]);
  useEffect(() => {
    const load = () => setH(getHistory());
    load();
    window.addEventListener("secai:history", load);
    return () => window.removeEventListener("secai:history", load);
  }, []);
  return h;
}

const SEV_COLORS: Record<string, string> = {
  critical: "oklch(0.65 0.25 25)",
  high: "oklch(0.70 0.25 330)",
  medium: "oklch(0.82 0.17 80)",
  low: "oklch(0.85 0.18 200)",
};

function Dashboard() {
  const history = useHistory();
  const latest = history[0];

  const score = latest?.score ?? 100;
  const level = threatLevel(score);

  const sevData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const r of history) for (const v of r.vulns) counts[v.severity]++;
    return Object.entries(counts).map(([k, v]) => ({ name: k, value: v, fill: SEV_COLORS[k] }));
  }, [history]);

  const ruleData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of history) for (const v of r.vulns) counts.set(v.rule, (counts.get(v.rule) ?? 0) + 1);
    return Array.from(counts, ([rule, count]) => ({ rule, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [history]);

  const totalVulns = history.reduce((s, r) => s + r.vulns.length, 0);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Security Dashboard</h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              real-time threat analytics
            </p>
          </div>
          <Button asChild variant="outline" className="border-primary/40 hover:bg-primary/10">
            <Link to="/editor">Run a Scan</Link>
          </Button>
        </div>

        {history.length === 0 && (
          <EmptyState />
        )}

        {history.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                icon={ShieldCheck}
                label="Security Score"
                value={`${score}`}
                accent={level.tone}
                subtitle={`${level.label} threat`}
              />
              <StatCard icon={Activity} label="Total Scans" value={`${history.length}`} subtitle="logged" />
              <StatCard icon={Bug} label="Vulnerabilities" value={`${totalVulns}`} subtitle="all-time" />
              <StatCard
                icon={AlertTriangle}
                label="Critical"
                value={`${history.reduce((s, r) => s + r.vulns.filter((v) => v.severity === "critical").length, 0)}`}
                accent="destructive"
                subtitle="needs attention"
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-border bg-card/80 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="font-display text-sm font-semibold">Top Vulnerability Rules</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">across all scans</div>
                  </div>
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 font-mono text-[10px] uppercase text-primary">bar</Badge>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer>
                    <BarChart data={ruleData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.05 240 / 40%)" />
                      <XAxis dataKey="rule" stroke="oklch(0.70 0.03 240)" fontSize={10} tick={{ fontFamily: "JetBrains Mono" }} interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis stroke="oklch(0.70 0.03 240)" fontSize={11} />
                      <Tooltip contentStyle={{ background: "oklch(0.20 0.035 252)", border: "1px solid oklch(0.32 0.05 240)", borderRadius: 8, fontFamily: "JetBrains Mono", fontSize: 12 }} />
                      <Bar dataKey="count" fill="oklch(0.85 0.18 200)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/80 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="font-display text-sm font-semibold">Severity Breakdown</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">distribution</div>
                  </div>
                  <Badge variant="outline" className="border-accent/40 bg-accent/10 font-mono text-[10px] uppercase text-accent">pie</Badge>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={sevData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                        {sevData.map((d) => <Cell key={d.name} fill={d.fill} />)}
                      </Pie>
                      <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }} />
                      <Tooltip contentStyle={{ background: "oklch(0.20 0.035 252)", border: "1px solid oklch(0.32 0.05 240)", borderRadius: 8, fontFamily: "JetBrains Mono", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, subtitle, accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; subtitle?: string;
  accent?: "success" | "warning" | "destructive";
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/80 p-5">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <Icon className={cn(
          "h-4 w-4",
          accent === "destructive" ? "text-destructive" :
          accent === "warning" ? "text-warning" :
          accent === "success" ? "text-success" : "text-primary",
        )} />
      </div>
      <div className={cn(
        "mt-3 font-display text-4xl font-bold tabular-nums",
        accent === "destructive" ? "text-destructive" :
        accent === "warning" ? "text-warning" :
        accent === "success" ? "text-success" : "text-gradient",
      )}>
        {value}
      </div>
      {subtitle && <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{subtitle}</div>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-16 text-center">
      <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
      <h2 className="mt-4 font-display text-xl font-semibold">No scans yet</h2>
      <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        run your first scan to populate the dashboard
      </p>
      <Button asChild className="mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground glow">
        <Link to="/editor">Open Editor</Link>
      </Button>
    </div>
  );
}
