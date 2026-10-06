import type { GasAction } from "@/lib/gas";
import { previewTokenName, type PreviewState } from "@/lib/preview/config";
import {
  previewCaseAttachments,
  previewCaseMessages,
  previewCases,
  previewDrafts,
  previewMembers,
  previewReviews,
  previewTokens,
} from "@/lib/preview/fixtures";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Answers Apps Script actions from fixtures. Writes succeed without saving.
// Special student tokens: "slow" (5s), "error" (throws), "missing" (404).
export async function previewGas(
  action: GasAction,
  payload: Record<string, unknown>,
  state: PreviewState,
): Promise<unknown> {
  const empty = state.data === "empty";
  const cases = empty ? [] : previewCases;

  switch (action) {
    case "getMemberRole":
      return { role: state.persona === "minister" || state.persona === "member" ? state.persona : null };

    case "listMembers":
      await wait(120);
      return empty ? [] : previewMembers;

    case "listCases": {
      await wait(150);
      const days = Number(payload.days) || 30;
      const query = String(payload.query || "").trim().toLowerCase();
      const since = Date.now() - days * 24 * 60 * 60 * 1000;
      const matches = cases.filter((item) => {
        if (new Date(item.created_at).getTime() < since) return false;
        if (!query) return true;
        return [item.public_id, item.subject, item.student_name, item.student_email, item.category]
          .some((value) => value.toLowerCase().includes(query));
      });
      return { cases: matches, total: cases.length };
    }

    case "getCaseByToken": {
      const token = previewTokenName(String(payload.token || ""));
      if (token === "slow") await wait(5000);
      else await wait(150);
      if (token === "error") throw new Error("Preview: simulated Apps Script failure.");
      const caseId = previewTokens[token] ??
        (token === "slow" ? previewTokens.demo : null);
      const caseRow = caseId ? previewCases.find((item) => item.id === caseId) : null;
      if (!caseRow) return null;
      return {
        case: caseRow,
        messages: previewCaseMessages(caseRow.id),
        attachments: previewCaseAttachments(caseRow.id),
      };
    }

    case "getAdminCase": {
      await wait(150);
      const caseRow = cases.find((item) => item.id === payload.caseId);
      if (!caseRow) return null;
      return {
        case: caseRow,
        messages: previewCaseMessages(caseRow.id),
        attachments: previewCaseAttachments(caseRow.id),
        drafts: previewDrafts(caseRow.id),
        reviews: previewReviews(caseRow.id),
      };
    }

    case "approveReview":
      await wait(500);
      return { caseId: previewCases[0].id };

    case "addStudentMessage":
    case "saveDraftReply":
    case "submitReview":
    case "upsertMember":
    case "removeMember":
      await wait(action === "saveDraftReply" ? 200 : 700);
      return {};

    case "closeStaleCases":
      return {};
  }
}
