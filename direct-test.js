// Direct test of the email proxy server
require('dotenv').config();

async function testEmailProxy() {
  try {
    console.log('🧪 Testing email proxy server directly...');
    
    const proxyUrl = 'http://localhost:3002/api/send-email';
    const recipients = ['kylecockcroft@gmail.com', 'kyle.cockcroft@watchmakergenomics.com'];
    
    console.log('📧 Sending test email to multiple recipients:', recipients.join(', '));
    
    const payload = {
      from: 'onboarding@resend.dev',
      to: recipients,
      subject: '[ReleaseTrack Pro] Multiple Recipients Test - ' + new Date().toLocaleTimeString(),
      html: `<h1>ReleaseTrack Pro Email Test</h1>
        <p>This is a test email sent to multiple recipients to verify that both addresses receive the notification.</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
        <p>Recipients: ${recipients.join(', ')}</p>
        <p>This confirms that the email proxy server is correctly handling multiple recipients.</p>`,
      text: `ReleaseTrack Pro Email Test

This is a test email sent to multiple recipients to verify that both addresses receive the notification.

Time sent: ${new Date().toLocaleString()}
Recipients: ${recipients.join(', ')}

This confirms that the email proxy server is correctly handling multiple recipients.`
    };
    
    console.log('📝 Request payload:', JSON.stringify(payload, null, 2));
    
    // We can't actually use single quotes in JSON as it's not valid JSON
    // Instead, let's create a properly formatted JSON string but log a single-quote version
    const singleQuotesDisplay = JSON.stringify(payload, null, 2)
      .replace(/"/g, "'");
      
    // For display purposes only
    console.log('📝 How it would look with single quotes (for display only):', singleQuotesDisplay);
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) // Use standard JSON
    });
    
    console.log('🔄 Response status:', response.status, response.statusText);
    
    const result = await response.json();
    console.log('📊 Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Test successful!');
    } else {
      console.error('❌ Test failed:', result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testEmailProxy();
