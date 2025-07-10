-- Create user_preferences table for email notification settings
BEGIN;

-- Check if the table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_preferences') THEN
    CREATE TABLE user_preferences (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      email_notifications_enabled BOOLEAN DEFAULT TRUE,
      notify_on_status_change BOOLEAN DEFAULT TRUE,
      notify_on_assignee_change BOOLEAN DEFAULT TRUE,
      notify_on_comments BOOLEAN DEFAULT TRUE,
      notify_on_mentions BOOLEAN DEFAULT TRUE,
      daily_digest BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
    );

    -- Add indexes for better performance
    CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
    
    -- Add comments to the table and columns
    COMMENT ON TABLE user_preferences IS 'Stores user preferences for email notifications and other settings';
    COMMENT ON COLUMN user_preferences.email_notifications_enabled IS 'Master switch for all email notifications';
    COMMENT ON COLUMN user_preferences.notify_on_status_change IS 'Whether to notify when ticket status changes';
    COMMENT ON COLUMN user_preferences.notify_on_assignee_change IS 'Whether to notify when ticket assignee changes';
    COMMENT ON COLUMN user_preferences.notify_on_comments IS 'Whether to notify when someone comments on a ticket';
    COMMENT ON COLUMN user_preferences.notify_on_mentions IS 'Whether to notify when user is mentioned in a comment';
    COMMENT ON COLUMN user_preferences.daily_digest IS 'Whether to send a daily digest of ticket updates';
    
    RAISE NOTICE 'Created user_preferences table';
  ELSE
    RAISE NOTICE 'user_preferences table already exists, skipping creation';
  END IF;
END $$;

COMMIT;
