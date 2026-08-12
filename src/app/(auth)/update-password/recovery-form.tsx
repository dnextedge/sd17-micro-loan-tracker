"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormField, submitClassName } from "../_components/auth-card";
import { updatePassword } from "../actions";

type RecoveryState = "checking" | "ready" | "invalid";

function removeSensitiveFragment() {
  if (!window.location.hash) return;
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );
}

export function RecoveryForm() {
  const [state, setState] = useState<RecoveryState>("checking");

  useEffect(() => {
    const supabase = createClient();
    const timeout = window.setTimeout(() => setState("invalid"), 5000);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        window.clearTimeout(timeout);
        removeSensitiveFragment();
        setState("ready");
      }
    });

    return () => {
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

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
    <form action={updatePassword} className="grid gap-5">
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
      <button type="submit" className={submitClassName}>
        Update password
      </button>
    </form>
  );
}
