import type { Session } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as authModule from "@/auth";
import { getCurrentStaff } from "@/lib/auth";
import * as gasModule from "@/lib/gas";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/gas", () => ({
  callGas: vi.fn(),
}));

describe("getCurrentStaff role caching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cached role from session directly without calling GAS", async () => {
    vi.mocked(authModule.auth).mockResolvedValue({
      user: {
        email: "test@example.com",
        role: "minister",
      },
      expires: "2099-01-01",
    } as Session);

    const staff = await getCurrentStaff();

    expect(staff).toEqual({
      id: "test@example.com",
      email: "test@example.com",
      role: "minister",
    });
    expect(gasModule.callGas).not.toHaveBeenCalled();
  });

  it("falls back to callGas when session has no cached role", async () => {
    vi.mocked(authModule.auth).mockResolvedValue({
      user: {
        email: "test@example.com",
      },
      expires: "2099-01-01",
    } as Session);

    vi.mocked(gasModule.callGas).mockResolvedValue({
      role: "member",
    });

    const staff = await getCurrentStaff();

    expect(staff).toEqual({
      id: "test@example.com",
      email: "test@example.com",
      role: "member",
    });
    expect(gasModule.callGas).toHaveBeenCalledWith("getMemberRole", {
      email: "test@example.com",
    });
  });

  it("returns null when user is not staff even after GAS fallback", async () => {
    vi.mocked(authModule.auth).mockResolvedValue({
      user: {
        email: "student@example.com",
      },
      expires: "2099-01-01",
    } as Session);

    vi.mocked(gasModule.callGas).mockResolvedValue({
      role: null,
    });

    const staff = await getCurrentStaff();

    expect(staff).toBeNull();
  });
});
