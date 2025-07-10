# Email Notification System Documentation

## Overview

ReleaseTrack Pro now includes an email notification system that alerts users when ticket statuses change or when tickets are reassigned. This feature uses a browser-compatible implementation that simulates email sending in development and can be connected to [Resend.com](https://resend.com) in production environments. The system respects user notification preferences and provides UI feedback.

## Features

- **Ticket Status Change Notifications**: Emails sent when a ticket's status is updated
- **Ticket Assignment Notifications**: Emails sent when a ticket is assigned to a new user
- **User Preference Controls**: Users can customize which notifications they receive
- **HTML Email Templates**: Rich, formatted emails with ticket details and direct links
- **Notification Logging**: All sent emails are logged for audit purposes

## Setup and Configuration

### 1. Environment Variables

Add the following to your `.env` file:

```
REACT_APP_RESEND_API_KEY=your_resend_api_key_here
```

An example file is provided in `.env.example`.

### 2. Domain Verification

For production use, you'll need to verify your domain with Resend.com:

1. Create an account on [Resend.com](https://resend.com)
2. Add and verify your domain in the Resend dashboard
3. Once verified, update the `fromEmail` value in `src/services/EmailService.js`

For development and testing, the application uses Resend's pre-verified domain `onboarding@resend.dev`.

### 3. Database Tables

The system requires two database tables:

1. **user_preferences**: Stores user notification settings
2. **email_notification_logs**: Logs all sent email notifications

SQL migration scripts are provided in the `migrations` folder:
- `create_user_preferences_table.sql`
- `create_email_notification_logs_table.sql`

Run these scripts against your Supabase database to create the necessary tables.

## User Preferences

Users can control their notification preferences through the Settings page. The following options are available:

- **Enable email notifications**: Master switch for all notifications
- **Notify on status change**: When a ticket's status changes
- **Notify on assignee change**: When a ticket is assigned or reassigned
- **Notify on comments**: When someone comments on a relevant ticket
- **Notify on mentions**: When the user is mentioned in a comment
- **Daily digest**: A daily summary of ticket updates (future feature)

## Implementation Details

### Core Components

1. **EmailService.js**: Browser-compatible service class that simulates email sending in development and can be connected to Resend in production
2. **NotificationSettings.js**: Component for managing notification preferences
3. **NotificationToast.js**: UI component for showing email sending feedback
4. **AppContext.js**: Integration with the application context for ticket updates
5. **test-email.js**: Node.js script for testing email delivery using Resend API directly

### Email Templates

The system includes HTML templates for:
- Ticket status change notifications
- Ticket assignment notifications
- General notifications

Templates include:
- Ticket details
- Change information
- Direct link to the ticket
- User who made the change

## Testing

To test the email notification system:

1. Ensure your environment variables are set correctly
2. Run the test script: `node test-email.js`
3. Check the email inbox of the test users

## Troubleshooting

### Common Issues

1. **Emails not being sent**:
   - Check that the Resend API key is correct
   - Verify the sender email domain is verified in Resend
   - Check browser console for errors

2. **User not receiving notifications**:
   - Verify user preferences in the `user_preferences` table
   - Check if the user has disabled notifications
   - Ensure the user's email is correct in the database

3. **Database errors**:
   - Confirm that the migration scripts have been run
   - Check that the database tables have the correct structure

### Logs

Email sending attempts are logged in:
1. Browser console
2. The `email_notification_logs` table in Supabase

## Future Enhancements

Planned enhancements for the notification system include:

- Comment notifications
- @mention notifications
- Daily digest emails
- Email templates for different notification types
- User-specific notification scheduling

## Security Considerations

- API keys are stored in environment variables and not exposed in client code
- User email addresses are fetched securely from Supabase
- Email templates are sanitized to prevent XSS attacks
- Users have full control over which notifications they receive
