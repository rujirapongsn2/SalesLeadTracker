import Database from "better-sqlite3";

// Create a connection to the database
const db = new Database("sqlite.db");

// Add the budget column to the leads table if it doesn't exist
try {
  // Check if the column exists
  const tableInfo = db.prepare("PRAGMA table_info(leads)").all();
  const budgetColumnExists = tableInfo.some((column: any) => column.name === "budget");

  if (!budgetColumnExists) {
    console.log("Adding budget column to leads table...");
    db.prepare("ALTER TABLE leads ADD COLUMN budget TEXT NOT NULL DEFAULT ''").run();
    console.log("Budget column added successfully!");
  } else {
    console.log("Budget column already exists in leads table.");
  }
} catch (error) {
  console.error("Error migrating database:", error);
} finally {
  // Close the database connection
  db.close();
}
