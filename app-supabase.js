// ============================================================
//  AI Personal Shopper Quiz — Server with Supabase Integration
//  Entry point: app-supabase.js
//  Start with: npm start  OR  node app-supabase.js
// ============================================================
require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const { createClient } = require("@supabase/supabase-js");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Supabase client ──────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY      ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY  ||
  process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
  console.log("Supabase client initialised.");
} else {
  console.warn("WARNING: Missing SUPABASE_URL or key in .env — Supabase disabled.");
}

async function getDbStatus() {
  if (!supabase) {
    return { connected: false, error: "Missing Supabase credentials in .env" };
  }
  try {
    const { error } = await supabase
      .from("customer_quiz_submissions")
      .select("id")
      .limit(1);
    return error
      ? { connected: false, error: error.message }
      : { connected: true, url: SUPABASE_URL, table: "customer_quiz_submissions" };
  } catch (e) {
    return { connected: false, error: e.message };
  }
}
// ────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Validation helper
function validateQuiz(data) {
  const name      = String(data.name      || "").trim();
  const email     = String(data.email     || "").trim().toLowerCase();
  const budget    = String(data.budget    || "").trim();
  const interests = String(data.interests || "").trim();
  const errors    = {};

  if (!name)      errors.name      = "Name is required.";
  if (!email)     errors.email     = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                  errors.email     = "Please enter a valid email address.";
  if (!budget)    errors.budget    = "Budget is required.";
  if (!interests) errors.interests = "Please tell us what you are looking for.";

  return { valid: Object.keys(errors).length === 0, errors,
           clean: { name, email, budget, interests } };
}

// ── API ROUTES ───────────────────────────────────────────────

// GET /api/supabase-status  ← frontend checks this on load
app.get("/api/supabase-status", async (_req, res) => {
  const s = await getDbStatus();
  return s.connected
    ? res.json({ success: true, connected: true,
        message: "Supabase connection established.",
        url: s.url, table: s.table })
    : res.status(503).json({ success: false, connected: false,
        message: "Supabase not connected.", error: s.error });
});

// POST /api/quiz  ← saves quiz form to Supabase
app.post("/api/quiz", async (req, res) => {
  const { valid, errors, clean } = validateQuiz(req.body || {});
  if (!valid) {
    return res.status(400).json({
      success: false, message: "Please fix the highlighted fields.", errors });
  }

  const s = await getDbStatus();
  if (!s.connected) {
    return res.status(503).json({
      success: false,
      message: "Cannot save — Supabase is not connected.",
      error: s.error });
  }

  const { data, error } = await supabase
    .from("customer_quiz_submissions")
    .insert([{
      name:      clean.name,
      email:     clean.email,
      budget:    clean.budget,
      interests: clean.interests,
    }])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }

  console.log("Saved to Supabase row id:", data.id);
  return res.status(201).json({
    success: true,
    message: "Thanks! Your preferences have been saved to Supabase.",
    data,
  });
});

// GET /api/health
app.get("/api/health", async (_req, res) => {
  const s = await getDbStatus();
  res.json({ ok: true, supabase: s });
});

// SPA fallback — MUST be the very last route
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

// ── START ────────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
  console.log(`\n  Server →  http://localhost:${PORT}\n`);
  const s = await getDbStatus();
  if (s.connected) {
    console.log(`  ✅  Supabase connected: ${s.url}`);
    console.log(`      Table: ${s.table}\n`);
  } else {
    console.error(`  ❌  Supabase NOT connected: ${s.error}\n`);
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  ❌  Port ${PORT} is already in use!`);
    console.error(`  Run this to free it, then retry npm start:\n`);
    console.error(`  Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
