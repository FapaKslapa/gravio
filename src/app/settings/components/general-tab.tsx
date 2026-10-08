"use client";

import { Check, Coins, Moon, Palette, Sun, SunMoon } from "lucide-react";
import { CurrencySelect } from "@/components/ui/currency-select";
import { ACCENT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Segmented, SettingsGroup, SettingsRow } from "./settings-ui";

type GeneralTabProps = {
  preferredCurrency: string;
  setPreferredCurrency: (val: string) => void;
  theme: "light" | "dark";
  changeTheme: (theme: "light" | "dark") => void;
  accent: string;
  changeAccent: (accent: string) => void;
};

export function GeneralTab({
  preferredCurrency,
  setPreferredCurrency,
  theme,
  changeTheme,
  accent,
  changeAccent,
}: GeneralTabProps) {
  const accentName = ACCENT_COLORS.find((c) => c.id === accent)?.name;

  return (
    <div className="flex flex-col gap-6">
      <SettingsGroup title="Aspetto" index={0}>
        <SettingsRow
          icon={SunMoon}
          tone="brand"
          title="Tema"
          subtitle="Chiaro o scuro"
        >
          <Segmented
            label="Tema"
            layoutId="theme-segment"
            value={theme}
            onChange={changeTheme}
            options={[
              { value: "light", label: "Chiaro", icon: Sun },
              { value: "dark", label: "Scuro", icon: Moon },
            ]}
          />
        </SettingsRow>
        <SettingsRow
          icon={Palette}
          tone="brand"
          title="Colore accento"
          subtitle={accentName ? `Attuale: ${accentName}` : undefined}
        >
          <div
            role="radiogroup"
            aria-label="Colore accento"
            className="grid grid-cols-5 gap-1"
          >
            {ACCENT_COLORS.map((col) => {
              const active = accent === col.id;
              return (
                // biome-ignore lint/a11y/useSemanticElements: radio personalizzato
                <button
                  key={col.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => changeAccent(col.id)}
                  className="group flex min-h-16 cursor-pointer flex-col items-center gap-1.5 rounded-md px-0.5 py-1.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full transition-[box-shadow,transform] group-active:scale-95",
                      active &&
                        "ring-2 ring-foreground ring-offset-2 ring-offset-card",
                    )}
                    style={{ backgroundColor: col.primary }}
                  >
                    {active && (
                      <Check
                        aria-hidden
                        className="size-5"
                        strokeWidth={3}
                        style={{ color: "oklch(0.99 0 0)" }}
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] leading-none",
                      active
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {col.name}
                  </span>
                </button>
              );
            })}
          </div>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Valuta" index={1}>
        <SettingsRow
          icon={Coins}
          tone="income"
          title="Valuta preferita"
          subtitle="Usata in tutta l'app"
        >
          <CurrencySelect
            value={preferredCurrency}
            onChange={setPreferredCurrency}
          />
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}
