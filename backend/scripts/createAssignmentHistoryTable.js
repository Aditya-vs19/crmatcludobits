import { db, initDatabase } from '../config/database.js';

console.log('🔧 Creating assignment history table...');

const createAssignmentHistoryTable = async () => {
    await initDatabase();

    const schema = `
    -- Assignment history table
    CREATE TABLE IF NOT EXISTS assignment_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      assigned_from_user_id INTEGER,
      assigned_to_user_id INTEGER NOT NULL,
      assigned_by_user_id INTEGER NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_from_user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_assignment_history_request ON assignment_history(request_id);
    CREATE INDEX IF NOT EXISTS idx_assignment_history_assigned_to ON assignment_history(assigned_to_user_id);
  `;

    db.run(schema);
    console.log('✅ Assignment history table created successfully');
};

createAssignmentHistoryTable().catch(console.error);
