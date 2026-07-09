"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setIsOpen, getTotalItems } = useCartStore();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "cart-storage") {
        useCartStore.persist.rehydrate();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const cartCount = mounted ? getTotalItems() : 0;

  const navLinks = [
    { name: "Collections", href: "/shop" },
    { name: "Sprei", href: "/shop?category=sprei" },
    { name: "Bedcover", href: "/shop?category=bedcover" },
    { name: "Selimut", href: "/shop?category=selimut" },
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="sticky top-0 z-50 w-full border-b border-outline-variant/30 bg-surface/90 backdrop-blur-xl transition-all duration-300"
    >
      <div className="section-shell flex h-24 items-center justify-between relative">
        {/* Mobile menu and Brand Logo left-aligned */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button (Hamburger) */}
          <button
            className="flex items-center justify-center p-2 text-primary md:hidden btn-tactile"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="font-display-lg text-headline-sm md:text-headline-md text-primary tracking-tighter flex-shrink-0 flex items-center gap-2"
          >
            <Image
              src="/logo.svg"
              alt="Restifashop Logo"
              width={28}
              height={28}
              className="object-contain"
             quality={95} />
            <span>Restifashop</span>
          </Link>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 font-body-md text-body-md uppercase tracking-wider">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-all duration-300 hover:opacity-80 relative ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Trailing Icons */}
        <div className="flex items-center gap-1 text-primary">
          {/* Search */}
          <Link
            href="/shop?focus=search"
            className="p-2 hover:opacity-80 transition-all active:scale-95 duration-150 flex items-center justify-center"
          >
            <Search className="h-6 w-6 stroke-[1.5]" />
          </Link>

          {/* Shopping Bag */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="p-2 hover:opacity-80 transition-all active:scale-95 duration-150 flex items-center justify-center relative cursor-pointer"
          >
            <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-container px-1 text-[9px] font-bold text-on-primary-container"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="absolute top-24 left-0 w-full bg-surface/98 border-b border-outline-variant/30 shadow-md md:hidden z-50 overflow-hidden"
          >
            <nav className="flex flex-col py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-margin-mobile py-4 font-sans text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-dim hover:text-primary border-b border-outline-variant/20 last:border-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
