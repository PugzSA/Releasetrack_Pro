import emailService from '../services/EmailService';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Set Supabase instance in EmailService
emailService.setSupabase(supabase);

/**
 * Test function to simulate a ticket status change notification
 */
async function testStatusChangeEmail() {
  try {
    console.log('Testing ticket status change email notification...');
    
    // Mock ticket data
    const ticket = {
      id: 'TEST-123',
      title: 'Test Ticket for Email Notification',
      description: 'This is a test ticket to verify email notifications are working',
      status: 'In Progress',
      priority: 'Medium',
      assignee_id: null, // Will be set from user query
      requester_id: null, // Will be set from user query
      created_at: new Date().toISOString()
    };
    
    // Get first user from database to use as assignee
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, firstName, lastName')
      .limit(2);
      
    if (userError) {
      throw new Error(`Error fetching users: ${userError.message}`);
    }
    
    if (!users || users.length < 1) {
      throw new Error('No users found in database for testing');
    }
    
    // Set assignee and requester
    const assignee = users[0];
    const requester = users.length > 1 ? users[1] : users[0];
    
    ticket.assignee_id = assignee.id;
    ticket.requester_id = requester.id;
    
    console.log(`Using assignee: ${assignee.firstName} ${assignee.lastName} (${assignee.email})`);
    console.log(`Using requester: ${requester.firstName} ${requester.lastName} (${requester.email})`);
    
    // Prepare recipients
    const recipients = [
      {
        id: assignee.id,
        email: assignee.email,
        name: `${assignee.firstName} ${assignee.lastName}`
      }
    ];
    
    // Add requester if different from assignee
    if (requester.id !== assignee.id) {
      recipients.push({
        id: requester.id,
        email: requester.email,
        name: `${requester.firstName} ${requester.lastName}`
      });
    }
    
    // Send test email
    const result = await emailService.sendTicketStatusChangeEmail({
      ticket,
      previousStatus: 'Open',
      user: {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User'
      },
      recipients
    });
    
    console.log('Email sent successfully:', result);
    console.log('Check the email inbox of the test users');
    
  } catch (error) {
    console.error('Error testing email notification:', error);
  }
}

// Run the test
testStatusChangeEmail();

export default testStatusChangeEmail;
