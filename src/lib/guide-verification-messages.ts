import type { Tables } from "@/integrations/supabase/types";

export type GuideVerificationMessage = {
  id: string;
  senderUserId: string;
  body: string;
  createdAt: string;
};

export type GuideVerificationThreadResponse = {
  viewerId: string;
  messages: GuideVerificationMessage[];
};

export function toGuideVerificationMessage(
  row: Tables<"guide_verification_messages">,
): GuideVerificationMessage {
  return {
    id: row.id,
    senderUserId: row.sender_user_id,
    body: row.body,
    createdAt: row.created_at,
  };
}
