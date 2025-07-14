-- SQL to create the saved_filters table in Supabase

-- Create the saved_filters table
CREATE TABLE IF NOT EXISTS saved_filters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  filter_type TEXT NOT NULL,
  filter_criteria JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS saved_filters_filter_type_idx ON saved_filters (filter_type);

-- Add comment to the table
COMMENT ON TABLE saved_filters IS 'Stores user-defined filter configurations for various pages';

-- Add RLS policies for security
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read all saved filters
CREATE POLICY "Users can view all saved filters" 
ON saved_filters FOR SELECT 
USING (true);

-- Policy to allow authenticated users to insert their own saved filters
CREATE POLICY "Users can create saved filters" 
ON saved_filters FOR INSERT 
WITH CHECK (true);

-- Policy to allow authenticated users to update their own saved filters
CREATE POLICY "Users can update their own saved filters" 
ON saved_filters FOR UPDATE 
USING (true);

-- Policy to allow authenticated users to delete their own saved filters
CREATE POLICY "Users can delete their own saved filters" 
ON saved_filters FOR DELETE 
USING (true);
