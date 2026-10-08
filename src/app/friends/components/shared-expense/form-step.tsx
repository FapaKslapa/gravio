"use client";

import { m } from "motion/react";
import { useState } from "react";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/lib/motion";
import { AmountField } from "./form-step-amount-field";
import { TargetField } from "./form-step-target-field";
import { PayerField } from "./payer-field";
import { ShareTypeToggle } from "./share-type-toggle";
import type { FormState, Friend, Group } from "./types";

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

  const handleNext = () => {
    setAttempted(true);
    if (amountInvalid || descInvalid || targetInvalid) return;
    onNext();
  };

  return (
    <m.form
      id="shared-expense-form"
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
        <AmountField
          state={state}
          set={set}
          attempted={attempted}
          amountInvalid={amountInvalid}
          converted={converted}
          displayCurrency={displayCurrency}
        />

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

        <PayerField name={payerName} image={payerImage} />

        <Field>
          <FieldLabel>Dividi con</FieldLabel>
          <ShareTypeToggle
            shareType={state.shareType}
            onSelectFriend={() => set({ shareType: "friend", groupId: "" })}
            onSelectGroup={() => set({ shareType: "group", friendId: "" })}
          />
        </Field>

        <TargetField
          state={state}
          set={set}
          friends={friends}
          groups={groups}
          attempted={attempted}
          targetInvalid={targetInvalid}
        />

        <Field>
          <FieldLabel htmlFor="shared-date">Data</FieldLabel>
          <CustomDatePicker
            id="shared-date"
            value={state.date}
            onChange={(date) => set({ date })}
            clearable={false}
          />
        </Field>
      </FieldGroup>
    </m.form>
  );
}
