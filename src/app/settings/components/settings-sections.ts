import { Bell, type LucideIcon, Palette, Target, User } from "lucide-react";
import type { Tone } from "./icon-tile";

export type Tab = "general" | "budget" | "profile" | "notifications";

export const SECTIONS: Record<
  Tab,
  { title: string; subtitle: string; icon: LucideIcon; tone: Tone }
> = {
  general: {
    title: "Aspetto e valuta",
    subtitle: "Tema, accento, valuta",
    icon: Palette,
    tone: "brand",
  },
  budget: {
    title: "Budget",
    subtitle: "Mensile e per categoria",
    icon: Target,
    tone: "income",
  },
  notifications: {
    title: "Notifiche",
    subtitle: "Avvisi in app e push",
    icon: Bell,
    tone: "warning",
  },
  profile: {
    title: "Profilo",
    subtitle: "Nome, foto, account",
    icon: User,
    tone: "expense",
  },
};
