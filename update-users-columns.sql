-- Script to update column names in users table to match camelCase naming convention

-- First, check if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    -- Check if columns are in snake_case and need to be renamed
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'firstname') THEN
      -- Rename firstname to firstName (camelCase)
      ALTER TABLE users RENAME COLUMN firstname TO "firstName";
      RAISE NOTICE 'Column firstname renamed to firstName';
    ELSE
      RAISE NOTICE 'Column firstName already exists or has a different name';
    END IF;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lastname') THEN
      -- Rename lastname to lastName (camelCase)
      ALTER TABLE users RENAME COLUMN lastname TO "lastName";
      RAISE NOTICE 'Column lastname renamed to lastName';
    ELSE
      RAISE NOTICE 'Column lastName already exists or has a different name';
    END IF;
    
    -- Update comments on the renamed columns
    COMMENT ON COLUMN users."firstName" IS 'User''s first name';
    COMMENT ON COLUMN users."lastName" IS 'User''s last name';
    
    -- Recreate the index on lastName if it exists
    DROP INDEX IF EXISTS idx_users_lastname;
    CREATE INDEX idx_users_lastname ON users("lastName");
    
    RAISE NOTICE 'Users table columns updated to camelCase successfully';
  ELSE
    RAISE NOTICE 'Users table does not exist';
  END IF;
END $$;

-- Verify the current structure of the users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
