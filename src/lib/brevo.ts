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

const BRAND = "#6c47ff";
const INK = "#1b1730";
const MUTED = "#6b6785";
const PAPER = "#f5f3fb";
const SITE = "https://gravio.zimaserver.it";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const emailBase = (content: string, preheader: string) => `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Gravio</title>
</head>
<body style="margin:0;padding:0;background-color:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PAPER};padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">

        <tr><td style="padding:0 4px 20px">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:middle">
                <img src="${SITE}/icon-192.png" width="36" height="36" alt="" style="display:block;border-radius:10px">
              </td>
              <td style="padding-left:10px;vertical-align:middle">
                <span style="font-size:20px;font-weight:800;color:${INK};letter-spacing:-0.5px">Gravio</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="background-color:#ffffff;border-radius:24px;border:1px solid #e9e5f5">
          ${content}
        </td></tr>

        <tr><td style="padding:20px 8px 0">
          <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED}">
            Gravio, le tue spese sempre sotto controllo.<br>
            Questa email è stata inviata automaticamente, non rispondere.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const button = (url: string, label: string) => `
  <a href="${url}" style="display:block;background-color:${BRAND};color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;line-height:1;text-align:center;padding:18px 24px;border-radius:16px">${label}</a>`;

const fallbackLink = (url: string) => `
  <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:${MUTED}">
    Il pulsante non funziona? Copia questo indirizzo nel browser:<br>
    <a href="${url}" style="color:${BRAND};word-break:break-all">${url}</a>
  </p>`;

const note = (html: string) => `
  <tr><td style="padding:20px 32px 28px;background-color:#faf9fe;border-top:1px solid #efecf8;border-radius:0 0 24px 24px">
    <p style="margin:0;font-size:13px;line-height:1.7;color:${MUTED}">${html}</p>
  </td></tr>`;

const card = (opts: {
  title: string;
  intro: string;
  url: string;
  cta: string;
  footnote: string;
  extra?: string;
}) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:36px 32px 8px">
      <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;font-weight:800;color:${INK};letter-spacing:-0.6px">${opts.title}</h1>
      <p style="margin:0;font-size:15px;line-height:1.65;color:#3e3a57">${opts.intro}</p>
    </td></tr>
    ${opts.extra ?? ""}
    <tr><td style="padding:24px 32px 32px">
      ${button(opts.url, opts.cta)}
      ${fallbackLink(opts.url)}
    </td></tr>
    ${note(opts.footnote)}
  </table>`;

export function magicLinkEmail(url: string): { html: string; text: string } {
  const content = card({
    title: "Accedi a Gravio",
    intro:
      "Tocca il pulsante per entrare nel tuo account. Non serve nessuna password.",
    url,
    cta: "Accedi a Gravio",
    footnote: `Il link vale <strong style="color:${INK}">15 minuti</strong> e funziona una volta sola.<br>Se non hai chiesto tu l'accesso, ignora questa email: nessuno può entrare senza questo link.`,
  });
  const html = emailBase(
    content,
    "Il tuo link di accesso a Gravio, valido 15 minuti.",
  );
  const text = `Accedi a Gravio\n\nApri questo link per entrare (non serve nessuna password):\n${url}\n\nIl link vale 15 minuti. Se non hai chiesto tu l'accesso, ignora questa email.`;
  return { html, text };
}

export function activationEmail(
  url: string,
  name: string,
): { html: string; text: string } {
  const safeName = escapeHtml(name);
  const steps = `
    <tr><td style="padding:16px 32px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1edff;border-radius:16px">
        <tr><td style="padding:16px 20px">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${INK}">Accesso senza password</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#3e3a57">
            Dopo l'attivazione, ogni volta che vuoi entrare ricevi un link sicuro via email.
          </p>
        </td></tr>
      </table>
    </td></tr>`;
  const content = card({
    title: `Benvenuto, ${safeName}`,
    intro:
      "Il tuo account Gravio è pronto. Attivalo per registrare spese ed entrate in qualsiasi valuta, impostare budget e dividere i conti con gli amici.",
    url,
    cta: "Attiva il mio account",
    footnote: `Il link di attivazione vale <strong style="color:${INK}">24 ore</strong>.<br>Se non hai creato tu questo account, ignora questa email.`,
    extra: steps,
  });
  const html = emailBase(
    content,
    "Attiva il tuo account Gravio, valido 24 ore.",
  );
  const text = `Benvenuto su Gravio, ${name}!\n\nAttiva il tuo account:\n${url}\n\nIl link vale 24 ore. Se non hai creato tu questo account, ignora questa email.`;
  return { html, text };
}
