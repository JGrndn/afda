'use client'

import { useNavigation } from "@/components/navigation";
import { Menu } from "lucide-react";
import Link from "next/link";

export function TopBar({ title }: {
  title:string
}) {
  const { toggleMobile } = useNavigation();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-blue-900 text-white flex items-center justify-between px-4 shadow-lg z-30">
      <button
        onClick={toggleMobile}
        className="p-2 rounded-lg hover:bg-blue-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      <Link href="/" className="text-xl font-bold">{title}</Link>
      <div className="w-10" />
    </header>
  );
}