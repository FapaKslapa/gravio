"use client";

import { ArrowRight, Info } from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fadeUp } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";
import { SHARED_CURRENCIES } from "./currencies";
import { MemberAvatar } from "./member-avatar";
import { ShareTypeToggle } from "./share-type-toggle";
import type { FormState, Friend, Group } from "./types";

function sanitizeAmount(raw: string) {
  let v = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = `${parts[0]}.${parts.slice(1).join("")}`;
  const dec = v.split(".")[1];
  if (dec && dec.length > 2) v = `${v.split(".")[0]}.${dec.slice(0, 2)}`;
  return v;
}

type Props = {
  state: FormState;
  set: (payload: Partial<FormState>) => void;
  friends: Friend[];
  groups: Group[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  parsedAmount: number;
  payerName: string;
  payerImage?: string | null;
  onNext: () => void;
};

export function SharedExpenseFormStep({
  state,
  set,
  friends,
  groups,
  displayCurrency,
  convertCurrency,
  parsedAmount,
  payerName,
  payerImage,
  onNext,
}: Props) {
  const [attempted, setAttempted] = useState(false);

  const amountInvalid = !(parsedAmount > 0);
  const descInvalid = !state.desc.trim();
  const targetInvalid =
    state.shareType === "friend" ? !state.friendId : !state.groupId;

  const showConversion = parsedAmount > 0 && state.currency !== displayCurrency;
  const converted = showConversion
    ? convertCurrency(parsedAmount, state.currency, displayCurrency)
    : null;

  const currencies = SHARED_CURRENCIES.includes(state.currency)
    ? SHARED_CURRENCIES
    : [state.currency, ...SHARED_CURRENCIES];

  const handleNext = () => {
    setAttempted(true);
    if (amountInvalid || descInvalid || targetInvalid) return;
    onNext();
  };

  return (
    <m.form
      key="form-step"
      variants={fadeUp}
      initial="hidden"
      animate="show"
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      <FieldGroup>
        <Field data-invalid={attempted && amountInvalid}>
          <FieldLabel htmlFor="shared-amount">Importo totale</FieldLabel>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
            <input
              id="shared-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={state.amount}
              aria-invalid={attempted && amountInvalid}
              onChange={(e) => set({ amount: sanitizeAmount(e.target.value) })}
              onBlur={() => {
                const n = parseFloat(state.amount);
                if (!Number.isNaN(n)) set({ amount: n.toFixed(2) });
              }}
              className={cn(
                "num-display min-w-0 flex-1 bg-transparent font-display font-bold tracking-tight outline-none placeholder:text-muted-foreground/50",
                "text-[clamp(2rem,11vw,3.25rem)] leading-none",
              )}
            />
            <Select
              value={state.currency}
              onValueChange={(v) => set({ currency: v })}
            >
              <SelectTrigger
                aria-label="Valuta"
                className="h-11 w-24 shrink-0 font-semibold"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {converted !== null ? (
            <p className="tabular text-xs text-muted-foreground">
              Circa {formatCurrency(converted, displayCurrency)}
            </p>
          ) : null}
          {attempted && amountInvalid ? (
            <FieldError>Inserisci un importo maggiore di zero.</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={attempted && descInvalid}>
          <FieldLabel htmlFor="shared-desc">Descrizione</FieldLabel>
          <Input
            id="shared-desc"
            type="text"
            value={state.desc}
            aria-invalid={attempted && descInvalid}
            placeholder={
              state.shareType === "group"
                ? "Es. Spesa per la festa, AirBnB"
                : "Es. Cena al ristorante"
            }
            onChange={(e) => set({ desc: e.target.value })}
            className="h-11"
          />
          {attempted && descInvalid ? (
            <FieldError>Scrivi una breve descrizione.</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel>Chi ha pagato</FieldLabel>
          <div className="flex min-h-11 items-center gap-3 rounded-lg border px-3">
            <MemberAvatar name={payerName} image={payerImage} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">
                {payerName} (Tu)
              </span>
              <span className="text-xs text-muted-foreground">
                Anticipi tu, gli altri ti devono la loro quota
              </span>
            </div>
          </div>
        </Field>

        <Field>
          <FieldLabel>Dividi con</FieldLabel>
          <ShareTypeToggle
            shareType={state.shareType}
            onSelectFriend={() => set({ shareType: "friend", groupId: "" })}
            onSelectGroup={() => set({ shareType: "group", friendId: "" })}
          />
        </Field>

        <Field data-invalid={attempted && targetInvalid}>
          <FieldLabel htmlFor="shared-target">
            {state.shareType === "friend" ? "Amico" : "Gruppo"}
          </FieldLabel>
          {state.shareType === "friend" ? (
            <Select
              value={state.friendId}
              onValueChange={(v) => set({ friendId: v })}
            >
              <SelectTrigger
                id="shared-target"
                aria-invalid={attempted && targetInvalid}
                className="h-11 w-full"
              >
                <SelectValue placeholder="Seleziona un amico" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {friends.map((f) => (
                    <SelectItem key={f.user.id} value={f.user.id}>
                      {f.user.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <Select
              value={state.groupId}
              onValueChange={(v) => set({ groupId: v })}
            >
              <SelectTrigger
                id="shared-target"
                aria-invalid={attempted && targetInvalid}
                className="h-11 w-full"
              >
                <SelectValue placeholder="Seleziona un gruppo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          {attempted && targetInvalid ? (
            <FieldError>
              {state.shareType === "friend"
                ? "Scegli con quale amico dividere."
                : "Scegli il gruppo con cui dividere."}
            </FieldError>
          ) : null}
          {(state.shareType === "friend" ? friends : groups).length === 0 ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3.5" aria-hidden="true" />
              {state.shareType === "friend"
                ? "Aggiungi prima un amico."
                : "Crea prima un gruppo."}
            </p>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="shared-date">Data</FieldLabel>
          <Input
            id="shared-date"
            type="date"
            value={state.date}
            onChange={(e) => set({ date: e.target.value })}
            className="h-11"
          />
        </Field>
      </FieldGroup>

      <Button type="submit" className="h-12 w-full text-base">
        Continua
        <ArrowRight data-icon="inline-end" />
      </Button>
    </m.form>
  );
}
