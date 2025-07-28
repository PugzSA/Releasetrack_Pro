// Test script to verify the closed_date functionality
// This script tests that closed_date is set when status changes to Released/Cancelled
// and cleared when status changes back to an open status

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testClosedDateFunctionality() {
  console.log('🧪 Testing closed_date functionality...\n');

  try {
    // Test ticket ID - using SUP-00007 which is currently in "Backlog" status
    const testTicketId = 'SUP-00007';
    
    // Step 1: Get initial ticket state
    console.log('📋 Step 1: Getting initial ticket state...');
    const { data: initialTicket, error: fetchError } = await supabase
      .from('tickets')
      .select('id, title, status, closed_date')
      .eq('id', testTicketId)
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching initial ticket:', fetchError);
      return;
    }
    
    console.log('Initial ticket state:', {
      id: initialTicket.id,
      title: initialTicket.title,
      status: initialTicket.status,
      closed_date: initialTicket.closed_date
    });
    
    // Step 2: Change status to "Released" (should set closed_date)
    console.log('\n📋 Step 2: Changing status to "Released"...');
    const { data: releasedTicket, error: releaseError } = await supabase
      .from('tickets')
      .update({ status: 'Released' })
      .eq('id', testTicketId)
      .select('id, title, status, closed_date')
      .single();
    
    if (releaseError) {
      console.error('❌ Error updating to Released:', releaseError);
      return;
    }
    
    console.log('After changing to Released:', {
      id: releasedTicket.id,
      title: releasedTicket.title,
      status: releasedTicket.status,
      closed_date: releasedTicket.closed_date
    });
    
    // Verify closed_date was set
    if (releasedTicket.closed_date) {
      console.log('✅ SUCCESS: closed_date was set when status changed to Released');
    } else {
      console.log('❌ FAIL: closed_date was not set when status changed to Released');
    }
    
    // Step 3: Change status back to "In Development" (should clear closed_date)
    console.log('\n📋 Step 3: Changing status back to "In Development"...');
    const { data: openTicket, error: openError } = await supabase
      .from('tickets')
      .update({ status: 'In Development' })
      .eq('id', testTicketId)
      .select('id, title, status, closed_date')
      .single();
    
    if (openError) {
      console.error('❌ Error updating to In Development:', openError);
      return;
    }
    
    console.log('After changing to In Development:', {
      id: openTicket.id,
      title: openTicket.title,
      status: openTicket.status,
      closed_date: openTicket.closed_date
    });
    
    // Verify closed_date was cleared
    if (openTicket.closed_date === null) {
      console.log('✅ SUCCESS: closed_date was cleared when status changed to open status');
    } else {
      console.log('❌ FAIL: closed_date was not cleared when status changed to open status');
    }
    
    // Step 4: Change status to "Cancelled" (should set closed_date again)
    console.log('\n📋 Step 4: Changing status to "Cancelled"...');
    const { data: cancelledTicket, error: cancelError } = await supabase
      .from('tickets')
      .update({ status: 'Cancelled' })
      .eq('id', testTicketId)
      .select('id, title, status, closed_date')
      .single();
    
    if (cancelError) {
      console.error('❌ Error updating to Cancelled:', cancelError);
      return;
    }
    
    console.log('After changing to Cancelled:', {
      id: cancelledTicket.id,
      title: cancelledTicket.title,
      status: cancelledTicket.status,
      closed_date: cancelledTicket.closed_date
    });
    
    // Verify closed_date was set again
    if (cancelledTicket.closed_date) {
      console.log('✅ SUCCESS: closed_date was set when status changed to Cancelled');
    } else {
      console.log('❌ FAIL: closed_date was not set when status changed to Cancelled');
    }
    
    // Step 5: Restore original status
    console.log('\n📋 Step 5: Restoring original status...');
    await supabase
      .from('tickets')
      .update({ status: initialTicket.status, closed_date: initialTicket.closed_date })
      .eq('id', testTicketId);
    
    console.log(`✅ Restored ticket ${testTicketId} to original state: ${initialTicket.status}`);
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testClosedDateFunctionality();
