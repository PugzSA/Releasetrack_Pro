-- Create jumbotron_messages table for storing dashboard announcement messages
-- This table stores messages that will be displayed in the scrolling jumbotron

-- Check if the table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'jumbotron_messages') THEN
    CREATE TABLE jumbotron_messages (
      id SERIAL PRIMARY KEY,
      message TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      display_order INTEGER NOT NULL DEFAULT 0,
      background_color VARCHAR(7) DEFAULT '#007bff',
      text_color VARCHAR(7) DEFAULT '#ffffff',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add comments to the table and columns
    COMMENT ON TABLE jumbotron_messages IS 'Stores messages for the dashboard jumbotron';
    COMMENT ON COLUMN jumbotron_messages.message IS 'The message text to display';
    COMMENT ON COLUMN jumbotron_messages.is_active IS 'Whether the message is currently active';
    COMMENT ON COLUMN jumbotron_messages.display_order IS 'Order in which messages should be displayed';
    COMMENT ON COLUMN jumbotron_messages.background_color IS 'Background color for the message (hex format)';
    COMMENT ON COLUMN jumbotron_messages.text_color IS 'Text color for the message (hex format)';

    -- Create index on is_active and display_order for faster lookups
    CREATE INDEX idx_jumbotron_messages_active_order ON jumbotron_messages(is_active, display_order);

    -- Enable Row Level Security
    ALTER TABLE jumbotron_messages ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow all operations (can be restricted later)
    CREATE POLICY "Allow all" ON jumbotron_messages FOR ALL USING (true);

    -- Insert sample messages
    INSERT INTO jumbotron_messages (message, is_active, display_order, background_color, text_color) VALUES
      ('Welcome to ReleaseTrack Pro! Stay updated with the latest release information.', true, 1, '#007bff', '#ffffff'),
      ('Scheduled maintenance window: Sunday 2AM-4AM EST. System may be temporarily unavailable.', true, 2, '#ffc107', '#000000'),
      ('New feature release coming next week! Check the releases page for more details.', true, 3, '#28a745', '#ffffff');

    -- Create trigger for updated_at timestamp
    CREATE TRIGGER update_jumbotron_messages_modtime
    BEFORE UPDATE ON jumbotron_messages
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

    RAISE NOTICE 'jumbotron_messages table created successfully with sample data';
  ELSE
    RAISE NOTICE 'jumbotron_messages table already exists';
  END IF;
END
$$;

-- Add the jumbotron visibility setting to system_settings if it doesn't exist
INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES ('show_jumbotron', false, 'Show announcement jumbotron on dashboard')
ON CONFLICT (setting_key) DO NOTHING;
