import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar */}
      <header className="border-b border-neutral-100 px-8 py-5">
        <span className="text-xl font-bold tracking-tight text-neutral-900">GovMobi</span>
      </header>

      {/* Centered content */}
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
