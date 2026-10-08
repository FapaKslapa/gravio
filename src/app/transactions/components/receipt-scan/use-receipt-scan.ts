import { useRef, useState } from "react";
import { useCategorySuggestion } from "@/hooks/use-category-suggestion";
import { readReceipt } from "./read-receipt";
import {
  matchHint,
  type ReceiptCategory,
  type ReceiptLine,
  type ReceiptPhase,
  today,
} from "./receipt-types";
import { useObjectUrl } from "./use-object-url";

type SavePayload = {
  description: string;
  type: "expense";
  amount: number;
  currency: string;
  categoryId: string | null;
  date: string;
};

type Args = {
  open: boolean;
  categories: ReceiptCategory[];
  onOpenChange: (open: boolean) => void;
  onSave: (data: SavePayload) => Promise<unknown> | unknown;
};

export function useReceiptScan({
  open,
  categories,
  onOpenChange,
  onSave,
}: Args) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<ReceiptPhase>({ name: "idle" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => today());
  const [currency, setCurrency] = useState("EUR");
  const [categoryId, setCategoryId] = useState("");
  const [hint, setHint] = useState("");
  const [items, setItems] = useState<ReceiptLine[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const suggest = useCategorySuggestion(open);
  const suggestedId =
    categoryId === "" ? (suggest(desc) ?? matchHint(hint, categories)) : null;

  const preview = useObjectUrl(photo);

  const reset = () => {
    setPhase({ name: "idle" });
    setPhoto(null);
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
    setPhoto(file);
    setPhase({ name: "reading" });
    const result = await readReceipt(file);
    if ("error" in result) {
      setPhase({ name: "error", message: result.error });
      return;
    }
    const r = result.receipt;
    setDesc(r.merchant);
    setAmount(r.total.toFixed(2));
    setDate(r.date ?? today());
    setCurrency(r.currency);
    setHint(r.categoryHint);
    setItems(r.items.map((it) => ({ ...it, id: crypto.randomUUID() })));
    setPhase({ name: "confirm" });
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

  const retry = () => {
    setPhase({ name: "idle" });
    setPhoto(null);
  };

  return {
    fileRef,
    phase,
    preview,
    desc,
    setDesc,
    amount,
    setAmount,
    date,
    setDate,
    currency,
    setCurrency,
    categoryId,
    setCategoryId,
    suggestedId,
    items,
    saving,
    submitted,
    validAmount,
    handleOpenChange,
    handleFile,
    handleSave,
    retry,
  };
}
