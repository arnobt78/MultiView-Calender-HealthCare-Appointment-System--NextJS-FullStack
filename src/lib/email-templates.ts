/**
 * Email Templates
 * 
 * Styled HTML email templates for transactional emails.
 * All templates use inline CSS for maximum email client compatibility.
 */

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
  background-color: #ffffff;
`;

const headerStyle = `
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 32px 24px;
  text-align: center;
  border-radius: 8px 8px 0 0;
`;

const bodyStyle = `
  padding: 32px 24px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-top: none;
`;

const footerStyle = `
  padding: 16px 24px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  background: #f9fafb;
`;

const buttonStyle = `
  display: inline-block;
  padding: 12px 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  margin: 16px 0;
`;

function wrapTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:20px;background:#f3f4f6;">
  <div style="${baseStyle}">
    ${content}
    <div style="${footerStyle}">
      <p>HealthCal Pro — Appointment Management</p>
      <p>This is an automated message. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
}

// --- Invitation Email ---
export function invitationEmailTemplate({
  inviterName,
  inviteeEmail,
  resourceType,
  resourceName,
  permission,
  acceptUrl,
}: {
  inviterName: string;
  inviteeEmail: string;
  resourceType: "appointment" | "dashboard";
  resourceName: string;
  permission: string;
  acceptUrl: string;
}): { subject: string; html: string } {
  const typeLabel = resourceType === "appointment" ? "Appointment" : "Dashboard";

  return {
    subject: `You've been invited to access ${typeLabel}: ${resourceName}`,
    html: wrapTemplate(`
      <div style="${headerStyle}">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">📩 ${typeLabel} Invitation</h1>
      </div>
      <div style="${bodyStyle}">
        <p style="font-size:16px;color:#374151;">Hello,</p>
        <p style="font-size:14px;color:#6b7280;">
          <strong>${inviterName}</strong> has invited <strong>${inviteeEmail}</strong> 
          to access the following ${typeLabel.toLowerCase()}:
        </p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;font-size:14px;"><strong>${typeLabel}:</strong> ${resourceName}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Permission:</strong> ${permission}</p>
        </div>
        <div style="text-align:center;">
          <a href="${acceptUrl}" style="${buttonStyle}">Accept Invitation</a>
        </div>
        <p style="font-size:12px;color:#9ca3af;margin-top:24px;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `),
  };
}

// --- Appointment Reminder Email ---
export function appointmentReminderTemplate({
  recipientName,
  appointmentTitle,
  appointmentDate,
  appointmentTime,
  location,
  dashboardUrl,
}: {
  recipientName: string;
  appointmentTitle: string;
  appointmentDate: string;
  appointmentTime: string;
  location?: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Reminder: ${appointmentTitle} — ${appointmentDate}`,
    html: wrapTemplate(`
      <div style="${headerStyle}">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">⏰ Appointment Reminder</h1>
      </div>
      <div style="${bodyStyle}">
        <p style="font-size:16px;color:#374151;">Hello ${recipientName},</p>
        <p style="font-size:14px;color:#6b7280;">
          This is a reminder for your upcoming appointment:
        </p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;font-size:14px;"><strong>Title:</strong> ${appointmentTitle}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Date:</strong> ${appointmentDate}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Time:</strong> ${appointmentTime}</p>
          ${location ? `<p style="margin:4px 0;font-size:14px;"><strong>Location:</strong> ${location}</p>` : ""}
        </div>
        <div style="text-align:center;">
          <a href="${dashboardUrl}" style="${buttonStyle}">View Appointment</a>
        </div>
      </div>
    `),
  };
}

// --- Welcome Email ---
export function welcomeEmailTemplate({
  userName,
  email,
  loginUrl,
}: {
  userName: string;
  email: string;
  loginUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Welcome to HealthCal Pro, ${userName}!`,
    html: wrapTemplate(`
      <div style="${headerStyle}">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">🎉 Welcome!</h1>
      </div>
      <div style="${bodyStyle}">
        <p style="font-size:16px;color:#374151;">Hello ${userName},</p>
        <p style="font-size:14px;color:#6b7280;">
          Your account has been created with the email <strong>${email}</strong>.
          You can now start managing your appointments.
        </p>
        <div style="text-align:center;">
          <a href="${loginUrl}" style="${buttonStyle}">Go to Dashboard</a>
        </div>
      </div>
    `),
  };
}

// --- Email Verification ---
export function emailVerificationTemplate({
  userName,
  verifyUrl,
}: {
  userName: string;
  verifyUrl: string;
}): { subject: string; html: string } {
  return {
    subject: "Verify your email — HealthCal Pro",
    html: wrapTemplate(`
      <div style="${headerStyle}">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">✉️ Verify Your Email</h1>
      </div>
      <div style="${bodyStyle}">
        <p style="font-size:16px;color:#374151;">Hello ${userName},</p>
        <p style="font-size:14px;color:#6b7280;">
          Please click the button below to verify your email address.
        </p>
        <div style="text-align:center;">
          <a href="${verifyUrl}" style="${buttonStyle}">Verify Email</a>
        </div>
        <p style="font-size:12px;color:#9ca3af;margin-top:24px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `),
  };
}

// --- Password Reset ---
export function passwordResetTemplate({
  userName,
  resetUrl,
}: {
  userName: string;
  resetUrl: string;
}): { subject: string; html: string } {
  return {
    subject: "Reset your password — HealthCal Pro",
    html: wrapTemplate(`
      <div style="${headerStyle}">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">🔑 Password Reset</h1>
      </div>
      <div style="${bodyStyle}">
        <p style="font-size:16px;color:#374151;">Hello ${userName},</p>
        <p style="font-size:14px;color:#6b7280;">
          We received a request to reset your password. Click below to set a new password.
        </p>
        <div style="text-align:center;">
          <a href="${resetUrl}" style="${buttonStyle}">Reset Password</a>
        </div>
        <p style="font-size:12px;color:#9ca3af;margin-top:24px;">
          This link will expire in 1 hour. If you didn't request a password reset, ignore this email.
        </p>
      </div>
    `),
  };
}
