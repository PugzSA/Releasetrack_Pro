import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ALLOWED_DOMAIN = 'watchmakergenomics.com';

serve(async (req) => {
  try {
    const { record } = await req.json();

    // The user record is available in the 'record' property
    // The email is available in record.email
    const email = record?.email;

    if (!email) {
      throw new Error('Email not available in the user record');
    }

    const domain = email.substring(email.lastIndexOf('@') + 1);

    if (domain !== ALLOWED_DOMAIN) {
      // If the domain is not allowed, throw an error.
      // This will prevent the user from signing in.
      throw new Error(`Domain not allowed: ${domain}`);
    }

    // If the domain is allowed, return a success response.
    // You can also add custom claims to the token here if needed.
    const response = {
      session: { 
        // You can add custom data to the session here
      },
    };

    return new Response(
      JSON.stringify(response),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }
})