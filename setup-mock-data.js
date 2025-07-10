const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock user ID for development
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

async function setupMockData() {
  console.log('Setting up mock data for development...');
  
  try {
    // 1. Insert default preferences for mock user
    console.log('Creating user preferences for mock user...');
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: MOCK_USER_ID,
        email_notifications_enabled: true,
        notify_on_status_change: true,
        notify_on_assignee_change: true,
        notify_on_comments: true,
        notify_on_mentions: true,
        daily_digest: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
    if (prefsError) {
      console.error('Error creating user preferences:', prefsError);
    } else {
      console.log('✅ User preferences created successfully');
    }
    
    // 2. Insert a sample notification log
    console.log('Creating sample notification log...');
    const { data: logData, error: logError } = await supabase
      .from('email_notification_logs')
      .insert({
        type: 'status_change',
        ticket_id: 'DEMO-123',
        recipients: [MOCK_USER_ID],
        sender_id: MOCK_USER_ID,
        metadata: JSON.stringify({
          status: {
            from: 'Open',
            to: 'In Progress'
          },
          ticket: {
            title: 'Sample Ticket',
            url: '#'
          }
        }),
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
      
    if (logError) {
      console.error('Error creating notification log:', logError);
    } else {
      console.log('✅ Sample notification log created successfully');
    }
    
    console.log('Setup complete!');
  } catch (error) {
    console.error('Error setting up mock data:', error);
  }
}

// Run the setup
setupMockData();
