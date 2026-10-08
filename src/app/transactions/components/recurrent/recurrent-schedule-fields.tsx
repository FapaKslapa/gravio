import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TxCurrencySelect } from "@/components/ui/tx-form-parts";
import { FREQUENCIES, type Frequency } from "./recurrent-types";

type Props = {
  frequency: Frequency;
  setFrequency: (v: Frequency) => void;
  currency: string;
  setCurrency: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
};

export function RecurrentScheduleFields({
  frequency,
  setFrequency,
  currency,
  setCurrency,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="rec-frequency">Frequenza</FieldLabel>
          <Select
            value={frequency}
            onValueChange={(v) => setFrequency(v as Frequency)}
          >
            <SelectTrigger id="rec-frequency" className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="rec-currency">Valuta</FieldLabel>
          <TxCurrencySelect
            id="rec-currency"
            value={currency}
            onChange={setCurrency}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="rec-start">Inizio</FieldLabel>
          <CustomDatePicker
            id="rec-start"
            value={startDate}
            onChange={setStartDate}
            max={endDate || undefined}
            clearable={false}
            title="Data di inizio"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="rec-end">Fine (opzionale)</FieldLabel>
          <CustomDatePicker
            id="rec-end"
            value={endDate}
            onChange={setEndDate}
            min={startDate || undefined}
            placeholder="Nessuna"
            title="Data di fine"
          />
        </Field>
      </div>
    </>
  );
}
