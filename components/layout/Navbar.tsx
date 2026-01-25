"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useFragrance } from "@/context/FragranceContext";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/auth/AuthButton";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { shelves } = useFragrance();

  const ownedCount = Array.from(shelves.values()).filter((s) => s === "owned").length;
  const wantCount = Array.from(shelves.values()).filter((s) => s === "want").length;
  const testedCount = Array.from(shelves.values()).filter((s) => s === "tested").length;

  const navLinks = [
    { href: "/", label: "Browse" },
    { href: "/shelves", label: "My Shelves", count: ownedCount + wantCount + testedCount },
    { href: "/discover", label: "Discover" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#0a0a0a]/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-[#ff6b35] group-hover:to-[#ff8c42] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
              Parfumerie
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-300 relative",
                  pathname === link.href
                    ? "text-[#ff6b35] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#ff6b35]"
                    : "text-[#a0a0a0] hover:text-[#ff6b35]"
                )}
              >
                {link.label}
                {link.count !== undefined && link.count > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#ff6b35]/20 px-2 py-0.5 text-xs text-[#ff6b35]">
                    {link.count}
                  </span>
                )}
              </Link>
            ))}
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-[#ff6b35]" />
            ) : (
              <Menu className="h-6 w-6 text-[#ff6b35]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2a2a2a] bg-[#0a0a0a]">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block text-base font-medium transition-colors duration-300",
                  pathname === link.href
                    ? "text-[#ff6b35]"
                    : "text-[#a0a0a0] hover:text-[#ff6b35]"
                )}
              >
                {link.label}
                {link.count !== undefined && link.count > 0 && (
                  <span className="ml-2 rounded-full bg-[#ff6b35]/20 px-2 py-0.5 text-xs text-[#ff6b35]">
                    {link.count}
                  </span>
                )}
              </Link>
            ))}
            <div className="border-t border-[#2a2a2a] pt-3">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
