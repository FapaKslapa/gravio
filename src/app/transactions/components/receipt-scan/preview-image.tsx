import { ScanLine } from "lucide-react";
import { m } from "motion/react";
import Image from "next/image";

export function PreviewImage({
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
        sizes="(min-width: 640px) 28rem, 100vw"
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
