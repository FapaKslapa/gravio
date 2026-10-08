"use client";

import { Moon, Sun } from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fadeUp } from "@/lib/motion";
import { BrandPanel } from "./components/brand-panel";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";

type Tab = "login" | "register";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <BrandPanel />

      <main className="relative z-10 -mt-8 flex flex-col items-center px-4 pb-10 lg:mt-0 lg:justify-center lg:py-12">
        <Button
          type="button"
          variant="ghost"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"
          }
          className="absolute top-4 right-4 size-11 rounded-full text-brand-foreground hover:bg-brand-foreground/15 hover:text-brand-foreground lg:text-foreground lg:hover:bg-muted lg:hover:text-foreground"
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>

        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="elevation-2 mt-0 w-full max-w-md rounded-xl bg-card p-6 text-card-foreground sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {tab === "login" ? "Bentornato" : "Crea il tuo account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tab === "login"
                ? "Inserisci la tua email, ti mandiamo un link per entrare."
                : "Ti serve solo un nome e un'email. Nessuna password."}
            </p>
          </div>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as Tab)}
            className="mb-6"
          >
            <TabsList className="h-11 w-full rounded-full p-1">
              <TabsTrigger value="login" className="h-full rounded-full">
                Accedi
              </TabsTrigger>
              <TabsTrigger value="register" className="h-full rounded-full">
                Registrati
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {tab === "login" ? (
            <LoginForm key="login" />
          ) : (
            <RegisterForm key="register" onSuccess={() => setTab("login")} />
          )}
        </m.div>
      </main>
    </div>
  );
}
