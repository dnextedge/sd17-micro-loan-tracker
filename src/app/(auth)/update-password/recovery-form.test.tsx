import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecoveryForm } from "./recovery-form";

const unsubscribe = vi.fn();
let authCallback: ((event: string, session: object | null) => void) | undefined;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: (
        callback: (event: string, session: object | null) => void,
      ) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe } } };
      },
    },
  }),
}));

vi.mock("../actions", () => ({
  updatePassword: vi.fn(),
}));

describe("RecoveryForm", () => {
  beforeEach(() => {
    authCallback = undefined;
    unsubscribe.mockClear();
    window.history.replaceState(null, "", "/update-password#access_token=test");
  });

  it("reveals the password form after a valid recovery event and removes the fragment", () => {
    render(<RecoveryForm />);

    expect(screen.getByRole("status")).toHaveTextContent("Verifying");
    act(() => authCallback?.("PASSWORD_RECOVERY", { user: { id: "user-1" } }));

    expect(screen.getByLabelText("New password")).toBeVisible();
    expect(window.location.hash).toBe("");
  });

  it("does not accept a normal sign-in event", () => {
    vi.useFakeTimers();
    render(<RecoveryForm />);

    act(() => authCallback?.("SIGNED_IN", { user: { id: "user-1" } }));
    act(() => vi.advanceTimersByTime(5000));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "invalid or has expired",
    );
    vi.useRealTimers();
  });

  it("unsubscribes when the bridge unmounts", () => {
    const { unmount } = render(<RecoveryForm />);
    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
