"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderLookupForm({ defaultValue = "" }: { defaultValue?: string }) {
  const [email, setEmail] = useState(defaultValue);
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/account?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }}
      className="flex gap-2"
    >
      <label htmlFor="lookup-email" className="sr-only">Email address</label>
      <input
        id="lookup-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="field h-11 flex-1"
      />
      <button type="submit" className="btn btn-primary btn-sm shrink-0">Find orders</button>
    </form>
  );
}
