"use client";

import { useState } from "react";

export default function CopyEmail({ email, label, done }: { email: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="font-mono text-xs text-muted transition hover:text-fg"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard indisponível: o link mailto continua funcionando */
        }
      }}
    >
      <span aria-live="polite">{copied ? `✓ ${done}` : `⧉ ${label}`}</span>
    </button>
  );
}
