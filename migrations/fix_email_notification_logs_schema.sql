-- Fix email_notification_logs table schema to match actual user ID types
-- The users table uses INTEGER IDs, not UUIDs

BEGIN;

-- Check if we need to update the table schema
DO $$
BEGIN
  -- Check if the recipients column is currently UUID[]
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'email_notification_logs' 
    AND column_name = 'recipients' 
    AND data_type = 'ARRAY'
    AND udt_name = '_uuid'
  ) THEN
    RAISE NOTICE 'Updating email_notification_logs schema to use INTEGER types...';
    
    -- Drop the existing table and recreate with correct types
    DROP TABLE IF EXISTS email_notification_logs;
    
    -- Recreate with correct data types
    CREATE TABLE email_notification_logs (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      ticket_id VARCHAR(50) NOT NULL, -- Changed from INTEGER to VARCHAR to match tickets.id
      recipients INTEGER[] NOT NULL,  -- Changed from UUID[] to INTEGER[] to match users.id
      sender_id INTEGER,              -- Changed from UUID to INTEGER to match users.id
      metadata JSONB DEFAULT '{}'::jsonb,
      sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add indexes for better performance
    CREATE INDEX idx_email_logs_ticket_id ON email_notification_logs(ticket_id);
    CREATE INDEX idx_email_logs_sender_id ON email_notification_logs(sender_id);
    CREATE INDEX idx_email_logs_type ON email_notification_logs(type);
    
    -- Add comments to the table and columns
    COMMENT ON TABLE email_notification_logs IS 'Logs of all email notifications sent by the system';
    COMMENT ON COLUMN email_notification_logs.type IS 'Type of notification (status_change, assignee_change, comment, mention, etc.)';
    COMMENT ON COLUMN email_notification_logs.ticket_id IS 'ID of the ticket related to the notification';
    COMMENT ON COLUMN email_notification_logs.recipients IS 'Array of user IDs who received the notification';
    COMMENT ON COLUMN email_notification_logs.sender_id IS 'User ID of the person who triggered the notification';
    COMMENT ON COLUMN email_notification_logs.metadata IS 'Additional data related to the notification (JSON)';
    COMMENT ON COLUMN email_notification_logs.sent_at IS 'When the notification was sent';
    
    RAISE NOTICE 'Successfully updated email_notification_logs table schema';
  ELSE
    RAISE NOTICE 'email_notification_logs table schema is already correct or table does not exist';
  END IF;
END $$;

COMMIT;
