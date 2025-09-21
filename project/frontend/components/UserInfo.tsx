"use client";

import { useEffect, useState } from "react";

export default function UserInfo() {
  const [user, setUser] = useState<{
    email?: string;
    fullName?: string;
    role?: string;
  }>({});

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("auth.user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        setUser(parsed);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
    }
  }, []);

  if (!user?.email) return null;

  return (
    <span style={{ fontSize: "0.9rem", color: "black" }}>
      {user.fullName} ({user.role}) – {user.email}
    </span>
  );
}
