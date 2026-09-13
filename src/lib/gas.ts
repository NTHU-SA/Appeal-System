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

class GasTransportError extends Error {}

export async function callGas<T>(
  action: GasAction,
  payload: Record<string, unknown> = {},
  options?: { backoffMs?: number }
): Promise<T> {
  // Reads and deduplicated student submissions can safely repeat the POST.
  const retryable = action.startsWith("get") || action.startsWith("list") ||
    (action === "addStudentMessage" && typeof payload.requestId === "string");
  const backoffMs = options?.backoffMs ?? 800;
  for (let attempt = 0; ; attempt++) {
    try {
      return await requestGas<T>(action, payload, attempt + 1);
    } catch (error) {
      if (!(error instanceof GasTransportError) || !retryable || attempt >= 1) throw error;
      if (backoffMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }
}


async function requestGas<T>(
  action: GasAction,
  payload: Record<string, unknown> = {},
  attempt = 1
): Promise<T> {
  const url = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL;
  const secret = process.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET;

  if (!url || !secret) {
    throw new Error(
      "Missing GOOGLE_APPS_SCRIPT_WEB_APP_URL or GOOGLE_APPS_SCRIPT_SHARED_SECRET."
    );
  }

  const startedAt = Date.now();
  let executeMs = 0;
  const signal = AbortSignal.timeout(30_000);
  let response: Response;
  let phase = "execute";
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      redirect: "manual",
      signal,
      body: JSON.stringify({
        action,
        secret,
        payload,
      }),
    });

    executeMs = Date.now() - startedAt;

    // ContentService returns a one-time result URL after executing doPost.
    // Follow as GET, without forwarding the shared secret across origins.
    for (let hop = 0; [301, 302, 303, 307, 308].includes(response.status) && hop < 5; hop++) {
      const location = response.headers.get("location");
      await response.body?.cancel().catch(() => {});
      const destination = location ? new URL(location) : null;
      if (!destination || destination.protocol !== "https:" ||
          !["script.googleusercontent.com", "script.google.com"].includes(destination.hostname)) {
        throw new Error("案件服務轉址異常，請聯絡管理員。");
      }
      phase = "read-result";
      response = await fetch(destination.href, {
        method: "GET", cache: "no-store", redirect: "manual", signal,
      });
    }
  } catch (error) {
    console.error("Apps Script fetch failure", {
      action, phase, attempt, executeMs, totalMs: Date.now() - startedAt,
      reason: error instanceof Error ? error.message.replace(/https?:\/\/[^\s]+/g, "[URL]") : "unknown",
    });
    if (error instanceof TypeError || (error instanceof Error &&
        ["TimeoutError", "AbortError"].includes(error.name))) {
      throw new GasTransportError("案件服務暫時無法確認送出結果，請稍後使用相同內容重試。");
    }
    throw error;
  }

  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    console.error("Apps Script transport failure", {
      action, phase, attempt, status: response.status, executeMs,
      totalMs: Date.now() - startedAt,
    });
    throw new GasTransportError(`案件服務暫時無法確認結果（${response.status}），請稍後重試。`);
  }

  let result: GasResponse<T>;
  try {
    result = (await response.json()) as GasResponse<T>;
  } catch {
    console.error("Apps Script response failure", {
      action, phase, attempt, executeMs, totalMs: Date.now() - startedAt,
    });
    throw new GasTransportError("案件服務回應異常，請稍後重試。");
  }

  if (!result.ok) {
    throw new Error(result.error || "Google Apps Script request failed.");
  }

  const totalMs = Date.now() - startedAt;
  // Do not log payloads, case tokens, result URLs, or response bodies.
  console.info("Apps Script request completed", {
    action, attempt, executeMs, resultMs: totalMs - executeMs, totalMs,
  });
  return result.data;
}
