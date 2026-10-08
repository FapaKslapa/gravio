"use client";

import { Camera, Loader2, PenLine, ScanLine } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CategoryPicker } from "@/components/ui/category-picker";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { TxCurrencySelect } from "@/components/ui/tx-form-parts";
import { useCategorySuggestion } from "@/hooks/use-category-suggestion";
import { springs } from "@/lib/motion";
import { resizeImage } from "@/lib/receipt/resize-image";
import type { ReceiptData } from "@/lib/schemas/receipt";
import type { TransactionModal } from "./transaction-modal";

type Category = { id: string; name: string; icon: string; color: string };
type ModalProps = React.ComponentProps<typeof TransactionModal>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSave: ModalProps["onSave"];
  onManual: () => void;
};

type Phase =
  | { name: "idle" }
  | { name: "reading" }
  | { name: "confirm" }
  | { name: "error"; message: string };

const today = () => new Date().toISOString().substring(0, 10);

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function matchHint(hint: string, categories: Category[]): string | null {
  const h = norm(hint).trim();
  if (h.length < 3) return null;
  return (
    categories.find((c) => {
      const n = norm(c.name);
      return n.includes(h) || h.includes(n);
    })?.id ?? null
  );
}

export function ReceiptScanSheet({
  open,
  onOpenChange,
  categories,
  onSave,
  onManual,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [preview, setPreview] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [currency, setCurrency] = useState("EUR");
  const [categoryId, setCategoryId] = useState("");
  const [hint, setHint] = useState("");
  const [items, setItems] = useState<ReceiptData["items"]>([]);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const suggest = useCategorySuggestion(open);
  const suggestedId =
    categoryId === "" ? (suggest(desc) ?? matchHint(hint, categories)) : null;

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const reset = () => {
    setPhase({ name: "idle" });
    setPreview(null);
    setDesc("");
    setAmount("");
    setDate(today());
    setCurrency("EUR");
    setCategoryId("");
    setHint("");
    setItems([]);
    setSaving(false);
    setSubmitted(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setPhase({ name: "reading" });
    try {
      const blob = await resizeImage(file);
      const body = new FormData();
      body.append("image", blob, "receipt.jpg");
      let res: Response;
      try {
        res = await fetch("/api/receipt", { method: "POST", body });
      } catch {
        setPhase({
          name: "error",
          message: "Connessione assente. Controlla la rete e riprova.",
        });
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        receipt?: ReceiptData;
        message?: string;
      } | null;
      if (!res.ok || !data?.receipt) {
        setPhase({
          name: "error",
          message:
            data?.message ??
            "Non riesco a leggere lo scontrino. Prova con una foto piu' nitida.",
        });
        return;
      }
      const r = data.receipt;
      setDesc(r.merchant);
      setAmount(r.total.toFixed(2));
      setDate(r.date ?? today());
      setCurrency(r.currency);
      setHint(r.categoryHint);
      setItems(r.items);
      setPhase({ name: "confirm" });
    } catch {
      setPhase({
        name: "error",
        message: "Non riesco ad aprire questa foto. Prova con un'altra.",
      });
    }
  };

  const parsed = parseFloat(amount);
  const validAmount = !Number.isNaN(parsed) && parsed > 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validAmount || !desc.trim() || saving) return;
    setSaving(true);
    try {
      await onSave({
        description: desc.trim(),
        type: "expense",
        amount: parsed,
        currency,
        categoryId: categoryId || suggestedId || null,
        date: new Date(date).toISOString(),
      });
      handleOpenChange(false);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const input = (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      capture="environment"
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (f) void handleFile(f);
      }}
    />
  );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Scansiona scontrino"
      description="Fotografa lo scontrino: compilo io la spesa."
      className="md:max-w-md"
    >
      {input}
      <AnimatePresence mode="wait" initial={false}>
        {phase.name === "idle" && (
          <m.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: springs.gentle }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <Button
              type="button"
              className="h-28 w-full flex-col gap-2 bg-brand text-base text-brand-foreground hover:bg-brand/90"
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="size-7" aria-hidden />
              Scatta o scegli una foto
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11"
              onClick={onManual}
            >
              <PenLine data-icon="inline-start" />
              Inserisci a mano
            </Button>
          </m.div>
        )}

        {phase.name === "reading" && (
          <m.div
            key="reading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-2"
            role="status"
            aria-live="polite"
          >
            <PreviewImage src={preview} scanning />
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Sto leggendo lo scontrino…
            </p>
          </m.div>
        )}

        {phase.name === "error" && (
          <m.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: springs.gentle }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <PreviewImage src={preview} />
            <p role="alert" className="text-sm text-expense">
              {phase.message}
            </p>
            <Button
              type="button"
              className="h-11"
              onClick={() => {
                setPhase({ name: "idle" });
                setPreview(null);
              }}
            >
              <Camera data-icon="inline-start" />
              Riprova con un'altra foto
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11"
              onClick={onManual}
            >
              <PenLine data-icon="inline-start" />
              Inserisci a mano
            </Button>
          </m.div>
        )}

        {phase.name === "confirm" && (
          <m.form
            key="confirm"
            noValidate
            onSubmit={handleSave}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: springs.gentle }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <p className="text-sm text-muted-foreground">
              Controlla i dati letti e correggi se serve.
            </p>
            <FieldGroup>
              <Field data-invalid={(submitted && !desc.trim()) || undefined}>
                <FieldLabel htmlFor="rc-desc">Negozio</FieldLabel>
                <Input
                  id="rc-desc"
                  className="h-11"
                  value={desc}
                  aria-invalid={(submitted && !desc.trim()) || undefined}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </Field>
              <Field data-invalid={(submitted && !validAmount) || undefined}>
                <FieldLabel htmlFor="rc-amount">Importo</FieldLabel>
                <MoneyInput
                  value={amount}
                  onChange={setAmount}
                  currency={currency}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Data</FieldLabel>
                  <CustomDatePicker
                    value={date}
                    onChange={setDate}
                    triggerClassName="h-11 text-sm"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="rc-currency">Valuta</FieldLabel>
                  <TxCurrencySelect
                    id="rc-currency"
                    value={currency}
                    onChange={setCurrency}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <CategoryPicker
                  categories={categories}
                  value={categoryId}
                  onChange={setCategoryId}
                  suggestedId={suggestedId}
                />
              </Field>
              {items.length > 0 && (
                <details className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                  <summary className="min-h-11 cursor-pointer content-center font-medium">
                    {items.length} righe lette
                  </summary>
                  <ul className="flex flex-col gap-1 pb-2">
                    {items.map((it, i) => (
                      <li
                        // biome-ignore lint/suspicious/noArrayIndexKey: static list
                        key={i}
                        className="tabular flex justify-between gap-3 text-muted-foreground"
                      >
                        <span className="truncate">{it.description}</span>
                        <span>{it.amount.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </FieldGroup>
            <div className="sticky bottom-0 -mx-4 flex flex-col gap-1 border-t bg-popover px-4 pb-1 pt-3 md:mx-0 md:px-0">
              <Button
                type="submit"
                disabled={saving}
                className="h-12 w-full bg-expense text-white hover:bg-expense/90"
              >
                {saving ? "Salvataggio..." : "Salva spesa"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-11"
                onClick={onManual}
              >
                Inserisci a mano
              </Button>
            </div>
          </m.form>
        )}
      </AnimatePresence>
    </ResponsiveSheet>
  );
}

function PreviewImage({
  src,
  scanning = false,
}: {
  src: string | null;
  scanning?: boolean;
}) {
  if (!src) return null;
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-lg border bg-muted">
      <Image
        src={src}
        alt="Anteprima dello scontrino"
        fill
        unoptimized
        className="object-contain"
      />
      {scanning && (
        <m.div
          aria-hidden
          className="absolute inset-x-0 flex items-center text-brand"
          initial={{ top: "0%" }}
          animate={{ top: ["0%", "95%", "0%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ScanLine className="size-5" />
          <span className="h-0.5 flex-1 bg-brand/70" />
        </m.div>
      )}
    </div>
  );
}
