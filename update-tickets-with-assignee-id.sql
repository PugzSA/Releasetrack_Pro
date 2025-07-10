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
-- This attempts to match existing assignee names with user names in the format "FirstName LastName"
UPDATE tickets t
SET assignee_id = u.id
FROM users u
WHERE t.assignee IS NOT NULL 
  AND t.assignee != ''
  AND CONCAT(u.firstName, ' ', u.lastName) = t.assignee;

-- Step 6 (Optional): If you want to keep the old assignee column for backward compatibility
-- but make it clear it's deprecated:
COMMENT ON COLUMN tickets.assignee IS 'DEPRECATED: Use assignee_id instead for linking to users table. Will be removed in future.';

-- Step 7: Create a view that joins tickets with users to make querying easier
CREATE OR REPLACE VIEW ticket_details AS
SELECT 
  t.*,
  CASE 
    WHEN u.id IS NOT NULL THEN CONCAT(u.firstName, ' ', u.lastName)
    ELSE t.assignee
  END AS assignee_name,
  u.firstName AS assignee_first_name,
  u.lastName AS assignee_last_name,
  u.email AS assignee_email
FROM 
  tickets t
LEFT JOIN 
  users u ON t.assignee_id = u.id;
