-- Create system_settings table for storing application-wide configuration
-- This table stores key-value pairs for system-wide settings

-- Check if the table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'system_settings') THEN
    CREATE TABLE system_settings (
      id SERIAL PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value BOOLEAN NOT NULL DEFAULT FALSE,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add comments to the table and columns
    COMMENT ON TABLE system_settings IS 'Stores system-wide configuration settings';
    COMMENT ON COLUMN system_settings.setting_key IS 'Unique identifier for the setting';
    COMMENT ON COLUMN system_settings.setting_value IS 'Boolean value of the setting';
    COMMENT ON COLUMN system_settings.description IS 'Human-readable description of the setting';

    -- Create index on setting_key for faster lookups
    CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

    -- Enable Row Level Security
    ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow all operations (can be restricted later)
    CREATE POLICY "Allow all" ON system_settings FOR ALL USING (true);

    -- Insert default system settings
    INSERT INTO system_settings (setting_key, setting_value, description) VALUES
      ('email_notifications_enabled', true, 'Master switch for all email notifications'),
      ('notify_on_status_change', true, 'Send notifications when ticket status changes'),
      ('notify_on_assignee_change', true, 'Send notifications when ticket assignee changes'),
      ('notify_on_comments', true, 'Send notifications when comments are added to tickets'),
      ('notify_on_mentions', true, 'Send notifications when users are mentioned in comments'),
      ('daily_digest', false, 'Send daily digest emails'),
      ('show_supabase_connection_test', false, 'Show Supabase connection test on dashboard');

    -- Create trigger for updated_at timestamp
    CREATE TRIGGER update_system_settings_modtime
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

    RAISE NOTICE 'system_settings table created successfully with default values';
  ELSE
    RAISE NOTICE 'system_settings table already exists';
  END IF;
END
$$;
