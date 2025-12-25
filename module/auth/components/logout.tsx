"use client";

import React from "react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type LogoutProps = {
  children: React.ReactNode;
  className?: string;
};

const Logout = ({ children, className }: LogoutProps) => {
  const router = useRouter();

  const handleLogout = () => {
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
        onError: (error) => {
          console.error("Logout failed:", error);
        },
      },
    });
  };

  return (
    <span
      className={className}
      onClick={handleLogout}
    >
      {children}
    </span>
  );
};

export default Logout;
