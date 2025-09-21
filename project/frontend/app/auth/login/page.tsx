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
        .catch(() => ({}))) as Partial<LoginResponse> & { error?: string };

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

      const _role = data?.user?.role;
      const isFaculty = ["professor", "student", "facultyadmin"].includes(
        _role!
      );
      if (isFaculty) {
        router.push("/fakultet");
      } else {
        router.push("/sluzba-za-zaposljavanje");
      }
    } catch {
      setMsg({ kind: "error", text: "Greška u mreži. Pokušaj ponovo." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Wrap withGoBack={false}>
      <div className="flex items-center min-h-[70vh] justify-center !bg-gray-600 p-6">
        <div className="w-full max-w-md bg-gray-50 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Prijava
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="text-black w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="password"
              >
                Lozinka
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  className="text-black w-full rounded-xl border border-gray-300 px-4 py-2 pr-24 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  tabIndex={-1}
                >
                  {showPwd ? "Sakrij" : "Prikaži"}
                </button>
              </div>
            </div>

            {msg && (
              <div
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  msg.kind === "error"
                    ? "bg-red-50 text-red-700 border border-red-100"
                    : "bg-green-50 text-green-700 border border-green-100"
                }`}
              >
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-white font-semibold hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-60"
            >
              {loading ? "Prijavljivanje…" : "Prijavi se"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Nemaš nalog?{" "}
            <a
              href="/auth/register"
              className="text-blue-600 font-medium underline hover:text-blue-800"
            >
              Registruj se
            </a>
          </p>
        </div>
      </div>
    </Wrap>
  );
}
