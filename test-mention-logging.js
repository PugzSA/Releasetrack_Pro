// Test script to verify @mention notification logging is working
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMentionLogging() {
  console.log('🧪 Testing @mention notification logging...');
  
  try {
    // Check current notification logs count
    const { data: beforeLogs, error: beforeError } = await supabase
      .from('email_notification_logs')
      .select('*')
      .eq('type', 'mention');
    
    if (beforeError) {
      console.error('Error fetching logs before test:', beforeError);
      return;
    }
    
    console.log(`📊 Current mention logs count: ${beforeLogs?.length || 0}`);
    
    // Get a test ticket
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .limit(1);
    
    if (ticketsError || !tickets || tickets.length === 0) {
      console.error('Error fetching tickets or no tickets found:', ticketsError);
      return;
    }
    
    const testTicket = tickets[0];
    console.log(`📋 Using test ticket: ${testTicket.id}`);
    
    // Get users for mention test
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    if (usersError || !users || users.length < 2) {
      console.error('Error fetching users or insufficient users:', usersError);
      return;
    }
    
    const commenter = users[0];
    const mentionedUser = users[1];
    
    console.log(`👤 Commenter: ${commenter.firstName} ${commenter.lastName} (${commenter.email})`);
    console.log(`👤 Mentioned user: ${mentionedUser.firstName} ${mentionedUser.lastName} (${mentionedUser.email})`);
    
    // Create a test comment with @mention
    const testComment = {
      ticket_id: testTicket.id,
      user_id: commenter.id,
      content: `This is a test comment mentioning @${mentionedUser.firstName} ${mentionedUser.lastName} to verify logging functionality.`,
      created_at: new Date().toISOString()
    };
    
    console.log('💬 Creating test comment with @mention...');
    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .insert(testComment)
      .select()
      .single();
    
    if (commentError) {
      console.error('Error creating test comment:', commentError);
      return;
    }
    
    console.log('✅ Test comment created successfully!');
    console.log('📧 @mention email notification should have been sent and logged');
    
    // Wait a moment for the notification to be processed
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if a new mention log was created
    const { data: afterLogs, error: afterError } = await supabase
      .from('email_notification_logs')
      .select('*')
      .eq('type', 'mention')
      .order('sent_at', { ascending: false });
    
    if (afterError) {
      console.error('Error fetching logs after test:', afterError);
      return;
    }
    
    console.log(`📊 Mention logs count after test: ${afterLogs?.length || 0}`);
    
    if (afterLogs && afterLogs.length > (beforeLogs?.length || 0)) {
      console.log('✅ SUCCESS: New mention notification log was created!');
      const latestLog = afterLogs[0];
      console.log('📋 Latest mention log details:');
      console.log(`   - Type: ${latestLog.type}`);
      console.log(`   - Ticket: ${latestLog.ticket_id}`);
      console.log(`   - Sender ID: ${latestLog.sender_id}`);
      console.log(`   - Recipients: ${latestLog.recipients?.length || 0} user(s)`);
      console.log(`   - Sent At: ${latestLog.sent_at}`);
    } else {
      console.log('❌ ISSUE: No new mention notification log was created');
      console.log('💡 This might indicate the @mention logging is not working properly');
    }
    
    // Clean up - delete the test comment
    console.log('🧹 Cleaning up test comment...');
    await supabase
      .from('comments')
      .delete()
      .eq('id', commentData.id);
    
    console.log('✅ Test comment cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing mention logging:', error);
  }
}

// Run the test
testMentionLogging()
  .then(() => console.log('🏁 Mention logging test complete'))
  .catch(err => console.error('❌ Test failed:', err));
