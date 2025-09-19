"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // ako se ne prosledi, znači da samo login treba
}

export default function Protected({ children, allowedRoles }: ProtectedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // javne stranice (login, register)
    if (pathname.startsWith("/auth")) {
      setChecked(true);
      return;
    }

    const token = localStorage.getItem("auth.token");
    const rawUser = localStorage.getItem("auth.user");

    if (!token || !rawUser) {
      router.replace("/auth/login");
      return;
    }

    try {
      const user = JSON.parse(rawUser);

      // ako su definisane dozvoljene role i korisnik nije u njima → redirect
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace("/not-authorized");
        return;
      }
    } catch (e) {
      router.replace("/auth/login");
      return;
    }

    setChecked(true);
  }, [pathname, router, allowedRoles]);

  if (!checked) {
    return null; // ili loader
  }

  return <>{children}</>;
}
