"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createRecoveryClient } from "@/lib/supabase/client";
import { FormField, submitClassName } from "../_components/auth-card";

type RecoveryState = "checking" | "ready" | "invalid" | "saving";

export function RecoveryForm() {
  const router = useRouter();
  const [state, setState] = useState<RecoveryState>("checking");
  const [message, setMessage] = useState("");
  const clientRef = useRef<ReturnType<typeof createRecoveryClient>>(null);

  useEffect(() => {
    const hasRecoveryFragment =
      new URLSearchParams(window.location.hash.slice(1)).get("type") ===
      "recovery";
    const supabase = createRecoveryClient();
    clientRef.current = supabase;
    const timeout = window.setTimeout(() => setState("invalid"), 5000);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === "PASSWORD_RECOVERY" ||
          (event === "INITIAL_SESSION" && hasRecoveryFragment))
      ) {
        window.clearTimeout(timeout);
        window.history.replaceState(null, "", window.location.pathname);
        setState("ready");
      }
    });

    return () => {
      window.clearTimeout(timeout);
      subscription.unsubscribe();
      clientRef.current = null;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8 || password.length > 72) {
      setMessage("Use a password between 8 and 72 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setState("saving");
    setMessage("");
    const supabase = clientRef.current;

    if (!supabase) {
      setState("invalid");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setState("ready");
      setMessage("Password could not be updated. Request a new reset link.");
      return;
    }

    await supabase.auth.signOut();
    router.push(
      "/login?message=Password%20updated.%20You%20can%20now%20sign%20in.",
    );
  }

  if (state === "checking") {
    return <p role="status">Verifying your secure reset link…</p>;
  }

  if (state === "invalid") {
    return (
      <p role="alert" className="text-sm text-red-800">
        This password-reset link is invalid or has expired. Request a new link
        from the sign-in page.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      {message ? (
        <p role="alert" className="text-sm text-red-800">
          {message}
        </p>
      ) : null}
      <FormField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
      />
      <FormField
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
      />
      <button
        type="submit"
        className={submitClassName}
        disabled={state === "saving"}
      >
        {state === "saving" ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
