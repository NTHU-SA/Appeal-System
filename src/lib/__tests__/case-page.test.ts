import { isValidElement, Suspense, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import CaseStatusPage from "@/app/case/[token]/page";
import { getCaseByToken } from "@/lib/data";
import { StudentMessageForm } from "@/components/cases/student-message-form";

vi.mock("@/lib/data", () => ({ getCaseByToken: vi.fn() }));
vi.mock("@/components/cases/student-message-form", () => ({ StudentMessageForm: () => null }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));

function descendants(node: ReactNode): ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(node)) return node.flatMap(descendants);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  return [node, ...descendants(node.props.children as ReactNode)];
}

describe("case page streaming", () => {
  it("makes the reply form available while the single case request is still pending", async () => {
    const pending = new Promise<never>(() => {});
    vi.mocked(getCaseByToken).mockReturnValue(pending);
    const page = await CaseStatusPage({ params: Promise.resolve({ token: "test-token" }) });
    const elements = descendants(page);
    const form = elements.find((element) => element.type === StudentMessageForm);
    expect(form?.props.token).toBe("test-token");
    expect(getCaseByToken).toHaveBeenCalledExactlyOnceWith("test-token");
    const boundaries = elements.filter((element) => element.type === Suspense);
    expect(boundaries).toHaveLength(3);
    for (const boundary of boundaries) {
      const child = boundary.props.children as ReactElement<{ data: unknown }>;
      expect(child.props.data).toBe(pending);
      expect(descendants(boundary).some((element) => element.type === StudentMessageForm)).toBe(false);
    }
  });

  it("still rejects an invalid token when the case request completes", async () => {
    vi.mocked(getCaseByToken).mockResolvedValue(null);
    const page = await CaseStatusPage({ params: Promise.resolve({ token: "invalid" }) });
    const boundaries = descendants(page).filter((element) => element.type === Suspense);
    for (const boundary of boundaries) {
      const child = boundary.props.children as ReactElement<{ data: Promise<null> }>;
      const component = child.type as (props: typeof child.props) => Promise<ReactNode>;
      await expect(component(child.props)).rejects.toThrow("NOT_FOUND");
    }
  });
});
