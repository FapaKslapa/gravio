import { Field, FieldLabel } from "@/components/ui/field";
import { MemberAvatar } from "./member-avatar";

export function PayerField({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  return (
    <Field>
      <FieldLabel>Chi ha pagato</FieldLabel>
      <div className="flex min-h-11 items-center gap-3 rounded-lg border px-3">
        <MemberAvatar name={name} image={image} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">{name} (Tu)</span>
          <span className="text-xs text-muted-foreground">
            Anticipi tu, gli altri ti devono la loro quota
          </span>
        </div>
      </div>
    </Field>
  );
}
