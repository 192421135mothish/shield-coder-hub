import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getHistory, clearHistory, type ScanRecord } from "@/lib/history-store";
import { threatLevel } from "@/lib/security-engine";
import { Download, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — SecAI" },
      { name: "description", content: "Scan history with downloadable security reports." },
    ],
  }),
  component: Reports,
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

function downloadReport(rec: ScanRecord) {
  const lines: string[] = [];
  lines.push("SECAI SECURITY REPORT");
  lines.push("=".repeat(60));
  lines.push(`Scan ID:   ${rec.id}`);
  lines.push(`Timestamp: ${new Date(rec.timestamp).toISOString()}`);
  lines.push(`Language:  ${rec.language}`);
  lines.push(`Score:     ${rec.score} / 100`);
  lines.push(`Threat:    ${threatLevel(rec.score).label}`);
  lines.push(`Findings:  ${rec.vulns.length}`);
  lines.push("");
  lines.push("FINDINGS");
  lines.push("-".repeat(60));
  rec.vulns.forEach((v, i) => {
    lines.push(`#${i + 1} [${v.severity.toUpperCase()}] ${v.rule} — line ${v.line}`);
    lines.push(`   ${v.message}`);
    lines.push(`   code: ${v.snippet}`);
    lines.push(`   fix:  ${v.solution}`);
    lines.push("");
  });
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `secai-report-${rec.id.slice(0, 8)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Report downloaded");
}

function Reports() {
  const history = useHistory();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Scan Reports</h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              audit · export · review
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!history.length}
              onClick={() => { clearHistory(); toast.success("History cleared"); }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card/80">
          {history.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 font-display text-xl font-semibold">No reports yet</h2>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                run a scan in the editor to generate one
              </p>
              <Button asChild className="mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground glow">
                <Link to="/editor">Open Editor</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest">When</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest">Lang</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest">Score</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest">Threat</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest">Findings</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest">Preview</TableHead>
                  <TableHead className="text-right font-mono text-[10px] uppercase tracking-widest">Report</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((r) => {
                  const lvl = threatLevel(r.score);
                  return (
                    <TableRow key={r.id} className="border-border/60">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(r.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs uppercase">{r.language}</TableCell>
                      <TableCell className="font-mono text-sm font-semibold tabular-nums">{r.score}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-[10px] uppercase",
                            lvl.tone === "success" && "border-success/40 bg-success/10 text-success",
                            lvl.tone === "warning" && "border-warning/40 bg-warning/10 text-warning",
                            lvl.tone === "destructive" && "border-destructive/40 bg-destructive/10 text-destructive",
                          )}
                        >
                          {lvl.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.vulns.length}</TableCell>
                      <TableCell className="max-w-[280px] truncate font-mono text-[11px] text-muted-foreground">
                        {r.codePreview || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => downloadReport(r)}>
                          <Download className="mr-2 h-3.5 w-3.5" /> Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
