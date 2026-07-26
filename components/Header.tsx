"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/monitoring", label: "Monitoring" },
  { href: "/admin/dashboard", label: "Panel Admin" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-dark-900/95 backdrop-blur-sm border-b border-dark-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
              SF
            </span>
            <span className="font-heading text-xl font-bold text-white">
              Sohabat<span className="text-brand-400">Fuhur</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-brand-500/10 text-brand-400"
                      : "text-dark-300 hover:text-white hover:bg-dark-700/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            className="md:hidden text-dark-300 p-2"
            onClick={() => setOpen(!open)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 border-t border-dark-700/50 pt-4">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-brand-500/10 text-brand-400"
                      : "text-dark-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
