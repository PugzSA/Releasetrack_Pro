-- Create Comments table for ticket commenting system
-- This table stores comments made on tickets with support for user mentions

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(20) NOT NULL,
    user_id UUID NOT NULL, -- References auth.users (Google authenticated user)
    content TEXT NOT NULL,
    mentions INTEGER[] DEFAULT '{}', -- Array of user IDs from public.users table that are mentioned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_comments_ticket 
        FOREIGN KEY (ticket_id) 
        REFERENCES tickets(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_comments_user 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE
);

-- Add comments to the table and columns
COMMENT ON TABLE comments IS 'Stores comments made on tickets with mention support';
COMMENT ON COLUMN comments.id IS 'Unique identifier for the comment';
COMMENT ON COLUMN comments.ticket_id IS 'Foreign key to tickets table';
COMMENT ON COLUMN comments.user_id IS 'Foreign key to auth.users (Google authenticated user)';
COMMENT ON COLUMN comments.content IS 'The comment text content';
COMMENT ON COLUMN comments.mentions IS 'Array of user IDs from public.users table that are mentioned in the comment';
COMMENT ON COLUMN comments.created_at IS 'Timestamp when the comment was created';
COMMENT ON COLUMN comments.updated_at IS 'Timestamp when the comment was last updated';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_mentions ON comments USING GIN(mentions);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (can be restricted later)
CREATE POLICY "Allow all operations on comments" ON comments FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON comments TO authenticated;
GRANT ALL ON comments TO anon;
GRANT USAGE, SELECT ON SEQUENCE comments_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE comments_id_seq TO anon;
