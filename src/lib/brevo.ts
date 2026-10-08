import { env } from "@/env";

type BrevoEmailOptions = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
};

const FROM_EMAIL = env.BREVO_FROM_EMAIL ?? "noreply@zimaserver.it";
const FROM_NAME = env.BREVO_FROM_NAME ?? "Gravio";

export async function sendEmail({
  to,
  toName,
  subject,
  html,
  text,
}: BrevoEmailOptions): Promise<void> {
  if (env.NODE_ENV === "development") {
    console.log("\n==================================================");
    console.log(`[DEV MODE] Email to: ${to} (${toName ?? "No Name"})`);
    console.log(`Subject: ${subject}`);
    const urlRegex = /(https?:\/\/[^\s"'>]+)/g;
    const urls = (text ?? html).match(urlRegex);
    if (urls) {
      console.log("Links:");
      for (const url of urls) {
        console.log(` 👉 ${url}`);
      }
    }
    console.log("==================================================\n");
    return;
  }

  const apiKey = env.BREVO_API_KEY;

  if (!apiKey) {
    console.log(`[BREVO] No API key — skipping email to ${to}: ${subject}`);
    return;
  }

  console.log(`[BREVO] Sending "${subject}" to ${to}…`);

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to, name: toName ?? to }],
      subject,
      htmlContent: html,
      textContent: text ?? subject,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[BREVO] Error ${res.status}: ${body}`);
    throw new Error(`Brevo error ${res.status}: ${body}`);
  }

  console.log(`[BREVO] Sent OK (${res.status}) to ${to}`);
}

export { activationEmail, magicLinkEmail } from "./brevo-templates";
