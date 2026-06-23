"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Sign up failed");
      }

      const { signIn } = await import("next-auth/react");
      await signIn("credentials", { email, password, redirect: false });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between surface-lavender p-12 lg:flex">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-signal-blue text-sm font-semibold text-paper">
            A
          </span>
          <span className="text-lg font-semibold text-carbon">Atlas Match</span>
        </Link>
        <div className="max-w-md">
          <p className="eyebrow mb-4">Get started free</p>
          <h2 className="text-3xl font-medium text-carbon text-balance">
            Turn every screening into{" "}
            <span className="text-signal-blue">actionable evidence</span>
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-chalk bg-paper p-4">
              <p className="text-2xl font-semibold tabular-nums text-signal-blue">7</p>
              <p className="mt-1 text-xs text-pencil">Score dimensions</p>
            </div>
            <div className="rounded-xl border border-chalk bg-paper p-4">
              <p className="text-2xl font-semibold tabular-nums text-success">∞</p>
              <p className="mt-1 text-xs text-pencil">Saved analyses</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-fog">Join hiring teams using evidence-first screening</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded bg-signal-blue text-sm font-semibold text-paper">
                A
              </span>
            </Link>
            <h1 className="mt-6 text-2xl font-medium text-carbon lg:mt-0">
              Create account
            </h1>
            <p className="mt-1 text-sm text-pencil">
              Start saving and comparing your analyses
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-chalk bg-blush-whisper px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-field"
                placeholder="At least 6 characters"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-pencil">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-signal-blue hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
