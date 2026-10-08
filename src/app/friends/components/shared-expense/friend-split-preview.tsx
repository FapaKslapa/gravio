import { formatCurrency } from "@/lib/utils";
import { MemberAvatar } from "./member-avatar";

type Props = {
  payerName: string;
  payerImage?: string | null;
  friendName: string;
  myNok: number;
  friendNok: number;
  myPct: number;
  friendPct: number;
  amountNok: number;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function FriendSplitPreview({
  payerName,
  payerImage,
  friendName,
  myNok,
  friendNok,
  myPct,
  friendPct,
  amountNok,
  displayCurrency,
  convertCurrency,
}: Props) {
  const show = (nok: number) =>
    formatCurrency(
      convertCurrency(nok, "NOK", displayCurrency),
      displayCurrency,
    );

  return (
    <section aria-label="Anteprima a testa" className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Anteprima a testa</h3>
      {amountNok > 0 ? (
        <>
          <div
            className="flex h-2 gap-0.5 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <div
              className="rounded-full bg-brand transition-[width] duration-300"
              style={{ width: `${myPct}%` }}
            />
            <div
              className="rounded-full bg-brand/30 transition-[width] duration-300"
              style={{ width: `${friendPct}%` }}
            />
          </div>
          <ul className="flex flex-col gap-2">
            <li className="flex items-center gap-3">
              <MemberAvatar name={payerName} image={payerImage} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                Tu
              </span>
              <span className="tabular text-sm font-semibold">
                {show(myNok)}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <MemberAvatar name={friendName} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {friendName}
              </span>
              <span className="tabular text-sm font-semibold">
                {show(friendNok)}
              </span>
            </li>
          </ul>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Inserisci un importo per vedere la divisione.
        </p>
      )}
    </section>
  );
}
