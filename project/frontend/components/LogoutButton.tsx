"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

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
      style={{
        border: "1px solid #000",
        background: "#000",
        color: "#fff",
        borderRadius: "8px",
        padding: "8px 12px",
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  );
}
