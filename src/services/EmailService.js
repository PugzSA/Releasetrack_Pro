// Email service for sending notifications
// This service works in both browser and Node.js environments

class EmailService {
  /**
   * Validates and extracts email addresses from recipient objects
   * @param {Array} recipients - Array of recipient objects with email property
   * @returns {Array} - Array of valid email addresses
   * @private
   */
  validateAndExtractEmails(recipients) {
    if (!recipients || recipients.length === 0) {
      console.warn("⚠️ No recipients provided for validation");
      return [];
    }

    // Filter and extract valid email addresses
    const validEmails = recipients
      .filter((r) => r && typeof r === "object")
      .map((r) => {
        if (!r.email) {
          console.warn(`⚠️ Recipient missing email property:`, r);
          return null;
        }
        if (typeof r.email !== "string") {
          console.warn(`⚠️ Recipient email is not a string:`, r.email);
          return null;
        }
        if (!r.email.includes("@")) {
          console.warn(`⚠️ Invalid email format (missing @):`, r.email);
          return null;
        }
        return r.email;
      })
      .filter((email) => email !== null);

    console.log("✅ Valid emails after validation:", validEmails);

    return validEmails;
  }

  constructor() {
    console.log("DEBUG: EmailService constructor starting");
    try {
      // Store configuration for email sending
      this.apiKey = process.env.REACT_APP_RESEND_API_KEY;
      console.log("DEBUG: API Key available:", !!this.apiKey);

      // Using custom domain for email notifications
      this.fromEmail =
        process.env.REACT_APP_EMAIL_FROM || "notifications@sfdctest.online";
      this.supabase = null; // Will be set when AppContext initializes

      // We'll initialize Resend SDK on demand to avoid browser compatibility issues
      this.resend = null;

      console.log("EmailService initialized with from email:", this.fromEmail);
    } catch (error) {
      console.error("DEBUG: Error in EmailService constructor:", error);
    }
    console.log("DEBUG: EmailService constructor completed");
  }

  /**
   * Set the Supabase instance for database access
   * @param {Object} supabase - Supabase client instance
   */
  setSupabase(supabase) {
    this.supabase = supabase;
  }

  /**
   * Log email notification to the database for audit purposes
   * @param {Object} options - Log options
   * @param {string} options.type - Type of notification (status_change, assignee_change, etc.)
   * @param {string} options.ticketId - ID of the ticket related to the notification
   * @param {Array} options.recipients - Array of recipient user IDs
   * @param {string} options.senderId - ID of the user who triggered the notification
   * @param {Object} options.metadata - Additional metadata about the notification
   * @returns {Promise<Object>} - Result of the logging operation
   */
  async logEmailNotification({
    type,
    ticketId,
    recipients,
    senderId,
    metadata = {},
  }) {
    console.log("DEBUG: Logging email notification");
    try {
      if (!this.supabase) {
        console.warn("Cannot log email notification: Supabase not initialized");
        return { success: false, error: "Supabase not initialized" };
      }

      // Create a log entry in the database
      const { data, error } = await this.supabase
        .from("email_notification_logs")
        .insert({
          type,
          ticket_id: ticketId,
          recipients: recipients,
          sender_id: senderId,
          metadata,
        });

      if (error) {
        console.error("Error logging email notification:", error);
        return { success: false, error: error.message };
      }

      console.log("Email notification logged successfully");
      return { success: true, data };
    } catch (error) {
      console.error("Error logging email notification:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Filter recipients based on their notification preferences
   * @param {Array} recipients - Array of recipient objects with user IDs
   * @param {string} preferenceType - Type of notification preference to check
   * @returns {Promise<Array>} - Filtered array of recipients
   */
  async filterRecipientsByPreference(recipients, preferenceType) {
    if (!recipients || recipients.length === 0) {
      return [];
    }

    if (!this.supabase) {
      console.warn("Cannot filter recipients: Supabase not initialized");
      return recipients; // Return all recipients if we can't filter
    }

    try {
      const recipientIds = recipients.map((r) => r.id);

      // Get notification preferences for all recipients
      const { data, error } = await this.supabase
        .from("user_preferences")
        .select("user_id, notify_on_status_change, notify_on_assignee_change")
        .in("user_id", recipientIds);

      if (error) {
        console.error("Error fetching notification preferences:", error);
        return recipients; // Return all recipients if there's an error
      }

      // Create a map of user IDs to their preferences
      const preferencesMap = {};
      data.forEach((pref) => {
        preferencesMap[pref.user_id] = pref;
      });

      // Filter recipients based on their preferences
      return recipients.filter((recipient) => {
        const prefs = preferencesMap[recipient.id];

        // If no preferences found, include by default
        if (!prefs) {
          return true;
        }

        // Check specific preference type
        switch (preferenceType) {
          case "notify_on_status_change":
            return prefs.notify_on_status_change !== false; // Default to true if not set
          case "notify_on_assignee_change":
            return prefs.notify_on_assignee_change !== false; // Default to true if not set
          default:
            return true; // Include by default for unknown preference types
        }
      });
    } catch (error) {
      console.error("Error filtering recipients by preference:", error);
      return recipients; // Return all recipients if there's an error
    }
  }

  /**
   * Send an email using Resend API
   * @param {Object} options - Email options
   * @param {Array} options.to - Array of recipient email addresses
   * @param {string} options.subject - Email subject
   * @param {string} options.html - Email HTML content
   * @param {Array} options.recipientIds - Array of recipient user IDs
   * @returns {Promise<Object>} - Result of the email sending operation
   * @private
   */
  async sendEmail({ to, subject, html, recipientIds }) {
    try {
      if (!to || to.length === 0) {
        return { success: false, error: "No recipients provided" };
      }

      // Validate email addresses to ensure they're properly formatted
      const validatedEmails = to.filter((email) => {
        if (typeof email !== "string") {
          console.warn(
            `⚠️ Invalid email type: ${typeof email}, value: ${email}`
          );
          return false;
        }
        if (!email.includes("@")) {
          console.warn(`⚠️ Invalid email format (missing @): ${email}`);
          return false;
        }
        return true;
      });

      // If no valid emails remain after validation, return an error
      if (validatedEmails.length === 0) {
        console.error("❌ No valid email addresses found after validation!");
        return { success: false, error: "No valid email addresses provided" };
      }

      // Replace the original 'to' with our validated emails
      to = validatedEmails;

      // Enhanced logging for debugging recipient email addresses
      console.log("📧 DETAILED EMAIL RECIPIENTS LOG 📧");
      console.log("Total recipients:", to.length);
      console.log("Recipient emails (exact format being sent to API):");
      to.forEach((email, index) => {
        console.log(`  ${index + 1}. [${typeof email}] "${email}"`);
        // Check for common issues with email addresses
        if (typeof email !== "string") {
          console.warn(
            `⚠️ WARNING: Recipient #${
              index + 1
            } is not a string but ${typeof email}`
          );
        } else if (!email.includes("@")) {
          console.warn(
            `⚠️ WARNING: Recipient #${
              index + 1
            } "${email}" does not contain @ symbol`
          );
        } else if (email.includes("<") && email.includes(">")) {
          console.warn(
            `⚠️ WARNING: Recipient #${
              index + 1
            } "${email}" appears to be in "Name <email>" format which may not work`
          );
        }
      });

      // Determine if we're in a browser or Node.js environment
      const isBrowser = typeof window !== "undefined";
      console.log(
        `Running in ${isBrowser ? "browser" : "Node.js"} environment`
      );

      // Prepare the email payload
      const emailPayload = {
        from: this.fromEmail,
        to,
        subject,
        html,
      };

      let result;

      if (isBrowser) {
        // In browser environment, use the local proxy server
        console.log("Sending email via local proxy server");

        try {
          // Send the email using fetch API to our local proxy server
          const proxyUrl =
            process.env.REACT_APP_EMAIL_PROXY_URL ||
            "http://localhost:3002/api/send-email";

          console.log(`Using proxy URL: ${proxyUrl}`);

          // Log the exact payload being sent to the proxy server
          console.log("📧 DETAILED EMAIL REQUEST PAYLOAD:");
          console.log(JSON.stringify(emailPayload, null, 2));
          console.log(
            "📧 Recipients type:",
            Array.isArray(emailPayload.to) ? "Array" : typeof emailPayload.to
          );
          console.log(
            "📧 Recipients count:",
            Array.isArray(emailPayload.to) ? emailPayload.to.length : "N/A"
          );

          const payloadString = JSON.stringify(emailPayload);
          console.log(
            "📧 Final JSON payload length:",
            payloadString.length,
            "bytes"
          );

          const response = await fetch(proxyUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: payloadString,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
          }

          result = await response.json();
          console.log("Email sent successfully via proxy server");
        } catch (error) {
          console.error("Error sending email via proxy server:", error);
          throw error;
        }
      } else {
        // In Node.js environment, use the Resend SDK directly
        console.log("Sending email via Resend SDK");

        // Initialize Resend SDK if not already done
        if (!this.resend && this.apiKey) {
          const { Resend } = require("resend");
          this.resend = new Resend(this.apiKey);
        }

        if (!this.resend) {
          throw new Error(
            "Resend SDK not initialized. API key may be missing."
          );
        }

        try {
          // Send the email using Resend SDK
          const { data, error } = await this.resend.emails.send(emailPayload);

          if (error) {
            throw new Error(error.message);
          }

          result = { success: true, data };
          console.log("Email sent successfully via Resend SDK");
        } catch (error) {
          console.error("Error sending email via Resend SDK:", error);
          throw error;
        }
      }

      return result;
    } catch (error) {
      console.error("❌ Error sending email:", error);

      // For development, we'll provide detailed error information
      return {
        success: false,
        error: error.message,
        details: error.toString(),
      };
    }
  }

  /**
   * Send a ticket status change notification email
   * @param {Object} options - Email options
   * @param {Object} options.ticket - The updated ticket object
   * @param {Object} options.previousStatus - The previous status of the ticket
   * @param {Object} options.user - The user who made the change
   * @param {Array} options.recipients - Array of recipient email addresses with user IDs
   */
  async sendTicketStatusChangeEmail({
    ticket,
    previousStatus,
    user,
    recipients,
  }) {
    try {
      if (!recipients || recipients.length === 0) {
        console.warn("No recipients provided for ticket status change email");
        return;
      }

      // Check system settings to see if status change notifications are enabled globally
      const systemSettings = await this.getSystemSettings();

      if (
        !systemSettings.emailNotificationsEnabled ||
        !systemSettings.notifyOnStatusChange
      ) {
        console.log("Status change notifications are disabled system-wide");
        return {
          success: true,
          skipped: true,
          reason: "Status change notifications disabled system-wide",
        };
      }

      // Use all recipients since system settings control this globally
      const filteredRecipients = recipients;

      // Debug logging for recipient data before mapping to emails
      console.log(
        "🔍 DEBUG: Original recipients before filtering:",
        recipients
      );
      console.log(
        "🔍 DEBUG: Filtered recipients for status change notification:"
      );
      filteredRecipients.forEach((recipient, index) => {
        console.log(
          `  ${index + 1}. ID: ${recipient.id}, Email: ${
            recipient.email
          }, Name: ${recipient?.name || "N/A"}`
        );
        if (
          !recipient.email ||
          typeof recipient.email !== "string" ||
          !recipient.email.includes("@")
        ) {
          console.warn(
            `  ⚠️ WARNING: Recipient #${index + 1} has invalid email format: ${
              recipient.email
            }`
          );
        }
      });

      // Extract and validate email addresses
      const validatedEmails = filteredRecipients
        .filter(
          (r) =>
            r && r.email && typeof r.email === "string" && r.email.includes("@")
        )
        .map((r) => r.email);

      console.log(
        "🔍 DEBUG: Valid email addresses to be used:",
        validatedEmails
      );

      if (validatedEmails.length === 0) {
        console.error("❌ No valid email addresses found in recipients!");
        return { success: false, error: "No valid email addresses found" };
      }

      const subject = `[ReleaseTrack Pro] Ticket ${ticket.id} Status Changed: ${previousStatus} → ${ticket.status}`;

      const htmlContent = this.generateTicketStatusChangeHtml({
        ticket,
        previousStatus,
        user,
      });

      // Send the email using our sendEmail helper method with validated emails
      const result = await this.sendEmail({
        to: validatedEmails, // Use the already validated emails array
        subject: subject,
        html: htmlContent,
        recipientIds: filteredRecipients.map((r) => r.id),
      });

      if (!result.success) {
        console.error("Error sending status change email:", result.error);
        return { success: false, error: result.error };
      }

      // Log the email notification
      await this.logEmailNotification({
        type: "status_change",
        ticketId: ticket.id,
        recipients: filteredRecipients.map((r) => r.id),
        senderId: user?.id,
        metadata: {
          previousStatus,
          newStatus: ticket.status,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error sending status change email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send an assignee change notification email
   * @param {Object} options - Email options
   * @param {Object} options.ticket - The updated ticket object
   * @param {Object} options.previousAssignee - The previous assignee of the ticket
   * @param {Object} options.user - The user who made the change
   * @param {Array} options.recipients - Array of recipient email addresses with user IDs
   */
  async sendAssigneeChangeEmail({
    ticket,
    previousAssignee,
    user,
    recipients,
  }) {
    try {
      if (!recipients || recipients.length === 0) {
        console.warn("No recipients provided for assignee change email");
        return;
      }

      // Check system settings to see if assignee change notifications are enabled globally
      const systemSettings = await this.getSystemSettings();

      if (
        !systemSettings.emailNotificationsEnabled ||
        !systemSettings.notifyOnAssigneeChange
      ) {
        console.log("Assignee change notifications are disabled system-wide");
        return {
          success: true,
          skipped: true,
          reason: "Assignee change notifications disabled system-wide",
        };
      }

      // Use all recipients since system settings control this globally
      const filteredRecipients = recipients;

      // Debug logging for recipient data before mapping to emails
      console.log(
        "🔍 DEBUG: Original recipients before filtering:",
        recipients
      );
      console.log(
        "🔍 DEBUG: Filtered recipients for assignee change notification:"
      );
      filteredRecipients.forEach((recipient, index) => {
        console.log(
          `  ${index + 1}. ID: ${recipient.id}, Email: ${
            recipient.email
          }, Name: ${recipient?.name || "N/A"}`
        );
        if (
          !recipient.email ||
          typeof recipient.email !== "string" ||
          !recipient.email.includes("@")
        ) {
          console.warn(
            `  ⚠️ WARNING: Recipient #${index + 1} has invalid email format: ${
              recipient.email
            }`
          );
        }
      });

      // Extract and validate email addresses
      const validatedEmails = filteredRecipients
        .filter(
          (r) =>
            r && r.email && typeof r.email === "string" && r.email.includes("@")
        )
        .map((r) => r.email);

      console.log(
        "🔍 DEBUG: Valid email addresses to be used:",
        validatedEmails
      );

      if (validatedEmails.length === 0) {
        console.error("❌ No valid email addresses found in recipients!");
        return { success: false, error: "No valid email addresses found" };
      }

      let subject = "Ticket Assignee Changed";

      if (ticket.id) {
        subject = `[ReleaseTrack Pro] Ticket ${ticket.id} Assignee Changed`;
      }

      const htmlContent = this.generateAssigneeChangeHtml({
        ticket,
        previousAssignee,
        user,
      });

      // Send the email using our sendEmail helper method
      const result = await this.sendEmail({
        to: validatedEmails,
        subject: `[ReleaseTrack Pro] ${subject}`,
        html: htmlContent,
        recipientIds: filteredRecipients.map((r) => r.id),
      });

      if (!result.success) {
        console.error("Error sending assignee change email:", result.error);
        return { success: false, error: result.error };
      }

      // Log the email notification
      await this.logEmailNotification({
        type: "assignee_change",
        ticketId: ticket.id,
        recipients: filteredRecipients.map((r) => r.id),
        senderId: user?.id,
        metadata: {
          previousAssignee,
          newAssignee: ticket.assignee,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error sending assignee change email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate HTML content for ticket status change email
   * @param {Object} options - Options for generating HTML content
   * @param {Object} options.ticket - The updated ticket object
   * @param {string} options.previousStatus - The previous status of the ticket
   * @param {Object} options.user - The user who made the change
   * @returns {string} - HTML content for the email
   */
  generateTicketStatusChangeHtml({ ticket, previousStatus, user }) {
    const userName = user?.name || "A user";
    const ticketTitle = ticket.title || "Untitled Ticket";
    const ticketId = ticket.id || "Unknown";
    const oldStatus = previousStatus || "Unknown";
    const newStatus = ticket.status || "Unknown";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            background-color: #4a86e8;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 10px 20px;
            font-size: 12px;
            color: #777;
          }
          .status-change {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #4a86e8;
          }
          .status-old {
            color: #777;
            text-decoration: line-through;
          }
          .status-new {
            color: #4a86e8;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Ticket Status Update</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>${userName} has updated the status of ticket <strong>${ticketId}: ${ticketTitle}</strong>.</p>
          
          <div class="status-change">
            Status changed from <span class="status-old">${oldStatus}</span> to <span class="status-new">${newStatus}</span>
          </div>
          
          <p>You can view the ticket details by logging into ReleaseTrack Pro.</p>
          
          <p>Thank you,<br>ReleaseTrack Pro Team</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from ReleaseTrack Pro. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML content for assignee change email
   * @param {Object} options - Options for generating HTML content
   * @param {Object} options.ticket - The updated ticket object
   * @param {string} options.previousAssignee - The previous assignee of the ticket
   * @param {Object} options.user - The user who made the change
   * @returns {string} - HTML content for the email
   */
  generateAssigneeChangeHtml({ ticket, previousAssignee, user }) {
    const userName = user?.name || "A user";
    const ticketTitle = ticket.title || "Untitled Ticket";
    const ticketId = ticket.id || "Unknown";
    const oldAssignee = previousAssignee || "Unassigned";
    const newAssignee = ticket.assignee || "Unassigned";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            background-color: #4a86e8;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 10px 20px;
            font-size: 12px;
            color: #777;
          }
          .assignee-change {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #4a86e8;
          }
          .assignee-old {
            color: #777;
            text-decoration: line-through;
          }
          .assignee-new {
            color: #4a86e8;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Ticket Assignee Update</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>${userName} has updated the assignee of ticket <strong>${ticketId}: ${ticketTitle}</strong>.</p>
          
          <div class="assignee-change">
            Assignee changed from <span class="assignee-old">${oldAssignee}</span> to <span class="assignee-new">${newAssignee}</span>
          </div>
          
          <p>You can view the ticket details by logging into ReleaseTrack Pro.</p>
          
          <p>Thank you,<br>ReleaseTrack Pro Team</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from ReleaseTrack Pro. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML template for mention notifications
   * @param {Object} params - Template parameters
   * @param {string} params.mentionedUserName - Name of the mentioned user
   * @param {string} params.commenterName - Name of the person who made the comment
   * @param {string} params.ticketId - Ticket ID
   * @param {string} params.ticketTitle - Ticket title
   * @param {string} params.commentContent - The comment content
   * @param {string} params.ticketUrl - URL to view the ticket (optional)
   * @returns {string} HTML email template
   */
  generateMentionNotificationTemplate({
    mentionedUserName,
    commenterName,
    ticketId,
    ticketTitle,
    commentContent,
    ticketUrl = "#",
  }) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You've been mentioned in a comment</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .mention-highlight {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 500;
          }
          .ticket-info {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .ticket-id {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-weight: 600;
            color: #0d6efd;
            font-size: 14px;
          }
          .ticket-title {
            font-size: 16px;
            font-weight: 600;
            color: #495057;
            margin: 8px 0;
          }
          .comment-box {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-left: 4px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-style: italic;
          }
          .comment-author {
            font-weight: 600;
            color: #495057;
            margin-bottom: 8px;
          }
          .comment-content {
            color: #212529;
            line-height: 1.6;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            margin: 20px 0;
            transition: transform 0.2s ease;
          }
          .cta-button:hover {
            transform: translateY(-1px);
            color: white;
            text-decoration: none;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
          }
          .footer p {
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>💬 You've been mentioned!</h2>
          </div>
          <div class="content">
            <p>Hello ${mentionedUserName},</p>
            <p><strong>${commenterName}</strong> mentioned you in a comment on a ticket.</p>

            <div class="ticket-info">
              <div class="ticket-id">${ticketId}</div>
              <div class="ticket-title">${ticketTitle}</div>
            </div>

            <div class="comment-box">
              <div class="comment-author">${commenterName} commented:</div>
              <div class="comment-content">${commentContent}</div>
            </div>

            <p>Click the button below to view the ticket and respond to the comment:</p>

            <a href="${ticketUrl}" class="cta-button">View Ticket & Comment</a>

            <p>You can manage your notification preferences in the Settings section of ReleaseTrack Pro.</p>

            <p>Best regards,<br>ReleaseTrack Pro Team</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from ReleaseTrack Pro. Please do not reply to this email.</p>
            <p>If you no longer wish to receive mention notifications, you can disable them in your notification settings.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send mention notification emails to mentioned users
   * @param {Object} params - Parameters for sending mention notifications
   * @param {Array} params.mentionedUserIds - Array of user IDs that were mentioned
   * @param {Object} params.comment - The comment object containing the mention
   * @param {Object} params.ticket - The ticket object the comment belongs to
   * @param {Object} params.commenter - The user who made the comment
   * @param {Array} params.allUsers - Array of all users for lookup
   * @returns {Promise<Object>} Result of the email sending operation
   */
  async sendMentionNotifications({
    mentionedUserIds,
    comment,
    ticket,
    commenter,
    allUsers,
  }) {
    try {
      console.log("📧 Starting mention notification process...");
      console.log("Mentioned user IDs:", mentionedUserIds);

      if (!mentionedUserIds || mentionedUserIds.length === 0) {
        console.log("No users mentioned, skipping email notifications");
        return { success: true, message: "No mentions to process" };
      }

      // Get mentioned users from the users table
      const mentionedUsers = allUsers.filter((user) =>
        mentionedUserIds.includes(user.id)
      );

      if (mentionedUsers.length === 0) {
        console.log("No valid mentioned users found");
        return { success: true, message: "No valid mentioned users found" };
      }

      console.log(
        `Found ${mentionedUsers.length} mentioned users:`,
        mentionedUsers.map((u) => `${u.firstName} ${u.lastName} (${u.email})`)
      );

      // Check user preferences for each mentioned user
      const emailPromises = mentionedUsers.map(async (mentionedUser) => {
        try {
          // Check system settings to see if mention notifications are enabled globally
          const systemSettings = await this.getSystemSettings();

          if (
            !systemSettings.emailNotificationsEnabled ||
            !systemSettings.notifyOnMentions
          ) {
            console.log(
              `Skipping email for ${mentionedUser.email} - mention notifications disabled system-wide`
            );
            return {
              success: true,
              skipped: true,
              reason: "Mention notifications are disabled system-wide",
              user: mentionedUser.email,
            };
          }

          console.log(
            `Sending mention email to ${mentionedUser.email} (${mentionedUser.firstName} ${mentionedUser.lastName})`
          );

          // Generate the email content
          const commenterName =
            commenter.user_metadata?.full_name ||
            commenter.user_metadata?.name ||
            commenter.email?.split("@")[0] ||
            "Someone";

          const mentionedUserName = `${mentionedUser.firstName} ${mentionedUser.lastName}`;

          const html = this.generateMentionNotificationTemplate({
            mentionedUserName,
            commenterName,
            ticketId: ticket.id,
            ticketTitle: ticket.title,
            commentContent: comment.content,
            ticketUrl: `${window.location.origin}/tickets/${ticket.id}`, // You might want to make this configurable
          });

          // Send the email
          const emailResult = await this.sendEmail({
            to: [mentionedUser.email],
            subject: `💬 You've been mentioned in ${ticket.id}`,
            html,
            recipientIds: [mentionedUser.id],
          });

          // Log the notification (optional - can be implemented later)
          if (emailResult.success) {
            console.log(
              `📧 Successfully sent mention email to ${mentionedUser.email} for ticket ${ticket.id}`
            );
            // TODO: Implement logNotification method if needed for audit trail
            // await this.logNotification({
            //   userId: mentionedUser.id,
            //   type: "mention",
            //   ticketId: ticket.id,
            //   emailSent: true,
            //   emailContent: html,
            // });
          }

          return {
            ...emailResult,
            user: mentionedUser.email,
          };
        } catch (error) {
          console.error(
            `Error sending mention email to ${mentionedUser.email}:`,
            error
          );
          return {
            success: false,
            error: error.message,
            user: mentionedUser.email,
          };
        }
      });

      // Wait for all emails to be sent
      const results = await Promise.all(emailPromises);

      const successful = results.filter((r) => r.success && !r.skipped).length;
      const skipped = results.filter((r) => r.skipped).length;
      const failed = results.filter((r) => !r.success).length;

      console.log(
        `📧 Mention notification results: ${successful} sent, ${skipped} skipped, ${failed} failed`
      );

      return {
        success: true,
        results,
        summary: {
          sent: successful,
          skipped,
          failed,
        },
      };
    } catch (error) {
      console.error("❌ Error in sendMentionNotifications:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get system-wide notification settings
   * @returns {Promise<Object>} System settings object
   */
  async getSystemSettings() {
    try {
      if (!this.supabase) {
        console.warn("Supabase not initialized, using default system settings");
        return {
          emailNotificationsEnabled: true,
          notifyOnMentions: true,
          notifyOnStatusChange: true,
          notifyOnAssigneeChange: true,
          notifyOnComments: true,
          dailyDigest: false,
        };
      }

      // Fetch system settings from database
      const { data: settingsData, error: settingsError } = await this.supabase
        .from("system_settings")
        .select("setting_key, setting_value");

      if (settingsError) {
        console.error("Error fetching system settings:", settingsError);
        // Return defaults if there's an error
        return {
          emailNotificationsEnabled: true,
          notifyOnMentions: true,
          notifyOnStatusChange: true,
          notifyOnAssigneeChange: true,
          notifyOnComments: true,
          dailyDigest: false,
        };
      }

      // Convert array of settings to object
      const settings = {
        emailNotificationsEnabled: true,
        notifyOnMentions: true,
        notifyOnStatusChange: true,
        notifyOnAssigneeChange: true,
        notifyOnComments: true,
        dailyDigest: false,
      };

      settingsData.forEach((setting) => {
        const key = setting.setting_key;
        const value = setting.setting_value;

        switch (key) {
          case "email_notifications_enabled":
            settings.emailNotificationsEnabled = value;
            break;
          case "notify_on_mentions":
            settings.notifyOnMentions = value;
            break;
          case "notify_on_status_change":
            settings.notifyOnStatusChange = value;
            break;
          case "notify_on_assignee_change":
            settings.notifyOnAssigneeChange = value;
            break;
          case "notify_on_comments":
            settings.notifyOnComments = value;
            break;
          case "daily_digest":
            settings.dailyDigest = value;
            break;
          default:
            break;
        }
      });

      return settings;
    } catch (error) {
      console.error("Error getting system settings:", error);
      return {
        emailNotificationsEnabled: true,
        notifyOnMentions: true,
        notifyOnStatusChange: true,
        notifyOnAssigneeChange: true,
        notifyOnComments: true,
        dailyDigest: false,
      };
    }
  }

  /**
   * Get user notification preferences (DEPRECATED - kept for backward compatibility)
   * @param {string} userEmail - User's email address
   * @returns {Promise<Object>} User preferences object
   */
  async getUserPreferences(userEmail) {
    try {
      if (!this.supabase) {
        console.warn("Supabase not initialized, using default preferences");
        return {
          emailNotificationsEnabled: true,
          notifyOnMentions: true,
        };
      }

      // Get the current authenticated user
      const {
        data: { user },
        error: authError,
      } = await this.supabase.auth.getUser();

      if (authError || !user) {
        console.warn("No authenticated user found, using default preferences");
        return {
          emailNotificationsEnabled: true,
          notifyOnMentions: true,
        };
      }

      // For now, we'll check if the email matches the current user
      // In a production app, you might want to implement a more robust user lookup
      if (user.email !== userEmail) {
        console.warn(
          `Email ${userEmail} doesn't match current user, using default preferences`
        );
        return {
          emailNotificationsEnabled: true,
          notifyOnMentions: true,
        };
      }

      // Get user preferences for the current user
      const { data: preferences, error: prefError } = await this.supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);

      if (prefError || !preferences || preferences.length === 0) {
        console.warn(
          `No preferences found for user ${userEmail}, using defaults`
        );
        return {
          emailNotificationsEnabled: true,
          notifyOnMentions: true,
        };
      }

      return {
        emailNotificationsEnabled: preferences[0].email_notifications_enabled,
        notifyOnMentions: preferences[0].notify_on_mentions,
      };
    } catch (error) {
      console.error("Error getting user preferences:", error);
      return {
        emailNotificationsEnabled: true,
        notifyOnMentions: true,
      };
    }
  }
}

// Create a singleton instance of the EmailService
const emailService = new EmailService();

// Handle both CommonJS and ES module environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = emailService;
} else {
  window.emailService = emailService;
}
