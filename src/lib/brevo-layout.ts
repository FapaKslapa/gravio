export const BRAND = "#6c47ff";
export const INK = "#1b1730";
export const MUTED = "#6b6785";
export const PAPER = "#f5f3fb";
export const SITE = "https://gravio.zimaserver.it";

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const emailBase = (
  content: string,
  preheader: string,
) => `<!DOCTYPE html>
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

export const card = (opts: {
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
