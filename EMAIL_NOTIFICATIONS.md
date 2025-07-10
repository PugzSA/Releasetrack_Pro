# Email Notifications with Resend.com

This document outlines the implementation of email notifications for ticket status changes in ReleaseTrack Pro using Resend.com as the email delivery service.

## Overview

The system sends automated email notifications to relevant stakeholders (assignees and requesters) when a ticket's status changes. This helps keep team members informed about progress on tickets without requiring them to constantly check the application.

## Implementation Details

### 1. Email Service

The email functionality is implemented in `src/services/EmailService.js`, which provides:

- A wrapper around the Resend.com API
- Methods for sending ticket status change notifications
- Methods for sending general ticket notifications
- HTML email templates with responsive design

### 2. Integration Points

Email notifications are triggered from:

- `AppContext.js`: When a ticket status changes, it automatically sends notifications to relevant users
- `EditTicketModal.js`: Displays a notification toast when emails are sent

### 3. Configuration

Email settings are configured through environment variables:

```
REACT_APP_RESEND_API_KEY=your_resend_api_key
REACT_APP_EMAIL_FROM=notifications@yourdomain.com
```

These should be added to your `.env` file (see `.env.example` for reference).

## Setup Instructions

1. **Sign up for Resend.com**
   - Create an account at [resend.com](https://resend.com)
   - Generate an API key from your dashboard

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env` if you haven't already
   - Add your Resend API key to `REACT_APP_RESEND_API_KEY`
   - Set your sender email in `REACT_APP_EMAIL_FROM`

3. **Install Dependencies**
   ```
   npm install resend
   ```

## Email Templates

The implementation includes two email templates:

1. **Status Change Notification**
   - Sent when a ticket status changes
   - Includes before/after status information
   - Contains key ticket details and a link to view the ticket

2. **General Ticket Notification**
   - For other ticket-related notifications
   - Customizable message content
   - Includes ticket details and a link

## Testing Email Notifications

To test the email notification system:

1. Ensure you have configured the Resend API key
2. Edit a ticket and change its status
3. The system will automatically send notifications to the ticket's assignee and requester
4. A notification toast will appear confirming the email was sent

## Extending the Email System

To add new types of email notifications:

1. Add new methods to `EmailService.js`
2. Create appropriate HTML templates
3. Call the new methods from the relevant components or context

## Troubleshooting

If emails are not being sent:

1. Check the browser console for errors
2. Verify your Resend API key is correct
3. Ensure the recipient email addresses are valid
4. Check your Resend.com dashboard for delivery status and logs

## Security Considerations

- The Resend API key is stored in environment variables and not exposed to clients
- Email templates are sanitized to prevent XSS attacks
- User email addresses are only retrieved for users directly involved with a ticket
