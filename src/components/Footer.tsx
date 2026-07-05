import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest dark:bg-surface-dim full-width bottom flat no shadows border-t border-outline-variant">
      <div className="flex flex-col items-center gap-gutter py-8 px-margin-desktop w-full max-w-container-max mx-auto">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Brand */}
          <div className="flex justify-center items-center gap-2.5 w-full">
            <Image
              src="/logo.svg"
              alt="Restifashop Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="font-display-lg text-display-lg text-primary tracking-tighter">Restifashop</span>
          </div>
          {/* Copyright */}
          <div className="text-center w-full">
            <p className="font-label-caps text-label-caps text-secondary dark:text-on-secondary-fixed-variant">
              © 2026 Restifashop Home. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
