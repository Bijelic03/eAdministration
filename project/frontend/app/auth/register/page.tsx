"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Wrap from "@/components/wrap";

type RegisterResponse = {
  token: string;
  user: { id: string; fullName: string; email: string; role: string };
};

const AUTH_BASE =
  process.env.NEXT_PUBLIC_AUTH_URL?.replace(/\/$/, "") ??
  "http://localhost:8083";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("sszadmin");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPwd = password.trim();
    if (!trimmedName || !trimmedEmail || !trimmedPwd) {
      setMsg({ kind: "error", text: "Ime, email i lozinka su obavezni." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: trimmedName,
          email: trimmedEmail,
          password: trimmedPwd,
          role,
        }),
      });

      const data = (await res
        .json()
        .catch(() => ({}))) as Partial<RegisterResponse> & { error?: string };

      if (!res.ok) {
        setMsg({
          kind: "error",
          text: data?.error || "Neuspešna registracija.",
        });
        return;
      }

      if (!data?.token) {
        setMsg({ kind: "error", text: "Nedostaje token u odgovoru servera." });
        return;
      }

      localStorage.setItem("auth.token", data.token);
      localStorage.setItem("auth.user", JSON.stringify(data.user ?? {}));
      window.dispatchEvent(new Event("auth:changed"));

      setMsg({ kind: "ok", text: "Uspešna registracija. Preusmeravam…" });
      router.push("/");
    } catch (err) {
      setMsg({ kind: "error", text: "Greška u mreži. Pokušaj ponovo." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Wrap withGoBack={false}>
      <div className="flex items-center justify-center min-h-[70vh] !bg-gray-600 p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">
            Registracija
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ime i prezime
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none text-black"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lozinka
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-20 focus:ring-2 focus:ring-blue-400 outline-none text-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800 text-black"
                  tabIndex={-1}
                >
                  {showPwd ? "Sakrij" : "Prikaži"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 !text-black">
                Uloga
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none !text-black"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="sszadmin">SSZ Admin</option>
                <option value="facultyadmin">Fakultet Admin</option>
              </select>
            </div>

            {msg && (
              <div
                className={`rounded-lg px-4 py-2 text-sm ${
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
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-white font-semibold hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-60"
            >
              {loading ? "Registrujem…" : "Registruj se"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Već imaš nalog?{" "}
            <a
              href="/auth/login"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Prijavi se
            </a>
          </p>
        </div>
      </div>
    </Wrap>
  );
}
