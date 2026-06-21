import { Resend } from "resend";

import { getAppUrl } from "@/lib/env";
import { emailIdempotencyKey } from "@/lib/workflow";
import CaseNotificationEmail from "@/emails/case-notification";

let resendClient: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY.");
  }
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export async function sendCaseEmail(input: {
  to: string;
  subject: string;
  title: string;
  preview: string;
  body: string;
  caseId: string;
  token?: string;
  event: string;
}) {
  if (!process.env.RESEND_API_KEY) return { skipped: true };

  const link = input.token
    ? `${getAppUrl()}/case/${input.token}`
    : `${getAppUrl()}/dashboard`;

  const { data, error } = await getResend().emails.send(
    {
      from:
        process.env.RESEND_FROM ||
        "清華大學學生申訴協力系統 <onboarding@resend.dev>",
      to: input.to,
      subject: input.subject,
      react: CaseNotificationEmail({
        title: input.title,
        preview: input.preview,
        body: input.body,
        link,
        caseId: input.caseId,
      }),
    },
    {
      headers: {
        "Idempotency-Key": emailIdempotencyKey(input.event, input.caseId),
      },
    }
  );

  if (error) throw new Error(error.message);
  return data;
}

export async function notifyDiscord(input: {
  kind: "review" | "reply";
  title: string;
  description: string;
  url: string;
}) {
  const webhook =
    input.kind === "review"
      ? process.env.DISCORD_REVIEW_WEBHOOK_URL
      : process.env.DISCORD_REPLY_WEBHOOK_URL;

  if (!webhook) return { skipped: true };

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: input.title,
          description: input.description,
          url: input.url,
          color: 0xe2a6eb,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status}`);
  }

  return { ok: true };
}
