// Test with single quotes in JSON payload
require('dotenv').config();

async function testWithSingleQuotes() {
  try {
    console.log('🧪 Testing email proxy server with single quotes JSON...');
    
    const proxyUrl = 'http://localhost:3002/api/send-email';
    const recipients = ['kylecockcroft@gmail.com', 'kyle.cockcroft@watchmakergenomics.com'];
    
    console.log('📧 Sending test email to multiple recipients:', recipients.join(', '));
    
    // Create a payload with single quotes (this is not valid JSON)
    const singleQuotesPayload = `{
      'from': 'onboarding@resend.dev',
      'to': ['kylecockcroft@gmail.com', 'kyle.cockcroft@watchmakergenomics.com'],
      'subject': '[ReleaseTrack Pro] Single Quotes Test - ${new Date().toLocaleTimeString()}',
      'html': '<h1>Single Quotes JSON Test</h1><p>This tests how the server handles single quotes in JSON.</p>',
      'text': 'Single Quotes JSON Test - This tests how the server handles single quotes in JSON.'
    }`;
    
    console.log('📝 Single quotes payload:', singleQuotesPayload);
    
    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: singleQuotesPayload // Using the single quotes JSON string
      });
      
      console.log('🔄 Response status:', response.status, response.statusText);
      
      try {
        const result = await response.json();
        console.log('📊 Response data:', JSON.stringify(result, null, 2));
      } catch (jsonError) {
        console.error('❌ Error parsing response JSON:', jsonError.message);
        const text = await response.text();
        console.log('📄 Response text:', text);
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError.message);
    }
    
    // Now try with a properly formatted JSON for comparison
    console.log('\n🧪 Now testing with proper JSON for comparison...');
    
    const properPayload = {
      from: 'onboarding@resend.dev',
      to: recipients,
      subject: `[ReleaseTrack Pro] Proper JSON Test - ${new Date().toLocaleTimeString()}`,
      html: '<h1>Proper JSON Test</h1><p>This tests with properly formatted JSON.</p>',
      text: 'Proper JSON Test - This tests with properly formatted JSON.'
    };
    
    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(properPayload)
      });
      
      console.log('🔄 Response status:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('📊 Response data:', JSON.stringify(result, null, 2));
      
      if (response.ok) {
        console.log('✅ Proper JSON test successful!');
      } else {
        console.error('❌ Proper JSON test failed:', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Error during proper JSON test:', error);
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testWithSingleQuotes();
