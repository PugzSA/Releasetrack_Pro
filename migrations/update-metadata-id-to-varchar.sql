-- Migration to update metadata table ID column from BIGINT to VARCHAR
-- This will allow us to use META-00001 format IDs similar to tickets

BEGIN;

-- Step 1: Create a new temporary table with the new schema
CREATE TABLE metadata_new (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  component VARCHAR(100),
  ticket_id VARCHAR(50) REFERENCES tickets(id) ON DELETE SET NULL,
  release_id VARCHAR(50) REFERENCES releases(id) ON DELETE SET NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  action VARCHAR(100),
  description TEXT,
  object VARCHAR(100)
);

-- Step 2: Copy existing data with new ID format
-- Convert existing numeric IDs to META-00001 format
INSERT INTO metadata_new (id, name, type, component, ticket_id, release_id, last_modified, created_at, updated_at, action, description, object)
SELECT
  'META-' || LPAD(id::text, 5, '0') as id,
  name,
  type,
  component,
  ticket_id,
  release_id,
  last_modified,
  created_at,
  updated_at,
  action,
  description,
  object
FROM metadata
ORDER BY id;

-- Step 3: Drop the old table
DROP TABLE metadata CASCADE;

-- Step 4: Rename the new table
ALTER TABLE metadata_new RENAME TO metadata;

-- Step 5: Recreate the triggers for updated_at timestamps
CREATE TRIGGER update_metadata_modtime
BEFORE UPDATE ON metadata
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Step 6: Enable Row Level Security (RLS) on the new table
ALTER TABLE metadata ENABLE ROW LEVEL SECURITY;

-- Step 7: Recreate the policy
CREATE POLICY "Allow all" ON metadata FOR ALL USING (true);

-- Step 8: Add comments to the table and columns
COMMENT ON TABLE metadata IS 'Metadata items related to tickets and releases';
COMMENT ON COLUMN metadata.id IS 'Unique identifier in META-00001 format';
COMMENT ON COLUMN metadata.name IS 'Name of the metadata item';
COMMENT ON COLUMN metadata.type IS 'Type of metadata (e.g., apex class, workflow, etc.)';
COMMENT ON COLUMN metadata.component IS 'Component or object the metadata relates to';
COMMENT ON COLUMN metadata.action IS 'Action performed on the metadata item';
COMMENT ON COLUMN metadata.description IS 'Description of the metadata item';
COMMENT ON COLUMN metadata.object IS 'Object the metadata relates to';
COMMENT ON COLUMN metadata.ticket_id IS 'Associated ticket ID';
COMMENT ON COLUMN metadata.release_id IS 'Associated release ID';

COMMIT;

-- Verify the migration
SELECT 'Migration completed successfully. New metadata table structure:' as message;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'metadata'
ORDER BY ordinal_position;

-- Show sample data with new IDs
SELECT id, name, type, status FROM metadata LIMIT 5;
