import Link from "next/link";
import { ReactNode } from "react";

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
}

const LinkButton: React.FC<LinkButtonProps> = ({ href, children, className = "" }) => {
  return (
    <Link
      href={href}
      className={`border p-2 max-w-64 font-bold transition duration-300 hover:text-yellow-300 rounded-sm ${className}`}
    >
      {children}
    </Link>
  );
};

export default LinkButton;
