"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCartAction } from "@/app/actions";
import { Icon } from "@/components/ui/Icon";

export function AddToCartButton({
  productId,
  soldOut = false,
  full = false,
  qty = 1,
}: {
  productId: number;
  soldOut?: boolean;
  full?: boolean;
  qty?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  function handleClick() {
    startTransition(async () => {
      const res = await addToCartAction(productId, qty);
      if (res.ok) {
        setState("done");
        setTimeout(() => setState("idle"), 1800);
        router.refresh();
      } else {
        setState("error");
        setMessage(res.error ?? "Could not add to cart");
        setTimeout(() => setState("idle"), 2600);
      }
    });
  }

  const label = soldOut ? "Sold out" : state === "done" ? "Added" : state === "error" ? message : pending ? "Adding…" : "Add to cart";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut || pending}
      aria-live="polite"
      className={`btn btn-primary btn-sm ${full ? "w-full" : ""}`}
    >
      {state === "done" ? <Icon name="check" size={14} /> : <Icon name="bag" size={14} />}
      <span className="truncate">{label}</span>
    </button>
  );
}
