"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/auth/login" || pathname === "/auth/register") {
      setChecked(true);
      return;
    }

    const token = localStorage.getItem("auth.token");
    if (!token) {
      router.replace("/auth/login");
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
