const sqlite3 = require('better-sqlite3');

console.log("Running migration to add created_by_id column to leads table...");

// Initialize the database connection
const db = sqlite3('./sqlite.db');

try {
  // Check if the column exists
  const columnCheckStmt = db.prepare(`
    SELECT COUNT(*) as count FROM pragma_table_info('leads') WHERE name = 'created_by_id'
  `);
  const columnExists = columnCheckStmt.get().count > 0;

  if (!columnExists) {
    // Add the column to the table
    console.log("Adding created_by_id column to leads table...");
    db.prepare(`
      ALTER TABLE leads ADD COLUMN created_by_id INTEGER DEFAULT 0
    `).run();
    console.log("Column created_by_id added successfully!");
  } else {
    console.log("Column created_by_id already exists.");
  }

  // Update existing records (optional)
  console.log("Updating existing leads with default user ID...");
  db.prepare(`
    UPDATE leads
    SET created_by_id = 1
    WHERE created_by_id = 0 OR created_by_id IS NULL
  `).run();
  console.log("Existing leads updated with default user ID!");

} catch (error) {
  console.error("Migration error:", error);
  throw error;
} finally {
  db.close();
}

console.log("Migration completed successfully!");