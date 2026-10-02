require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function validateQuiz(data) {
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const budget = String(data.budget || "").trim();
  const interests = String(data.interests || "").trim();

  const errors = {};

  if (!name) errors.name = "Name is required.";
  if (!email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!budget) errors.budget = "Budget is required.";
  if (!interests) errors.interests = "Please tell us what you are looking for.";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    clean: { name, email, budget, interests }
  };
}

/*
  POST /api/quiz
  ----------------
  This is the endpoint your frontend calls.

  Supabase is intentionally NOT required for the starter version.
  When you are ready, replace the "save" section below with a Supabase
  insert, or ask me to wire it directly to your Supabase table.
*/
app.post("/api/quiz", async (req, res) => {
  const { valid, errors, clean } = validateQuiz(req.body || {});

  if (!valid) {
    return res.status(400).json({
      success: false,
      message: "Please fix the highlighted fields.",
      errors
    });
  }

  const submission = {
    ...clean,
    created_at: new Date().toISOString()
  };

  // TEMPORARY: server-side receipt until Supabase is connected.
  console.log("Quiz submission received:", submission);

  // TODO: Supabase insert goes here.
  // Example target table: customer_quiz_submissions

  return res.status(201).json({
    success: true,
    message: "Thanks! Your preferences have been submitted.",
    data: submission
  });
});

// Health check for testing the backend.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "AI Personal Shopper Quiz API" });
});

// SPA fallback.
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`AI Personal Shopper Quiz running at http://localhost:${PORT}`);
});
