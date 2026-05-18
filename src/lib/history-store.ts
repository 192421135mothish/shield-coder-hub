import type { Vulnerability } from "./security-engine";

export type ScanRecord = {
  id: string;
  timestamp: number;
  language: string;
  score: number;
  vulns: Vulnerability[];
  codePreview: string;
};

const KEY = "secai_scan_history_v1";

export function getHistory(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as ScanRecord[];
  } catch {
    return [];
  }
}

export function addScan(rec: ScanRecord) {
  const list = [rec, ...getHistory()].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("secai:history"));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("secai:history"));
}
