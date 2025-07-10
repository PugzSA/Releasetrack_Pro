import React, { useState } from 'react';
import { Button, Form, Container, Alert, Card, Spinner } from 'react-bootstrap';
import emailService from '../services/EmailService';
import { supabase } from '../services/supabase';

/**
 * Component for testing email functionality
 */
const EmailTest = () => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('Test Email from ReleaseTrack Pro');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Initialize email service with Supabase
  React.useEffect(() => {
    if (supabase) {
      emailService.setSupabase(supabase);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Generate a simple HTML email
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a6ee0;">ReleaseTrack Pro Test Email</h2>
          <p>This is a test email sent from the ReleaseTrack Pro application.</p>
          <p>If you're receiving this email, it means the Resend API integration is working correctly!</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <p style="margin: 0; font-size: 12px; color: #666;">
              This email was sent at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `;

      // Send the email
      const response = await emailService.sendEmail({
        to: [recipient],
        subject,
        html,
        recipientIds: ['test-user-id']
      });

      setResult(response);
      console.log('Email test result:', response);
    } catch (err) {
      setError(err.message || 'An error occurred while sending the email');
      console.error('Email test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header as="h5">Email Testing Tool</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Recipient Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                  Sending...
                </>
              ) : (
                'Send Test Email'
              )}
            </Button>
          </Form>

          {result && (
            <Alert variant="success" className="mt-3">
              <Alert.Heading>Email Sent Successfully!</Alert.Heading>
              <p>
                The email was sent successfully to {recipient}.
                {result.data?.id && <span> Email ID: {result.data.id}</span>}
              </p>
              <hr />
              <pre className="mb-0" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="mt-3">
              <Alert.Heading>Error Sending Email</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmailTest;
