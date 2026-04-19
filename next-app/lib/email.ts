import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "Hooked on Photonics <noreply@example.com>";

const client = key ? new Resend(key) : null;

export async function sendLoginCode(email: string, code: string) {
  const subject = `Your Hooked on Photonics code: ${code}`;
  const text =
    `Your one-time code is ${code}.\n\n` +
    `It expires in 10 minutes. If you didn't request this, ignore this email.\n\n` +
    `We don't store your email address — only a peppered hash.`;

  if (!client) {
    // Dev fallback: don't send, log so developers can copy/paste.
    console.log(`[dev-email] to=${email} code=${code}`);
    return { delivered: false, dev: true as const };
  }
  await client.emails.send({ from, to: email, subject, text });
  return { delivered: true as const };
}
