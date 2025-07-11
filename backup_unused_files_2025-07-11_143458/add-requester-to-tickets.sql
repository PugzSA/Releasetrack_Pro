-- Add requester_id column to tickets table to track who requested the ticket

-- Step 1: Add requester_id column to tickets table
ALTER TABLE tickets
ADD COLUMN requester_id INTEGER;

-- Step 2: Create a foreign key constraint linking to users table
ALTER TABLE tickets
ADD CONSTRAINT fk_ticket_requester
FOREIGN KEY (requester_id) REFERENCES users(id)
ON DELETE SET NULL;

-- Step 3: Add an index on requester_id for better performance
CREATE INDEX idx_tickets_requester_id ON tickets(requester_id);

-- Step 4: Add comment to the new column
COMMENT ON COLUMN tickets.requester_id IS 'Foreign key to users table for ticket requester';

-- Step 5 (Optional): Add a requester display name column for backward compatibility
-- This is similar to how we're handling assignee
ALTER TABLE tickets
ADD COLUMN requester VARCHAR(255);

COMMENT ON COLUMN tickets.requester IS 'Display name for the requester (for backward compatibility)';

-- Step 6: Update the ticket_details view to include requester information
CREATE OR REPLACE VIEW ticket_details AS
SELECT 
  t.*,
  -- Assignee information
  CASE 
    WHEN a.id IS NOT NULL THEN CONCAT(a.firstName, ' ', a.lastName)
    ELSE t.assignee
  END AS assignee_name,
  a.firstName AS assignee_first_name,
  a.lastName AS assignee_last_name,
  a.email AS assignee_email,
  -- Requester information
  CASE 
    WHEN r.id IS NOT NULL THEN CONCAT(r.firstName, ' ', r.lastName)
    ELSE t.requester
  END AS requester_name,
  r.firstName AS requester_first_name,
  r.lastName AS requester_last_name,
  r.email AS requester_email
FROM 
  tickets t
LEFT JOIN 
  users a ON t.assignee_id = a.id
LEFT JOIN 
  users r ON t.requester_id = r.id;
