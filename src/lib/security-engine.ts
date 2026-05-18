export type Severity = "critical" | "high" | "medium" | "low";

export type Vulnerability = {
  id: string;
  rule: string;
  message: string;
  solution: string;
  severity: Severity;
  line: number;
  snippet: string;
  language: string;
};

type Rule = {
  name: string;
  regex: RegExp;
  message: string;
  solution: string;
  severity: Severity;
  languages?: string[]; // if undefined, all
};

const RULES: Rule[] = [
  {
    name: "SQL Injection",
    regex: /["'`][^"'`]*\+\s*\w+|\w+\s*\+\s*["'`]|String\.format\([^)]*SELECT|f["'][^"']*SELECT[^"']*\{/i,
    message: "Possible SQL injection via string concatenation.",
    solution: "Use parameterized queries / PreparedStatement.",
    severity: "critical",
  },
  {
    name: "Buffer Overflow",
    regex: /\b(gets|strcpy|strcat|sprintf)\s*\(/,
    message: "Unsafe C function that can cause buffer overflow.",
    solution: "Use fgets / strncpy / strncat / snprintf with length checks.",
    severity: "critical",
    languages: ["c", "cpp"],
  },
  {
    name: "Hardcoded Password",
    regex: /(password|passwd|pwd|secret|api[_-]?key|token)\s*[:=]\s*["'][^"']{3,}["']/i,
    message: "Hardcoded credential detected.",
    solution: "Move secrets to environment variables or a secret vault.",
    severity: "high",
  },
  {
    name: "Use of eval()",
    regex: /\beval\s*\(/,
    message: "eval() executes arbitrary code — major RCE risk.",
    solution: "Avoid eval; parse data explicitly (JSON.parse, etc).",
    severity: "critical",
  },
  {
    name: "XSS via innerHTML",
    regex: /\.innerHTML\s*=|dangerouslySetInnerHTML/,
    message: "Direct HTML injection can enable XSS.",
    solution: "Use textContent or sanitize with DOMPurify.",
    severity: "high",
  },
  {
    name: "Insecure Random",
    regex: /Math\.random\s*\(|new\s+Random\s*\(/,
    message: "Non-cryptographic RNG used in security context.",
    solution: "Use crypto.getRandomValues / SecureRandom.",
    severity: "medium",
  },
  {
    name: "Weak Hash",
    regex: /\b(md5|sha1)\b/i,
    message: "Weak hashing algorithm.",
    solution: "Use SHA-256, bcrypt, scrypt, or argon2.",
    severity: "medium",
  },
  {
    name: "Command Injection",
    regex: /\b(exec|spawn|system|popen|Runtime\.getRuntime\(\)\.exec)\s*\(/,
    message: "Shell execution with possible untrusted input.",
    solution: "Avoid shells; use argument arrays and validate inputs.",
    severity: "high",
  },
  {
    name: "Insecure HTTP",
    regex: /http:\/\/(?!localhost|127\.0\.0\.1)/,
    message: "Plaintext HTTP endpoint.",
    solution: "Use HTTPS.",
    severity: "low",
  },
  {
    name: "Debug Statement",
    regex: /console\.log\(|System\.out\.println\(|printf\(/,
    message: "Debug logging left in code may leak data.",
    solution: "Remove or use a structured logger with levels.",
    severity: "low",
  },
];

export function scanCode(code: string, language: string): Vulnerability[] {
  const lines = code.split("\n");
  const findings: Vulnerability[] = [];
  let id = 0;
  for (const rule of RULES) {
    if (rule.languages && !rule.languages.includes(language)) continue;
    lines.forEach((line, idx) => {
      if (rule.regex.test(line)) {
        findings.push({
          id: `v${++id}`,
          rule: rule.name,
          message: rule.message,
          solution: rule.solution,
          severity: rule.severity,
          line: idx + 1,
          snippet: line.trim().slice(0, 200),
          language,
        });
      }
    });
  }
  return findings;
}

const WEIGHT: Record<Severity, number> = { critical: 30, high: 18, medium: 9, low: 3 };

export function securityScore(vulns: Vulnerability[]): number {
  const penalty = vulns.reduce((s, v) => s + WEIGHT[v.severity], 0);
  return Math.max(0, 100 - penalty);
}

export function threatLevel(score: number): { label: string; tone: "success" | "warning" | "destructive" } {
  if (score >= 85) return { label: "Low", tone: "success" };
  if (score >= 60) return { label: "Moderate", tone: "warning" };
  return { label: "Critical", tone: "destructive" };
}

export function simulateAttacks(vulns: Vulnerability[]) {
  const sims: { attack: string; unsafe: string; safe: string; triggered: boolean }[] = [
    {
      attack: "SQL Injection",
      unsafe: "Login bypassed — admin session created without credentials.",
      safe: "Access denied — parameterized query rejected payload.",
      triggered: vulns.some((v) => v.rule === "SQL Injection"),
    },
    {
      attack: "Buffer Overflow",
      unsafe: "Stack smashed — segmentation fault, return address overwritten.",
      safe: "Protected execution — bounded read prevented overflow.",
      triggered: vulns.some((v) => v.rule === "Buffer Overflow"),
    },
    {
      attack: "Remote Code Execution",
      unsafe: "eval() executed attacker payload — shell spawned.",
      safe: "Payload parsed as inert data; no execution.",
      triggered: vulns.some((v) => v.rule === "Use of eval()" || v.rule === "Command Injection"),
    },
    {
      attack: "Credential Exfiltration",
      unsafe: "Hardcoded secret extracted from binary in seconds.",
      safe: "Secret loaded from vault at runtime; not present in source.",
      triggered: vulns.some((v) => v.rule === "Hardcoded Password"),
    },
  ];
  return sims;
}

export const SAMPLE_CODE: Record<string, string> = {
  java: `import java.sql.*;

public class Login {
  String password = "admin1234"; // hardcoded
  public boolean auth(Connection c, String user, String pass) throws Exception {
    Statement s = c.createStatement();
    ResultSet r = s.executeQuery("SELECT * FROM users WHERE name='" + user + "' AND pwd='" + pass + "'");
    return r.next();
  }
  public String hash(String x) { return md5(x); }
}`,
  javascript: `const API_KEY = "sk_live_9f8a7c6b5d4e";
function render(html) {
  document.getElementById("out").innerHTML = html;
}
function token() { return Math.random().toString(36); }
eval(userInput);`,
  python: `import os
password = "supersecret"
def run(cmd):
    os.system("sh -c " + cmd)
def q(user):
    return f"SELECT * FROM users WHERE name='{user}'"`,
  c: `#include <stdio.h>
int main() {
  char buf[16];
  gets(buf);
  printf(buf);
  return 0;
}`,
};

export const LANGUAGES = ["java", "javascript", "python", "c", "cpp"] as const;
