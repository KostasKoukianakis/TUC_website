import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DISPLAY Lab – Technical University of Crete",
  description: "Digital Image and Signal Processing Lab at TUC.",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/people", label: "People" },
  { href: "/publications", label: "Publications" },
  { href: "/news", label: "News" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-slate-50">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600/90 text-white shadow-md shadow-blue-500/40">
                  <span className="text-lg font-semibold tracking-tight">
                    DL
                  </span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold tracking-wide text-slate-50">
                    DISPLAY Lab
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                    Technical University of Crete
                  </span>
                </div>
              </Link>

              <nav className="hidden items-center gap-6 text-sm font-medium text-slate-200 md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition-colors hover:text-blue-400"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-16">
              {children}
            </div>
          </main>

          <footer className="border-t border-slate-800 bg-slate-950/95">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <div className="font-semibold text-slate-200">
                  DISPLAY Lab – Digital Image and Signal Processing
                </div>
                <div>
                  School of Electrical and Computer Engineering, Technical
                  University of Crete
                </div>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <span>
                  © {new Date().getFullYear()} Technical University of Crete.
                </span>
                <span className="hidden md:inline text-slate-600">•</span>
                <span>Chania, Greece</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
