export type GasAction =
  | "getMemberRole"
  | "listMembers"
  | "upsertMember"
  | "removeMember"
  | "listCases"
  | "getCaseByToken"
  | "getAdminCase"
  | "addStudentMessage"
  | "saveDraftReply"
  | "submitReview"
  | "approveReview"
  | "closeStaleCases";

type GasResponse<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error?: string;
    };

export function hasGasEnv() {
  return Boolean(
    process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL &&
      process.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET
  );
}

export async function callGas<T>(
  action: GasAction,
  payload: Record<string, unknown> = {}
): Promise<T> {
  const url = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL;
  const secret = process.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET;

  if (!url || !secret) {
    throw new Error(
      "Missing GOOGLE_APPS_SCRIPT_WEB_APP_URL or GOOGLE_APPS_SCRIPT_SHARED_SECRET."
    );
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-campusvoice-secret": secret,
    },
    cache: "no-store",
    body: JSON.stringify({
      action,
      secret,
      payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Apps Script request failed: ${response.status}`);
  }

  const result = (await response.json()) as GasResponse<T>;

  if (!result.ok) {
    throw new Error(result.error || "Google Apps Script request failed.");
  }

  return result.data;
}
