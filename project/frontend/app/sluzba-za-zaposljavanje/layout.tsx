import Protected from "@/components/protected";

export default function FakultetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected allowedRoles={["employee", "candidate"]}>{children}</Protected>
  );
}
