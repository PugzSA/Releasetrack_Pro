# ReleaseTrack Pro Email Notification System

This document provides a comprehensive guide to the email notification system implemented in ReleaseTrack Pro. The system uses a browser-compatible approach that simulates email sending in development and can be connected to Resend.com in production environments.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Setup Instructions](#setup-instructions)
4. [User Preferences](#user-preferences)
5. [Implementation Details](#implementation-details)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Overview

The email notification system in ReleaseTrack Pro automatically sends notifications to relevant users when ticket statuses change or when tickets are reassigned. The system respects user notification preferences and provides visual feedback in the UI when notifications are sent.

## Features

- **Ticket Status Change Notifications**: Emails sent when a ticket's status is updated
- **Ticket Assignment Notifications**: Emails sent when a ticket is assigned to a new user
- **User Preference Controls**: Users can customize which notifications they receive
- **HTML Email Templates**: Rich, formatted emails with ticket details and direct links
- **Notification Logging**: All sent emails are logged for audit purposes
- **UI Feedback**: Toast notifications when emails are sent

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```
REACT_APP_RESEND_API_KEY=your_resend_api_key_here
```

You can obtain a Resend API key by signing up at [Resend.com](https://resend.com).

### 2. Domain Verification

For production use, you'll need to verify your domain with Resend.com:

1. Create an account on [Resend.com](https://resend.com)
2. Add and verify your domain in the Resend dashboard
3. Once verified, update the `fromEmail` value in `src/services/EmailService.js`

For development and testing, the application uses Resend's pre-verified domain `onboarding@resend.dev`.

### 3. Database Tables

The system automatically creates two database tables when the application starts:

1. **user_preferences**: Stores user notification settings
2. **email_notification_logs**: Logs all sent email notifications

If you need to manually create these tables, SQL migration scripts are provided in the `migrations` folder:
- `create_user_preferences_table.sql`
- `create_email_notification_logs_table.sql`

### 3. Dependencies

The system uses a browser-compatible approach for email notifications. For testing email delivery with the Resend API, the following dependencies are used:

```bash
npm install axios @supabase/supabase-js dotenv
```

## User Preferences

Users can control their notification preferences through the Settings page:

1. Navigate to the Settings page
2. Click on the "Notification Settings" tab
3. Configure preferences:
   - **Enable email notifications**: Master switch for all notifications
   - **Notify on status change**: When a ticket's status changes
   - **Notify on assignee change**: When a ticket is assigned or reassigned
   - **Notify on comments**: When someone comments on a relevant ticket
   - **Notify on mentions**: When the user is mentioned in a comment
   - **Daily digest**: A daily summary of ticket updates (future feature)

## Implementation Details

### Core Components

1. **EmailService.js**: Browser-compatible service class for email notifications
   - Located in `src/services/EmailService.js`
   - Simulates email sending in development environment
   - Can be connected to Resend API in production environments
   - Manages email templates and sending logic
   - Respects user preferences
   - Logs email notifications

2. **NotificationSettings.js**: Component for managing notification preferences
   - Located in `src/components/settings/NotificationSettings.js`
   - Provides UI for users to set their preferences
   - Saves preferences to the database

3. **NotificationToast.js**: UI component for showing email sending feedback
   - Located in `src/components/common/NotificationToast.js`
   - Displays toast notifications when emails are sent

4. **AppContext.js**: Integration with the application context
   - Detects ticket status and assignee changes
   - Triggers email notifications
   - Initializes notification tables

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

The email notification system can be tested in two ways:

### 1. In-Browser Testing

In development mode, the EmailService simulates email sending and logs the details to the console. To test this:

1. Start the application with `npm start`
2. Update a ticket's status or assignee
3. Check the browser console for email simulation logs
4. Verify that notification toasts appear in the UI

### 2. Direct API Testing

To test actual email delivery using the Resend API:

1. Ensure your environment variables are set correctly in `.env`
2. Run the test script:
   ```bash
   npm run test-email
   ```
3. Check the email inbox of the test users

You can also test the system by:
1. Creating or editing a ticket
2. Changing its status or assignee
3. Observing the toast notification
4. Checking the recipient's email inbox

## Troubleshooting

### Common Issues

1. **Emails not being sent in production**:
   - Check that the Resend API key is correct
   - Verify the sender email domain is verified in Resend
   - Check browser console for errors
   
2. **Module resolution errors with Resend SDK**:
   - The application uses a browser-compatible approach that avoids direct use of the Resend SDK in the browser
   - If you need to use the Resend SDK directly, consider using a server-side API endpoint
   - For testing, use the provided `test-email.js` script which uses Axios to call the Resend API directly

3. **User not receiving notifications**:
   - Verify user preferences in the `user_preferences` table
   - Check if the user has disabled notifications
   - Ensure the user's email is correct in the database

4. **Database errors**:
   - Check that the database tables have the correct structure
   - Verify that the application has permission to access the tables

### Logs

Email sending attempts are logged in:
1. Browser console
2. The `email_notification_logs` table in Supabase

You can view the logs in the Supabase dashboard or query the table directly:

```sql
SELECT * FROM email_notification_logs ORDER BY sent_at DESC LIMIT 10;
```

---

For more detailed documentation, see the `docs/EMAIL_NOTIFICATIONS.md` file.
