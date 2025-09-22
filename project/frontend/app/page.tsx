"use client";
import { useRouter } from "next/navigation";
import useLocalStorage, { AuthUser } from "@/hooks/useLocalStorage";

export default function Home() {
  const router = useRouter();
  const [user] = useLocalStorage<AuthUser | null>("auth.user", null);
  const role = user?.role;

  const isFaculty = ["professor", "student", "facultyadmin"].includes(role!);
  if (isFaculty) {
    router.push("/fakultet");
  } else {
    router.push("/sluzba-za-zaposljavanje");
  }
  return <></>;
}
