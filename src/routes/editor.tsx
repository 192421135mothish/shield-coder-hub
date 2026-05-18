import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, ShieldAlert, Sparkles, Bug, Zap, RotateCcw } from "lucide-react";
import {
  LANGUAGES, SAMPLE_CODE, scanCode, securityScore, simulateAttacks, threatLevel,
  type Vulnerability,
} from "@/lib/security-engine";
import { addScan } from "@/lib/history-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/editor")({
  head: () => ({
    meta: [
      { title: "Editor — SecAI" },
      { name: "description", content: "Write code, run scans, simulate attacks, and get hardened fixes in real time." },
    ],
  }),
  component: EditorPage,
});

const sevColor: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/40",
  high: "bg-accent/20 text-accent border-accent/40",
  medium: "bg-warning/20 text-warning border-warning/40",
  low: "bg-primary/15 text-primary border-primary/30",
};

function EditorPage() {
  const [language, setLanguage] = useState<string>("java");
  const [code, setCode] = useState<string>(SAMPLE_CODE.java);
  const [vulns, setVulns] = useState<Vulnerability[] | null>(null);
  const [scanning, setScanning] = useState(false);

  const score = useMemo(() => (vulns ? securityScore(vulns) : null), [vulns]);
  const level = score != null ? threatLevel(score) : null;
  const sims = vulns ? simulateAttacks(vulns) : [];

  const loadSample = (lang: string) => {
    setLanguage(lang);
    setCode(SAMPLE_CODE[lang] ?? "");
    setVulns(null);
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      const result = scanCode(code, language);
      setVulns(result);
      const s = securityScore(result);
      addScan({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        language,
        score: s,
        vulns: result,
        codePreview: code.split("\n").slice(0, 3).join("\n").slice(0, 160),
      });
      setScanning(false);
      toast.success(`Scan complete · ${result.length} finding${result.length === 1 ? "" : "s"} · score ${s}`);
    }, 400);
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Secure Editor</h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              write · compile · scan · simulate
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={loadSample}>
              <SelectTrigger className="w-[160px] font-mono uppercase text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l} className="font-mono uppercase text-xs">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => loadSample(language)}>
              <RotateCcw className="mr-2 h-4 w-4" /> Sample
            </Button>
            <Button
              onClick={handleScan}
              disabled={scanning}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground glow hover:opacity-90"
            >
              <Play className="mr-2 h-4 w-4" />
              {scanning ? "Scanning…" : "Run & Scan"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="scanline relative overflow-hidden rounded-xl border border-border bg-card/80">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>main.{language}</span>
              <span>{code.split("\n").length} lines</span>
            </div>
            <div className="grid grid-cols-[3rem_1fr]">
              <div className="select-none border-r border-border/60 bg-background/40 py-3 text-right font-mono text-[11px] leading-6 text-muted-foreground">
                {code.split("\n").map((_, i) => (
                  <div key={i} className="px-2">{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="min-h-[480px] resize-none bg-transparent p-3 font-mono text-[13px] leading-6 text-foreground outline-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card/80 p-5">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Output Console
                </div>
                {level && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono uppercase tracking-widest",
                      level.tone === "success" && "border-success/40 bg-success/10 text-success",
                      level.tone === "warning" && "border-warning/40 bg-warning/10 text-warning",
                      level.tone === "destructive" && "border-destructive/40 bg-destructive/10 text-destructive",
                    )}
                  >
                    {level.label}
                  </Badge>
                )}
              </div>
              <div className="mt-3 flex items-end gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Score</div>
                  <div className="text-gradient font-display text-5xl font-bold tabular-nums">
                    {score ?? "—"}
                  </div>
                </div>
                <div className="flex-1 text-sm text-muted-foreground">
                  {vulns == null && "Run a scan to compute the security score and threat level."}
                  {vulns && vulns.length === 0 && (
                    <span className="text-success">No vulnerabilities detected. Ship it.</span>
                  )}
                  {vulns && vulns.length > 0 && (
                    <>Detected <b className="text-foreground">{vulns.length}</b> issue{vulns.length === 1 ? "" : "s"} across {new Set(vulns.map((v) => v.rule)).size} rule(s).</>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/80">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <Bug className="h-4 w-4 text-primary" />
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Findings</div>
              </div>
              <ScrollArea className="h-[260px]">
                <div className="divide-y divide-border/60">
                  {(!vulns || vulns.length === 0) && (
                    <div className="px-4 py-10 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {vulns ? "no issues" : "awaiting scan"}
                    </div>
                  )}
                  {vulns?.map((v) => (
                    <div key={v.id} className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("font-mono text-[10px] uppercase", sevColor[v.severity])}>
                          {v.severity}
                        </Badge>
                        <span className="font-display text-sm font-medium">{v.rule}</span>
                        <span className="ml-auto font-mono text-[11px] text-muted-foreground">line {v.line}</span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">{v.message}</div>
                      <pre className="mt-2 overflow-x-auto rounded bg-background/60 p-2 font-mono text-[11px] text-foreground/80">{v.snippet}</pre>
                      <div className="mt-2 flex items-start gap-2 rounded border border-primary/30 bg-primary/5 p-2 text-xs">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span><b className="text-primary">Fix:</b> {v.solution}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="rounded-xl border border-border bg-card/80">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <ShieldAlert className="h-4 w-4 text-accent" />
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Attack Simulation</div>
              </div>
              <div className="divide-y divide-border/60">
                {sims.length === 0 && (
                  <div className="px-4 py-8 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    run a scan to simulate
                  </div>
                )}
                {sims.map((s) => (
                  <div key={s.attack} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Zap className={cn("h-4 w-4", s.triggered ? "text-destructive" : "text-success")} />
                      <span className="font-display text-sm font-medium">{s.attack}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-auto font-mono text-[10px] uppercase",
                          s.triggered
                            ? "border-destructive/40 bg-destructive/10 text-destructive"
                            : "border-success/40 bg-success/10 text-success",
                        )}
                      >
                        {s.triggered ? "exploit" : "safe"}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {s.triggered ? s.unsafe : s.safe}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
