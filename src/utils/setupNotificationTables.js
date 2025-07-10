import { createClient } from '@supabase/supabase-js';

/**
 * Utility to check and create notification-related tables in Supabase
 * This can be run from the browser to ensure the tables exist
 */
export async function setupNotificationTables(supabase) {
  if (!supabase) {
    console.error('Supabase client not provided');
    return { success: false, error: 'Supabase client not provided' };
  }

  try {
    console.log('Checking for user_preferences table...');
    
    // Check if user_preferences table exists
    const { data: userPrefsExists, error: userPrefsCheckError } = await supabase
      .from('user_preferences')
      .select('id')
      .limit(1);
    
    if (userPrefsCheckError && userPrefsCheckError.code === '42P01') { // Table doesn't exist error
      console.log('Creating user_preferences table...');
      
      // Create user_preferences table using direct SQL query
      const createUserPrefsQuery = `
        CREATE TABLE IF NOT EXISTS user_preferences (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL,
          email_notifications_enabled BOOLEAN DEFAULT TRUE,
          notify_on_status_change BOOLEAN DEFAULT TRUE,
          notify_on_assignee_change BOOLEAN DEFAULT TRUE,
          notify_on_comments BOOLEAN DEFAULT TRUE,
          notify_on_mentions BOOLEAN DEFAULT TRUE,
          daily_digest BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
      `;
      
      const { error: createUserPrefsError } = await supabase.rpc('exec_sql', { sql: createUserPrefsQuery });
      
      if (createUserPrefsError) {
        console.error('Error creating user_preferences table:', createUserPrefsError);
        // If the RPC approach fails, we'll try a fallback approach
        console.log('Falling back to REST API for table creation');
        return await createTablesViaAPI(supabase);
      }
      
      console.log('user_preferences table created successfully');
    } else {
      console.log('user_preferences table already exists');
    }
    
    // Check if email_notification_logs table exists
    console.log('Checking for email_notification_logs table...');
    const { data: logsExists, error: logsCheckError } = await supabase
      .from('email_notification_logs')
      .select('id')
      .limit(1);
    
    if (logsCheckError && logsCheckError.code === '42P01') { // Table doesn't exist error
      console.log('Creating email_notification_logs table...');
      
      // Create email_notification_logs table using direct SQL query
      const createLogsQuery = `
        CREATE TABLE IF NOT EXISTS email_notification_logs (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          ticket_id VARCHAR(50) NOT NULL,
          recipients TEXT[] NOT NULL,
          sender_id UUID,
          metadata JSONB DEFAULT '{}'::jsonb,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_email_logs_ticket_id ON email_notification_logs(ticket_id);
        CREATE INDEX IF NOT EXISTS idx_email_logs_sender_id ON email_notification_logs(sender_id);
        CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_notification_logs(type);
      `;
      
      const { error: createLogsError } = await supabase.rpc('exec_sql', { sql: createLogsQuery });
      
      if (createLogsError) {
        console.error('Error creating email_notification_logs table:', createLogsError);
        // If the RPC approach fails, we'll try a fallback approach
        console.log('Falling back to REST API for table creation');
        return await createTablesViaAPI(supabase);
      }
      
      console.log('email_notification_logs table created successfully');
    } else {
      console.log('email_notification_logs table already exists');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting up notification tables:', error);
    return { success: false, error };
  }
}

/**
 * Create stored procedures in Supabase to create the tables
 * This should be run by an admin user with appropriate permissions
 */
export async function createStoredProcedures(supabase) {
  if (!supabase) {
    console.error('Supabase client not provided');
    return { success: false, error: 'Supabase client not provided' };
  }
  
  try {
    // Create stored procedure for user_preferences table
    const createUserPrefsProc = `
      CREATE OR REPLACE FUNCTION create_user_preferences_table()
      RETURNS void AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS user_preferences (
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
        
        CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Create stored procedure for email_notification_logs table
    const createLogsProc = `
      CREATE OR REPLACE FUNCTION create_email_notification_logs_table()
      RETURNS void AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS email_notification_logs (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          ticket_id INTEGER NOT NULL,
          recipients UUID[] NOT NULL,
          sender_id UUID,
          metadata JSONB DEFAULT '{}'::jsonb,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_email_logs_ticket_id ON email_notification_logs(ticket_id);
        CREATE INDEX IF NOT EXISTS idx_email_logs_sender_id ON email_notification_logs(sender_id);
        CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_notification_logs(type);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Execute the SQL to create the stored procedures
    const { error: userPrefsError } = await supabase.rpc('exec_sql', { sql: createUserPrefsProc });
    if (userPrefsError) {
      console.error('Error creating user_preferences stored procedure:', userPrefsError);
      return { success: false, error: userPrefsError };
    }
    
    const { error: logsError } = await supabase.rpc('exec_sql', { sql: createLogsProc });
    if (logsError) {
      console.error('Error creating email_notification_logs stored procedure:', logsError);
      return { success: false, error: logsError };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating stored procedures:', error);
    return { success: false, error };
  }
}

/**
 * Fallback method to create tables via REST API
 * This is used when the SQL approach fails
 */
async function createTablesViaAPI(supabase) {
  try {
    // Create user_preferences table via direct insert
    console.log('Attempting to create user_preferences via REST API...');
    
    // First, try to create a dummy record to force table creation
    const { error: userPrefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        email_notifications_enabled: true,
        notify_on_status_change: true,
        notify_on_assignee_change: true,
        notify_on_comments: true,
        notify_on_mentions: true,
        daily_digest: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (userPrefsError && userPrefsError.code !== '23505') { // Ignore unique constraint violations
      console.error('Error creating user_preferences via REST API:', userPrefsError);
    } else {
      console.log('Successfully created user_preferences table via REST API');
    }
    
    // Create email_notification_logs table via direct insert
    console.log('Attempting to create email_notification_logs via REST API...');
    
    const { error: logsError } = await supabase
      .from('email_notification_logs')
      .insert({
        type: 'system_init',
        ticket_id: 'SYSTEM-0',
        recipients: ['00000000-0000-0000-0000-000000000000'], // Dummy recipient
        sender_id: null,
        metadata: { message: 'System initialization' },
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    
    if (logsError && logsError.code !== '23505') { // Ignore unique constraint violations
      console.error('Error creating email_notification_logs via REST API:', logsError);
    } else {
      console.log('Successfully created email_notification_logs table via REST API');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in createTablesViaAPI:', error);
    return { success: false, error };
  }
}

export default setupNotificationTables;
