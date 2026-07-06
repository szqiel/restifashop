export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-outline-variant/40 bg-surface/90 backdrop-blur-xl">
      <div className="section-shell flex flex-col items-center gap-5 py-10">
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex justify-center items-center w-full">
            <span className="font-display-lg text-display-lg text-primary tracking-tighter">Restifashop</span>
          </div>
          <div className="text-center w-full">
            <p className="font-label-caps text-label-caps text-secondary">
              © 2026 Restifashop Home. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
