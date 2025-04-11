import { Database } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import BetterSqlite3 from "better-sqlite3";

const runMigration = async () => {
  try {
    console.log("Running migration to add api_keys table...");
    
    // Connect to SQLite database
    const sqlite = new BetterSqlite3("sqlite.db");
    const db = drizzle(sqlite);
    
    // Check if api_keys table already exists
    const tableExists = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='api_keys'").get();
    
    if (tableExists) {
      console.log("Table api_keys already exists, skipping creation.");
      return;
    }
    
    // Create the api_keys table
    sqlite.exec(`
      CREATE TABLE api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        created_at INTEGER,
        last_used INTEGER,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log("Successfully created api_keys table");
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

runMigration();