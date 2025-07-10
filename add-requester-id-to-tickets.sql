-- Script to add requester_id column to tickets table and create foreign key relationship to users table

-- First, check if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tickets') THEN
    -- Check if the column already exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'requester_id') THEN
      -- Add requester_id column to tickets table
      ALTER TABLE tickets ADD COLUMN requester_id INTEGER;
      RAISE NOTICE 'Added requester_id column to tickets table';
      
      -- Add foreign key constraint
      ALTER TABLE tickets 
      ADD CONSTRAINT fk_ticket_requester 
      FOREIGN KEY (requester_id) REFERENCES users(id) 
      ON DELETE SET NULL;
      RAISE NOTICE 'Added foreign key constraint for requester_id';
      
      -- Add index for better performance
      CREATE INDEX idx_tickets_requester_id ON tickets(requester_id);
      RAISE NOTICE 'Created index on requester_id column';
      
      -- Add comment to the column
      COMMENT ON COLUMN tickets.requester_id IS 'Foreign key to users table for the user who requested the ticket';
      
      -- Add requester column for backward compatibility (similar to assignee)
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'requester') THEN
        ALTER TABLE tickets ADD COLUMN requester VARCHAR(255);
        COMMENT ON COLUMN tickets.requester IS 'Display name for the requester (for backward compatibility)';
        RAISE NOTICE 'Added requester display name column for backward compatibility';
      END IF;
      
      -- First drop the existing view if it exists
      DROP VIEW IF EXISTS ticket_details;
      
      -- Create a new ticket_details view with requester information
      CREATE VIEW ticket_details AS
      SELECT 
        t.*,
        -- Assignee information
        CASE 
          WHEN a.id IS NOT NULL THEN CONCAT(a."firstName", ' ', a."lastName")
          ELSE t.assignee
        END AS assignee_name,
        a."firstName" AS assignee_first_name,
        a."lastName" AS assignee_last_name,
        a.email AS assignee_email,
        -- Requester information
        CASE 
          WHEN r.id IS NOT NULL THEN CONCAT(r."firstName", ' ', r."lastName")
          ELSE t.requester
        END AS requester_name,
        r."firstName" AS requester_first_name,
        r."lastName" AS requester_last_name,
        r.email AS requester_email
      FROM 
        tickets t
      LEFT JOIN 
        users a ON t.assignee_id = a.id
      LEFT JOIN 
        users r ON t.requester_id = r.id;
      
      RAISE NOTICE 'Updated ticket_details view to include requester information';
    ELSE
      RAISE NOTICE 'requester_id column already exists in tickets table';
    END IF;
  ELSE
    RAISE NOTICE 'tickets table does not exist';
  END IF;
END $$;

-- Verify the current structure of the tickets table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tickets'
ORDER BY ordinal_position;
