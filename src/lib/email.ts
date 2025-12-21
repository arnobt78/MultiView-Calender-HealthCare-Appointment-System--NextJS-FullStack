/**
 * Email Service Configuration
 * 
 * This file configures and exports email sending functionality using Nodemailer.
 * Currently configured for Gmail SMTP, but can be adapted for other email providers.
 * 
 * Used for:
 * - Sending appointment invitation emails
 * - Sending dashboard access invitation emails
 * 
 * Security Note: Email credentials should NEVER be committed to version control.
 * Always use environment variables (.env.local).
 */

import nodemailer from "nodemailer";

// Get email credentials from environment variables
// These should be set in .env.local file
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

/**
 * Nodemailer Transporter Configuration
 * 
 * Creates a reusable email transporter instance configured for Gmail SMTP.
 * The transporter handles the connection to the email server.
 * 
 * Configuration:
 * - service: "gmail" uses Gmail's SMTP servers
 * - auth: Authentication credentials (username and password/app password)
 * 
 * Note: For Gmail, you may need to use an "App Password" instead of your regular password.
 * Enable 2FA and generate an app password in your Google Account settings.
 */
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass,
  },
});

/**
 * sendInvitationEmail Function
 * 
 * Sends an HTML email invitation to a recipient.
 * Used for sending appointment and dashboard access invitations.
 * 
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML content of the email (can include links, formatting, etc.)
 * @returns Promise that resolves when email is sent
 * @throws Error if email credentials are missing
 * 
 * Example usage:
 * await sendInvitationEmail({
 *   to: "user@example.com",
 *   subject: "You're invited!",
 *   html: "<p>Click <a href='...'>here</a> to accept</p>"
 * });
 */
export async function sendInvitationEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Validate that email credentials are configured
  if (!user || !pass) throw new Error("Missing email credentials");
  
  // Send email using the configured transporter
  return transporter.sendMail({
    from: user, // Sender email (from environment variable)
    to,         // Recipient email
    subject,     // Email subject
    html,       // HTML email body (supports rich formatting and links)
  });
}
