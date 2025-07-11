-- First, create a new column with the correct case
ALTER TABLE tickets ADD COLUMN "testNotes" TEXT;

-- Copy data from the old column to the new one
UPDATE tickets SET "testNotes" = testnotes;

-- Drop the old column
ALTER TABLE tickets DROP COLUMN testnotes;

-- Add comment to the correctly cased column
COMMENT ON COLUMN tickets."testNotes" IS 'Notes related to testing of this ticket';
