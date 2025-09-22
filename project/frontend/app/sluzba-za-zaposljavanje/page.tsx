"use client";

import Wrap from "@/components/wrap";
import LinkButton from "@/components/link-button";
import useLocalStorage, { AuthUser } from "@/hooks/useLocalStorage";
import Button from "@/components/button";
import useEmployer from "@/hooks/useEmployer";

export default function SluzbaZaZaposljavanje() {
  const [user] = useLocalStorage<AuthUser | null>("auth.user", null);
  const role = user?.role;
  const { quitJob } = useEmployer();

  const buttons = [
    {
      label: "Kandidati",
      href: "/sluzba-za-zaposljavanje/kandidati",
      roles: ["sszadmin"],
    },
    {
      label: "Zaposleni",
      href: "/sluzba-za-zaposljavanje/zaposleni",
      roles: ["sszadmin"],
    },
    {
      label: "Vidi Kolege",
      href: "/sluzba-za-zaposljavanje/kolege",
      roles: ["employee"],
    },
    {
      label: "Svi Poslovi",
      href: "/sluzba-za-zaposljavanje/poslovi",
      roles: ["sszadmin", "candidate"],
    },
    {
      label: "Prijave za posao",
      href: "/sluzba-za-zaposljavanje/prijave-za-posao",
      roles: ["sszadmin"],
    },
    {
      label: "Intervjui",
      href: "/sluzba-za-zaposljavanje/intervjui",
      roles: ["sszadmin"],
    },
    // {
    //   label: "Zaposleni profesori sa faksa",
    //   href: "/sluzba-za-zaposljavanje/zaposleni-profesori-sa-faksa",
    //   roles: ["sszadmin", "employee", "candidate"],
    // },
  ];

  return (
    <Wrap>
      <div className="flex flex-col items-center min-h-[70vh] justify-center p-6 bg-gray-100 rounded-2xl">
        <h1 className="text-5xl font-extrabold text-gray-900 text-center">
          Sistem za zapošljavanje
        </h1>
        <p className="mt-2 text-gray-600 text-center text-lg">
          Odaberite opciju ispod da nastavite
        </p>

        <div className="flex flex-wrap justify-center gap-8 mt-10 w-full max-w-5xl">
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

          {role === "employee" && (
            <>
              <Button
                onClick={async () => {
                  await quitJob();
                  localStorage.removeItem("auth.token");
                  localStorage.removeItem("auth.user");
                  window.location.href = "/auth/login";
                }}
                className="group relative flex items-center justify-center p-4 rounded-xl bg-red-500 text-white text-lg font-semibold shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl"
              >
                Daj otkaz
              </Button>
            </>
          )}
        </div>
      </div>
    </Wrap>
  );
}
