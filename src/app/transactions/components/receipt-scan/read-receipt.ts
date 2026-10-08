import { resizeImage } from "@/lib/receipt/resize-image";
import type { ReceiptData } from "@/lib/schemas/receipt";

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
    const data = (await res.json().catch(() => null)) as {
      receipt?: ReceiptData;
      message?: string;
    } | null;
    if (!res.ok || !data?.receipt) {
      return {
        error:
          data?.message ??
          "Non riesco a leggere lo scontrino. Prova con una foto piu' nitida.",
      };
    }
    return { receipt: data.receipt };
  } catch {
    return { error: "Non riesco ad aprire questa foto. Prova con un'altra." };
  }
}
