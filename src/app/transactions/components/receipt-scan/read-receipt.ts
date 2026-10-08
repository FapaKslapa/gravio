import { resizeImage } from "@/lib/receipt/resize-image";
import type { ReceiptData } from "@/lib/schemas/receipt";

const UNREADABLE =
  "Non riesco a leggere lo scontrino. Prova con una foto piu' nitida.";

async function errorMessage(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as {
    message?: string;
  } | null;
  return data?.message ?? UNREADABLE;
}

export async function readReceipt(
  file: File,
): Promise<{ receipt: ReceiptData } | { error: string }> {
  try {
    const blob = await resizeImage(file);
    const body = new FormData();
    body.append("image", blob, "receipt.jpg");
    let res: Response;
    try {
      res = await fetch("/api/receipt", { method: "POST", body });
    } catch {
      return { error: "Connessione assente. Controlla la rete e riprova." };
    }
    if (!res.ok) return { error: await errorMessage(res) };
    const data = (await res.json().catch(() => null)) as {
      receipt?: ReceiptData;
      message?: string;
    } | null;
    if (!data?.receipt) return { error: data?.message ?? UNREADABLE };
    return { receipt: data.receipt };
  } catch {
    return { error: "Non riesco ad aprire questa foto. Prova con un'altra." };
  }
}
