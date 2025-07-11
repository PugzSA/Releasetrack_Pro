-- First, rename the existing column to a temporary name
ALTER TABLE tickets RENAME COLUMN supportarea TO supportarea_temp;

-- Then create a new column with the proper case (using double quotes to preserve case)
ALTER TABLE tickets ADD COLUMN "supportArea" VARCHAR(50);

-- Copy data from the temporary column to the new one
UPDATE tickets SET "supportArea" = supportarea_temp;

-- Drop the temporary column
ALTER TABLE tickets DROP COLUMN supportarea_temp;
