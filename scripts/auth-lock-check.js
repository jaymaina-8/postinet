/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".next" || e.name === ".git") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function fail(msg) {
  console.error(`\nAUTH LOCK CHECK FAILED:\n- ${msg}\n`);
  process.exit(1);
}

function mustInclude(filePath, needles) {
  const text = readText(filePath);
  for (const n of needles) {
    if (!text.includes(n)) fail(`${filePath} must include: ${JSON.stringify(n)}`);
  }
}

function mustNotIncludeInSrc(forbiddenNeedles, allowlist = new Set()) {
  const repoRoot = process.cwd();
  const srcRoot = path.join(repoRoot, "src");
  const files = walk(srcRoot).filter((p) => /\.(ts|tsx|js|jsx)$/.test(p));

  for (const f of files) {
    const rel = path.relative(repoRoot, f).replace(/\\/g, "/");
    if (allowlist.has(rel)) continue;

    const text = readText(f);
    for (const needle of forbiddenNeedles) {
      if (text.includes(needle)) {
        fail(`${rel} contains forbidden auth pattern: ${JSON.stringify(needle)}`);
      }
    }
  }
}

function ensureFacebookOAuthIsClientOnly() {
  const repoRoot = process.cwd();
  const srcRoot = path.join(repoRoot, "src");
  const files = walk(srcRoot).filter((p) => /\.(ts|tsx|js|jsx)$/.test(p));

  for (const f of files) {
    const rel = path.relative(repoRoot, f).replace(/\\/g, "/");
    const text = readText(f);
    
    // Check if signInWithOAuth is actually used in code (not just in comments)
    // Look for actual usage patterns like: signInWithOAuth({ or .signInWithOAuth(
    const hasActualUsage = /\.signInWithOAuth\s*\(|signInWithOAuth\s*\(/.test(text);
    if (!hasActualUsage) continue;

    // Hard rule: any signInWithOAuth usage must be in a client component.
    const firstChunk = text.split("\n").slice(0, 10).join("\n");
    if (!firstChunk.includes('"use client"') && !firstChunk.includes("'use client'")) {
      fail(`${rel} uses signInWithOAuth but is not a client component ("use client")`);
    }

    // Facebook-specific rule: must redirect to /api/facebook/exchange using NEXT_PUBLIC_APP_URL.
    if (text.includes('provider: "facebook"') || text.includes("provider: 'facebook'")) {
      if (!text.includes("process.env.NEXT_PUBLIC_APP_URL")) {
        fail(`${rel} Facebook OAuth must use process.env.NEXT_PUBLIC_APP_URL for redirectTo`);
      }
      if (!text.includes("/api/facebook/exchange")) {
        fail(`${rel} Facebook OAuth redirectTo must target /api/facebook/exchange`);
      }
    }
  }
}

// 1) PKCE lock-in for the canonical browser client.
mustInclude("src/lib/supabase/client.ts", [
  "createBrowserClient",
  "flowType: \"pkce\"",
  "detectSessionInUrl: true",
]);

// 2) Explicitly forbid old manual session token plumbing in src/.
mustNotIncludeInSrc(
  [
    "session.access_token",
    "req.headers.get('authorization')",
    "req.headers.get(\"authorization\")",
    "headers.get('authorization')",
    "headers.get(\"authorization\")",
    "exchangeCodeForSession(",
  ],
  new Set(["src/app/api/facebook/exchange/route.ts"]) // allowed ONLY on server callback
);

// 3) OAuth initiation must be browser-only and Facebook redirectTo must be consistent.
ensureFacebookOAuthIsClientOnly();

console.log("Auth lock check passed.");


