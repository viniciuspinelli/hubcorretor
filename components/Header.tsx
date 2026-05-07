"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <p className="text-sm text-gray-500">
        Bem-vindo, <span className="font-medium text-gray-900">{userName}</span>
      </p>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition"
      >
        <LogOut size={16} />
        Sair
      </button>
    </header>
  );
}
