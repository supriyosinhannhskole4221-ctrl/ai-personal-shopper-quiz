require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err.message);
  }
}

/**
 * Checks connection to Supabase and verifies
 * that 'customer_quiz_submissions' is accessible.
 */
async function checkSupabaseConnection() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return {
      connected: false,
      error: "Missing SUPABASE_URL or SUPABASE API key in .env file."
    };
  }

  if (!supabase) {
    return {
      connected: false,
      error: "Supabase client failed to initialize."
    };
  }

  try {
    const { error } = await supabase
      .from("customer_quiz_submissions")
      .select("id")
      .limit(1);

    if (error) {
      return {
        connected: false,
        error: error.message || "Failed to query table customer_quiz_submissions"
      };
    }

    return {
      connected: true,
      url: SUPABASE_URL,
      table: "customer_quiz_submissions"
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message || "Network or unexpected connection failure."
    };
  }
}

/**
 * Inserts a customer quiz submission into Supabase.
 */
async function insertSubmission(submission) {
  if (!supabase) {
    const status = await checkSupabaseConnection();
    return {
      data: null,
      error: new Error(status.error || "Supabase is not configured.")
    };
  }

  return await supabase
    .from("customer_quiz_submissions")
    .insert([
      {
        name: submission.name,
        email: submission.email,
        budget: submission.budget,
        interests: submission.interests
      }
    ])
    .select()
    .single();
}

module.exports = {
  supabase,
  checkSupabaseConnection,
  insertSubmission
};
