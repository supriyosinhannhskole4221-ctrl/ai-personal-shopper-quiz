require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

async function runDiagnostic() {
  console.log("==========================================");
  console.log("   Supabase Connection Diagnostic Tool    ");
  console.log("==========================================\n");

  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  console.log("Checking environment configuration...");
  if (!url) {
    console.error("❌ SUPABASE_URL is missing in .env file.");
    process.exit(1);
  }
  console.log(`✓ SUPABASE_URL: ${url}`);

  if (!key) {
    console.error("❌ SUPABASE_KEY / SUPABASE_SECRET_KEY is missing in .env file.");
    process.exit(1);
  }
  const maskedKey = key.length > 10 ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : "***";
  console.log(`✓ API Key detected: ${maskedKey}`);

  console.log("\nAttempting connection to Supabase...");
  let supabase;
  try {
    supabase = createClient(url, key, {
      auth: { persistSession: false }
    });
  } catch (err) {
    console.error("❌ Failed to initialize Supabase client:", err.message);
    process.exit(1);
  }

  try {
    console.log("Querying table 'customer_quiz_submissions'...");
    const { data, error } = await supabase
      .from("customer_quiz_submissions")
      .select("id")
      .limit(1);

    if (error) {
      console.error("\n❌ Supabase connection error:");
      console.error(`   Message: ${error.message}`);
      if (error.details) console.error(`   Details: ${error.details}`);
      if (error.hint) console.error(`   Hint: ${error.hint}`);
      if (error.code) console.error(`   Code: ${error.code}`);
      console.error("\nPossible causes:");
      console.error("1. Table 'customer_quiz_submissions' may not be created in Supabase SQL Editor.");
      console.error("2. Invalid API Key or URL.");
      console.error("3. Row-level security (RLS) policy blocks select/insert.");
      process.exit(1);
    }

    console.log("\n✅ Supabase connection established successfully!");
    console.log(`✓ Connected to project at: ${url}`);
    console.log(`✓ Table 'customer_quiz_submissions' exists and is accessible.`);
  } catch (err) {
    console.error("\n❌ Unexpected connection failure:", err.message);
    process.exit(1);
  }
}

runDiagnostic();
