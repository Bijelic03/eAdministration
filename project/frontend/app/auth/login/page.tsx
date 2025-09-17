"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Wrap from "@/components/wrap";

type LoginResponse = {
  token: string;
  user: { id: string; fullName: string; email: string; role: string };
};

const AUTH_BASE =
  process.env.NEXT_PUBLIC_AUTH_URL?.replace(/\/$/, "") ??
  "http://localhost:8083";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const trimmedEmail = email.trim();
    const trimmedPwd = password.trim();
    if (!trimmedEmail || !trimmedPwd) {
      setMsg({ kind: "error", text: "Email i lozinka su obavezni." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPwd }),
      });

      const data = (await res
        .json()
        .catch(() => ({}))) as Partial<LoginResponse> & {
        error?: string;
      };

      if (!res.ok) {
        setMsg({ kind: "error", text: data?.error || "Neuspešna prijava." });
        return;
      }

      if (!data?.token) {
        setMsg({ kind: "error", text: "Nedostaje token u odgovoru servera." });
        return;
      }

      localStorage.setItem("auth.token", data.token);
      localStorage.setItem("auth.user", JSON.stringify(data.user ?? {}));
      window.dispatchEvent(new Event("auth:changed"));

      setMsg({ kind: "ok", text: "Uspešno logovanje. Preusmeravam…" });
      router.push("/");
    } catch (err) {
      setMsg({ kind: "error", text: "Greška u mreži. Pokušaj ponovo." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Wrap>
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-semibold mb-4">Prijava</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border px-3 py-2 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Lozinka
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                className="w-full rounded-lg border px-3 py-2 pr-20 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm underline"
                tabIndex={-1}
              >
                {showPwd ? "Sakrij" : "Prikaži"}
              </button>
            </div>
          </div>

          {msg && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.kind === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Prijavljivanje…" : "Prijavi se"}
          </button>
        </form>

        {/* Link ka registraciji */}
        <p className="mt-4 text-sm text-white">
          Nemaš nalog?{" "}
          <a
            href="/auth/register"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Registruj se
          </a>
        </p>
      </div>
    </Wrap>
  );
}
