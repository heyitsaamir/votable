import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'votables.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
const initDb = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Entities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      user_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Votables table
  db.exec(`
    CREATE TABLE IF NOT EXISTS votables (
      id TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      type TEXT NOT NULL,
      config TEXT NOT NULL,
      label TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (entity_id) REFERENCES entities(id)
    )
  `);

  // Votes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      votable_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (votable_id) REFERENCES votables(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_entities_user_id ON entities(user_id);
    CREATE INDEX IF NOT EXISTS idx_votables_entity_id ON votables(entity_id);
    CREATE INDEX IF NOT EXISTS idx_votes_votable_id ON votes(votable_id);
    CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
  `);
};

// Initialize the database
initDb();

export { db };
