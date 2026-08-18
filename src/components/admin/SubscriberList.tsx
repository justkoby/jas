"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSubscriber } from "@/app/admin/actions/commerce";
import type { DbSubscriber } from "@/types/database";
import {
  Badge,
  Banner,
  Card,
  EmptyNote,
  btnSecondary,
  statusTone,
  tdCls,
  thCls,
} from "@/components/admin/ui";

/** Subscribers table with per-row active/unsubscribed toggling. */
export function SubscriberList({ subscribers }: { subscribers: DbSubscriber[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "saved" | "error"; text: string } | null>(null);

  function handleToggle(subscriber: DbSubscriber) {
    setFeedback(null);
    setPendingId(subscriber.id);
    const nextStatus = subscriber.status === "active" ? "unsubscribed" : "active";
    startTransition(async () => {
      const result = await toggleSubscriber(subscriber.id, nextStatus);
      setPendingId(null);
      if (result.error) {
        setFeedback({ kind: "error", text: result.error });
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {feedback ? <Banner kind={feedback.kind} text={feedback.text} /> : null}

      <Card className="overflow-hidden">
        {subscribers.length === 0 ? (
          <EmptyNote>No newsletter subscribers yet.</EmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-brand-beige/60">
                <tr>
                  <th className={thCls}>Email</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Source</th>
                  <th className={thCls}>Subscribed</th>
                  <th className={thCls}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-brand-beige/40">
                    <td className={`${tdCls} font-semibold`}>{subscriber.email}</td>
                    <td className={tdCls}>
                      <Badge tone={statusTone(subscriber.status)}>
                        {subscriber.status}
                      </Badge>
                    </td>
                    <td className={`${tdCls} text-xs text-brand-taupe`}>
                      {subscriber.source}
                    </td>
                    <td className={`${tdCls} text-xs text-brand-taupe`}>
                      {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    </td>
                    <td className={`${tdCls} text-right`}>
                      <button
                        type="button"
                        disabled={isPending && pendingId === subscriber.id}
                        onClick={() => handleToggle(subscriber)}
                        className={btnSecondary}
                      >
                        {subscriber.status === "active" ? "Unsubscribe" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
