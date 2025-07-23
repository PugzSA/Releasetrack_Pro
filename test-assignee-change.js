// Test script to verify assignee change email notifications are working
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAssigneeChangeNotification() {
  console.log("🧪 Testing assignee change email notification...");

  try {
    // Get a test ticket
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("*")
      .limit(1);

    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError);
      return;
    }

    if (!tickets || tickets.length === 0) {
      console.log("No tickets found to test with");
      return;
    }

    const testTicket = tickets[0];
    console.log(`📋 Using test ticket: ${testTicket.id}`);

    // Get users to assign
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(3);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    if (!users || users.length < 2) {
      console.log("Need at least 2 users to test assignee change");
      return;
    }

    // Find a different user to assign to
    const currentAssigneeId = testTicket.assignee_id;
    const newAssignee = users.find((u) => u.id !== currentAssigneeId);

    if (!newAssignee) {
      console.log("Could not find a different user to assign to");
      return;
    }

    console.log(`👤 Current assignee ID: ${currentAssigneeId}`);
    console.log(
      `👤 New assignee: ${newAssignee.firstName} ${newAssignee.lastName} (ID: ${newAssignee.id})`
    );

    // Update the ticket assignee
    console.log("🔄 Updating ticket assignee...");
    const { data: updatedTicket, error: updateError } = await supabase
      .from("tickets")
      .update({
        assignee_id: newAssignee.id,
        assignee: `${newAssignee.firstName} ${newAssignee.lastName}`,
      })
      .eq("id", testTicket.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating ticket:", updateError);
      return;
    }

    console.log("✅ Ticket updated successfully!");
    console.log("📧 Email notification should have been sent automatically");
    console.log(
      "📬 Check the console logs and email inboxes for notification delivery"
    );
    console.log(
      `📧 Expected email content: "Assignee changed from [Previous] to ${newAssignee.firstName} ${newAssignee.lastName}"`
    );

    // Revert the change after a few seconds
    setTimeout(async () => {
      console.log("🔄 Reverting assignee change...");
      await supabase
        .from("tickets")
        .update({
          assignee_id: currentAssigneeId,
          assignee: testTicket.assignee,
        })
        .eq("id", testTicket.id);
      console.log("✅ Reverted assignee change");
    }, 5000);
  } catch (error) {
    console.error("❌ Error testing assignee change notification:", error);
  }
}

// Run the test
testAssigneeChangeNotification()
  .then(() => console.log("🏁 Test complete"))
  .catch((err) => console.error("❌ Test failed:", err));
