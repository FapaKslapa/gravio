import { Camera, Loader2, PenLine } from "lucide-react";
import { m } from "motion/react";
import { Button } from "@/components/ui/button";
import { springs } from "@/lib/motion";
import { PreviewImage } from "./preview-image";

const enter = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: springs.gentle },
  exit: { opacity: 0 },
};

function ManualButton({ onManual }: { onManual: () => void }) {
  return (
    <Button type="button" variant="ghost" className="h-11" onClick={onManual}>
      <PenLine data-icon="inline-start" />
      Inserisci a mano
    </Button>
  );
}

export function IdleView({
  onPick,
  onManual,
}: {
  onPick: () => void;
  onManual: () => void;
}) {
  return (
    <m.div key="idle" {...enter} className="flex flex-col gap-3">
      <Button
        type="button"
        className="h-28 w-full flex-col gap-2 bg-brand text-base text-brand-foreground hover:bg-brand/90"
        onClick={onPick}
      >
        <Camera className="size-7" aria-hidden />
        Scatta o scegli una foto
      </Button>
      <ManualButton onManual={onManual} />
    </m.div>
  );
}

export function ReadingView({ preview }: { preview: string | null }) {
  return (
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
  );
}

export function ErrorView({
  preview,
  message,
  onRetry,
  onManual,
}: {
  preview: string | null;
  message: string;
  onRetry: () => void;
  onManual: () => void;
}) {
  return (
    <m.div key="error" {...enter} className="flex flex-col gap-3">
      <PreviewImage src={preview} />
      <p role="alert" className="text-sm text-expense">
        {message}
      </p>
      <Button type="button" className="h-11" onClick={onRetry}>
        <Camera data-icon="inline-start" />
        Riprova con un'altra foto
      </Button>
      <ManualButton onManual={onManual} />
    </m.div>
  );
}
