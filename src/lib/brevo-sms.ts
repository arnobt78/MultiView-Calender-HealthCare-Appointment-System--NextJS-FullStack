/**
 * Optional Brevo Transactional SMS — used by reminder cron when BREVO_SMS_API_KEY is set.
 */

export async function sendBrevoSms(opts: {
  to: string;
  content: string;
}): Promise<boolean> {
  const apiKey = process.env.BREVO_SMS_API_KEY?.trim();
  if (!apiKey) return false;

  const sender = process.env.BREVO_SMS_SENDER?.trim() || "HealthCal";
  const to = opts.to.trim();
  if (!to) return false;

  const res = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender,
      recipient: to,
      content: opts.content,
      type: "transactional",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Brevo SMS failed:", res.status, text);
    return false;
  }
  return true;
}
