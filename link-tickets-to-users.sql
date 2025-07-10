-- First, examine the current tickets table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tickets';

-- Step 1: Add assignee_id column to tickets table
ALTER TABLE tickets
ADD COLUMN assignee_id INTEGER;

-- Step 2: Create a foreign key constraint linking to users table
ALTER TABLE tickets
ADD CONSTRAINT fk_ticket_assignee
FOREIGN KEY (assignee_id) REFERENCES users(id)
ON DELETE SET NULL;

-- Step 3: Add an index on assignee_id for better performance
CREATE INDEX idx_tickets_assignee_id ON tickets(assignee_id);

-- Step 4: Add comment to the new column
COMMENT ON COLUMN tickets.assignee_id IS 'Foreign key to users table for ticket assignee';

-- Step 5 (Optional): Migrate existing assignee data if possible
-- This is a placeholder - you'll need to modify this based on your existing data format
-- Example assuming assignee currently contains names that match "FirstName LastName" in users table:
/*
UPDATE tickets t
SET assignee_id = u.id
FROM users u
WHERE CONCAT(u.firstName, ' ', u.lastName) = t.assignee;
*/

-- Step 6 (Optional): If you want to keep the old assignee column for backward compatibility
-- but make it clear it's deprecated:
COMMENT ON COLUMN tickets.assignee IS 'DEPRECATED: Use assignee_id instead. Will be removed in future.';
