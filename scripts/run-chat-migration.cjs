// scripts/run-chat-migration.cjs
const { ConvexHttpClient } = require("convex/browser");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function runMigration() {
  // Initialize Convex client
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("Error: NEXT_PUBLIC_CONVEX_URL not found in environment");
    process.exit(1);
  }

  const client = new ConvexHttpClient(convexUrl);

  try {
    console.log("Running chat migration...");
    const result = await client.action("migrateChats:addUpdatedAtToChats");
    console.log("Migration completed:", result);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration(); 