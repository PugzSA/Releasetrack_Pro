-- Create email_notification_logs table for tracking email notifications
BEGIN;

-- Check if the table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_notification_logs') THEN
    CREATE TABLE email_notification_logs (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      ticket_id INTEGER NOT NULL,
      recipients UUID[] NOT NULL,
      sender_id UUID,
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
    
    RAISE NOTICE 'Created email_notification_logs table';
  ELSE
    RAISE NOTICE 'email_notification_logs table already exists, skipping creation';
  END IF;
END $$;

COMMIT;
