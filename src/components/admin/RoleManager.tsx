"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileRole } from "@/app/admin/actions/staff";
import type { DbProfileRow, UserRole } from "@/types/database";
import {
  Badge,
  Banner,
  Card,
  EmptyNote,
  inputCls,
  tdCls,
  thCls,
} from "@/components/admin/ui";

const ROLES: UserRole[] = ["staff", "admin", "super_admin"];

function roleTone(role: UserRole): "green" | "amber" | "burgundy" | "gray" {
  switch (role) {
    case "super_admin":
      return "burgundy";
    case "admin":
      return "amber";
    case "staff":
      return "green";
    default:
      return "gray";
  }
}

/** Profiles table with a per-row role selector (self-edit disabled). */
export function RoleManager({
  profiles,
  currentUserId,
}: {
  profiles: DbProfileRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "saved" | "error"; text: string } | null>(null);

  function handleRoleChange(profileId: string, role: UserRole) {
    setFeedback(null);
    setPendingId(profileId);
    startTransition(async () => {
      const result = await updateProfileRole({ profileId, role });
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
        {profiles.length === 0 ? (
          <EmptyNote>No staff accounts yet.</EmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-brand-beige/60">
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Phone</th>
                  <th className={thCls}>Current role</th>
                  <th className={thCls}>Member since</th>
                  <th className={thCls}>Change role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {profiles.map((profile) => {
                  const isSelf = profile.id === currentUserId;
                  return (
                    <tr key={profile.id} className="hover:bg-brand-beige/40">
                      <td className={`${tdCls} font-semibold`}>
                        {profile.full_name || "(no name)"}
                        {isSelf ? (
                          <span className="ml-2 text-xs font-normal text-brand-taupe">
                            you
                          </span>
                        ) : null}
                      </td>
                      <td className={`${tdCls} text-brand-taupe`}>
                        {profile.phone ?? "—"}
                      </td>
                      <td className={tdCls}>
                        <Badge tone={roleTone(profile.role)}>{profile.role}</Badge>
                      </td>
                      <td className={`${tdCls} text-xs text-brand-taupe`}>
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>
                      <td className={tdCls}>
                        {isSelf ? (
                          <span className="text-xs text-brand-taupe">
                            Cannot change your own role
                          </span>
                        ) : (
                          <select
                            className={`${inputCls} max-w-[160px]`}
                            value={profile.role}
                            disabled={isPending && pendingId === profile.id}
                            onChange={(e) =>
                              handleRoleChange(profile.id, e.target.value as UserRole)
                            }
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>
                                {role.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
