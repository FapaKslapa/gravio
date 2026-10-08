"use client";

import { useMutation } from "@tanstack/react-query";
import { Check, Clock, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTRPC } from "@/lib/trpc/client";

type PendingUser = {
  id: string;
  name: string;
  email: string;
};

type PendingRequest = {
  id: string;
  user: PendingUser;
};

type PendingRequestsCardProps = {
  incomingRequests: PendingRequest[];
  outgoingRequests: PendingRequest[];
  onActionSuccess: () => void;
};

export function PendingRequestsCard({
  incomingRequests,
  outgoingRequests,
  onActionSuccess,
}: PendingRequestsCardProps) {
  const trpc = useTRPC();
  const respondRequestMutation = useMutation(
    trpc.friend.respondRequest.mutationOptions({
      onSuccess: () => {
        onActionSuccess();
      },
    }),
  );

  const handleRespond = async (
    requestId: string,
    action: "accept" | "decline",
  ) => {
    await respondRequestMutation.mutateAsync({ requestId, action });
  };

  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return null;
  }

  return (
    <Card className="gap-0 bg-brand-soft p-0 elevation-1">
      {incomingRequests.length > 0 && (
        <section aria-label="Richieste ricevute" className="flex flex-col">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-base font-semibold">Richieste ricevute</h2>
            <Badge className="bg-brand text-brand-foreground">
              {incomingRequests.length}
            </Badge>
          </div>
          <ul className="flex flex-col">
            {incomingRequests.map((req) => (
              <li
                key={req.id}
                className="flex items-center gap-3 px-4 py-3 not-last:border-b"
              >
                <Avatar>
                  <AvatarFallback className="bg-card font-semibold text-brand">
                    {req.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">
                    {req.user.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {req.user.email}
                  </span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-11 rounded-full"
                    aria-label={`Rifiuta la richiesta di ${req.user.name}`}
                    onClick={() => handleRespond(req.id, "decline")}
                    disabled={respondRequestMutation.isPending}
                  >
                    <X />
                  </Button>
                  <Button
                    size="icon"
                    className="size-11 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
                    aria-label={`Accetta la richiesta di ${req.user.name}`}
                    onClick={() => handleRespond(req.id, "accept")}
                    disabled={respondRequestMutation.isPending}
                  >
                    <Check />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {outgoingRequests.length > 0 && (
        <section
          aria-label="Richieste inviate"
          className="flex flex-col border-t first:border-t-0"
        >
          <h2 className="px-4 pt-3 pb-1 text-sm font-semibold text-muted-foreground">
            Inviate
          </h2>
          <ul className="flex flex-col pb-2">
            {outgoingRequests.map((req) => (
              <li key={req.id} className="flex items-center gap-3 px-4 py-2">
                <Avatar size="sm">
                  <AvatarFallback className="bg-card text-[11px] font-semibold">
                    {req.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {req.user.name}
                </span>
                <Badge variant="outline" className="gap-1 bg-card">
                  <Clock />
                  In attesa
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Card>
  );
}
