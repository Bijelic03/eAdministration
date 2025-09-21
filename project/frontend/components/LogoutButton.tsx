"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export default function LogoutButton() {
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("auth.token"));

    function onStorage(ev: StorageEvent) {
      if (ev.key === "auth.token") {
        setHasToken(!!localStorage.getItem("auth.token"));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleClick() {
    if (hasToken) {
      localStorage.removeItem("auth.token");
      localStorage.removeItem("auth.user");
      setHasToken(false);
    }
    window.location.href = "/auth/login";
  }

  // ❌ Ako je ruta login ili register, nemoj prikazivati dugme
  if (pathname === "/auth/login" || pathname === "/auth/register") {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="hover:cursor-pointer flex items-center gap-2 bg-blue-500 hover:bg-blue-600 shadow-md text-white px-4 py-2 font-bold rounded-lg transition duration-300 transform hover:-translate-y-0.5"
    >
      <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
      Izloguj se
    </button>
  );
}
