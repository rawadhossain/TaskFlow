import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { TaskFlowMark, TaskFlowWordmark } from "@/components/branding/TaskFlowLogo";
import { authClient } from "@/lib/auth-client";
import { getSession } from "@/lib/auth.functions";
import { safeAppPath } from "@/lib/safe-app-path";
import { clientPostLoginPath } from "@/lib/client-post-login-path";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: safeAppPath(search.redirect) });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();

  const signInWithGoogle = () => {
    const path = clientPostLoginPath(redirectTo);
    const callbackURL = `${window.location.origin}${path}`;
    void authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background text-foreground px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto size-14 rounded-2xl grid place-items-center border border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary-glow)]/10 glow-primary">
            <TaskFlowMark className="size-9 text-primary" aria-hidden />
          </div>
          <div className="flex justify-center">
            <h1 className="m-0">
              <TaskFlowWordmark size="lg" />
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in to sync tasks, tags, and smart views across devices.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-elevated text-sm font-medium hover:bg-elevated/80 transition"
          >
            <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
          <p className="text-xs text-muted-foreground text-center">
            By continuing you agree to our terms and privacy policy for this personal workspace.
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/" className="text-[var(--primary)] hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
