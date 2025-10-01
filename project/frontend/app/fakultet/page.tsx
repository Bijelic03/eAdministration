"use client";

import Wrap from "@/components/wrap";
import LinkButton from "@/components/link-button";
import useLocalStorage, { AuthUser } from "@/hooks/useLocalStorage";

export default function FakultetPage() {
  const [user] = useLocalStorage<AuthUser | null>("auth.user", null);
  const role = user?.role;

  const buttons = [
    {
      label: "Studenti",
      href: "/fakultet/studenti",
      roles: ["student", "professor", "facultyadmin"],
    },
    {
      label: "Profesori",
      href: "/fakultet/profesori",
      roles: ["facultyadmin", "professor"],
    },
    {
      label: "Kursevi",
      href: "/fakultet/kursevi",
      roles: ["facultyadmin", "professor", "student"],
    },
    {
      label: "Ispiti",
      href: "/fakultet/ispiti",
      roles: ["student", "professor"],
    },
    // { label: "Ocjene", href: "/fakultet/ocjene" },
    // { label: "GPA", href: "/fakultet/gpa" },
    // { label: "Alumni", href: "/fakultet/alumni" },
  ];

  return (
    <Wrap>
      <div className="flex flex-col items-center min-h-[70vh] justify-center p-6 bg-gray-100 rounded-2xl">
        <h1 className="text-5xl font-extrabold text-gray-900 text-center">
          Fakultet
        </h1>
        <p className="mt-2 text-gray-600 text-center text-lg">
          Odaberite opciju ispod da nastavite
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 w-full max-w-5xl">
          {buttons.map(
            (btn) =>
              btn.roles.includes(role ?? "") && (
                <LinkButton
                  key={btn.href}
                  href={btn.href}
                  className="group relative flex items-center justify-center p-4 rounded-xl bg-blue-500 text-white text-lg font-semibold shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <span className="absolute inset-0 rounded-xl opacity-0 bg-white/10 group-hover:opacity-100 transition duration-300"></span>
                  {btn.label}
                </LinkButton>
              )
          )}
        </div>
      </div>
    </Wrap>
  );
}
