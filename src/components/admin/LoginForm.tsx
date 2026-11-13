import { loginAction } from "@/app/admin/actions";

/**
 * A plain <form action={serverAction}> — no client hooks, so it works with or
 * without JavaScript and is server-rendered (previously a useActionState wrapper
 * meant the form had no SSR fallback, leaving nothing to submit without JS).
 */
export function LoginForm() {
  return (
    <form action={loginAction} className="space-y-3">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="admin@superzshop.bd"
          className="field"
          autoComplete="username"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="field"
          autoComplete="current-password"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full">Sign in</button>
      <p className="text-[0.6875rem] text-[var(--color-ink-mute)]">
        Failed attempts return to this page with a message.
      </p>
    </form>
  );
}
