-- Add supportArea column to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS supportArea VARCHAR(50);

-- Update existing tickets to have a default value
UPDATE tickets SET supportArea = 'CRM' WHERE supportArea IS NULL;
