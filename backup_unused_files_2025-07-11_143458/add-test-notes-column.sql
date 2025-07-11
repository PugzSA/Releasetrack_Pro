-- Add testNotes column to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS testNotes TEXT;

-- Update existing records with empty test notes
UPDATE tickets SET testNotes = '' WHERE testNotes IS NULL;

-- Add comment to the column
COMMENT ON COLUMN tickets.testNotes IS 'Notes related to testing of this ticket';
