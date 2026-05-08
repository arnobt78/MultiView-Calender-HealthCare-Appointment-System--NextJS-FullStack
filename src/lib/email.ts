/**
 * Email Service Configuration
 * 
 * Supports Gmail SMTP (default) and Brevo SMTP (if configured).
 * The transport is selected based on environment variables.
 * 
 * Used for:
 * - Sending appointment invitation emails
 * - Sending dashboard access invitation emails
 * - Sending appointment reminders
 * - Welcome emails and password reset
 * 
 * Security Note: Email credentials should NEVER be committed to version control.
 * Always use environment variables (.env.local).
 */

import nodemailer from "nodemailer";

// Get email credentials from environment variables
const gmailUser = process.env.EMAIL_USER;
const gmailPass = process.env.EMAIL_PASS;

// Brevo SMTP credentials (optional, takes priority if set)
const brevoHost = process.env.BREVO_SMTP_HOST;
const brevoPort = process.env.BREVO_SMTP_PORT;
const brevoUser = process.env.BREVO_SMTP_USER;
const brevoPass = process.env.BREVO_SMTP_PASS;

/**
 * Create the appropriate email transporter based on available credentials.
 * Priority: Brevo SMTP > Gmail SMTP
 */
function createTransporter() {
  // Use Brevo SMTP if credentials are available
  if (brevoHost && brevoUser && brevoPass) {
    return nodemailer.createTransport({
      host: brevoHost,
      port: parseInt(brevoPort || "587", 10),
      secure: false, // true for 465, false for 587
      auth: {
        user: brevoUser,
        pass: brevoPass,
      },
    });
  }

  // Default: Gmail SMTP
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
}

export const transporter = createTransporter();

/** The "from" address for outgoing emails */
const fromAddress = process.env.EMAIL_FROM || gmailUser || brevoUser || "noreply@healthcalpro.app";

/**
 * Send an invitation email to a recipient.
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
  if (!gmailUser && !brevoUser) throw new Error("Missing email credentials");
  
  return transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });
}

/**
 * Send an appointment reminder email.
 */
export async function sendReminderEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!gmailUser && !brevoUser) throw new Error("Missing email credentials");
  
  return transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });
}

/**
 * Send a generic email (for welcome, verification, password reset, etc.)
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!gmailUser && !brevoUser) throw new Error("Missing email credentials");
  
  return transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });
}
