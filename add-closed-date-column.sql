-- Add closed_date column to tickets table
-- This column will be populated when a ticket status is changed to 'Released' or 'Cancelled'

-- Step 1: Add closed_date column to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS closed_date TIMESTAMP WITH TIME ZONE;

-- Step 2: Add comment to the new column
COMMENT ON COLUMN tickets.closed_date IS 'Date when ticket was closed (status changed to Released or Cancelled)';

-- Step 3: Add an index on closed_date for better performance in reporting queries
CREATE INDEX IF NOT EXISTS idx_tickets_closed_date ON tickets(closed_date);

-- Step 4: Update existing tickets that are already in 'Released' or 'Cancelled' status
-- Set their closed_date to their updated_at timestamp as a reasonable default
UPDATE tickets 
SET closed_date = updated_at 
WHERE status IN ('Released', 'Cancelled') 
AND closed_date IS NULL;

-- Step 5: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tickets' 
AND column_name = 'closed_date';

-- Step 6: Show sample of updated records
SELECT 
  id, 
  title, 
  status, 
  closed_date, 
  updated_at 
FROM tickets 
WHERE status IN ('Released', 'Cancelled')
LIMIT 5;
