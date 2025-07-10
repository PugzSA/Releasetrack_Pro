// Test script to simulate a ticket update and trigger email notifications
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Import our EmailService
const EmailService = require('./src/services/EmailService');

// Sample ticket data
const sampleTicket = {
  id: 'ticket-123',
  title: 'Test Ticket',
  description: 'This is a test ticket to verify email notifications',
  status: 'in_progress',
  assignee: 'user-1',
  requester: 'user-2',
  priority: 'medium',
  created_at: new Date().toISOString()
};

// Mock user data
const mockUsers = {
  'user-1': { id: '00000000-0000-0000-0000-000000000001', email: 'kyle.cockcroft@watchmakergenomics.com', name: 'Kyle Cockcroft' },
  'user-2': { id: '00000000-0000-0000-0000-000000000002', email: 'bob@gmail.com', name: 'Bob Burger' },
  'user-3': { id: '00000000-0000-0000-0000-000000000003', email: 'alice@example.com', name: 'Alice Smith' }
};

// Simulate ticket update and send notification
async function simulateTicketUpdate() {
  console.log('🎫 Simulating ticket status update...');
  
  try {
    // Create email service instance
    const emailService = new EmailService();
    emailService.setSupabase(supabase);
    
    // Previous and updated ticket
    const previousTicket = { ...sampleTicket, status: 'open' };
    const updatedTicket = { ...sampleTicket, status: 'in_progress' };
    
    console.log(`🔄 Updating ticket status from ${previousTicket.status} to ${updatedTicket.status}`);
    
    // Get user data for assignee and requester
    const assignee = mockUsers[updatedTicket.assignee];
    const requester = mockUsers[updatedTicket.requester];
    
    // Current user (person making the change)
    const currentUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'kyle.cockcroft@watchmakergenomics.com',
      user_metadata: {
        full_name: 'Kyle Cockcroft'
      }
    };
    
    console.log('👥 Recipients:', [assignee, requester].filter(Boolean).map(u => u.email));
    
    // Send ticket status change email
    console.log('📧 Sending ticket status change notification...');
    const result = await emailService.sendTicketStatusChangeEmail({
      ticket: updatedTicket,
      previousStatus: previousTicket.status,
      user: currentUser,
      recipients: [assignee, requester].filter(Boolean)
    });
    
    console.log('✅ Email notification result:', result);
  } catch (error) {
    console.error('❌ Error simulating ticket update:', error);
  }
}

// Run the simulation
simulateTicketUpdate()
  .then(() => console.log('🏁 Simulation complete'))
  .catch(err => console.error('❌ Simulation failed:', err));
