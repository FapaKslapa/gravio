import { card, emailBase, escapeHtml, INK } from "./brevo-layout";

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
