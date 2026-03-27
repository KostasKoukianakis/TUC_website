import type { Metadata } from "next";
import { Open_Sans, Space_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

/** Ίδια οικογένεια με το επίσημο tuc.gr (OpenSansRegular / OpenSansLight → Open Sans). */
const openSans = Open_Sans({
  subsets: ["latin", "greek"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-open-sans",
});

/** Hero reference: Space Mono για nav + mono labels. */
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
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
      className={`${openSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="bg-app min-h-full font-sans text-off-white">
        <div className="flex min-h-screen flex-col">
          {/*
            Padding όπως reference view-source (header > .flex.lg:container + εσωτερική μπάρα):
            container: mx-auto max-w-[160rem] px-[0.625rem] lg:px-10 (2.5rem @64rem)
            μπάρα: px-[10px] lg:px-0 · gap-[20px] · ύψος --header-height
            κάθε nav link: h-[40px] px-[20px] (WQF li > a)
          */}
          <header className="fixed left-0 right-0 top-0 z-40 bg-transparent lg:h-[var(--header-height)] lg:overflow-hidden">
            <div className="mx-auto flex w-full max-w-[160rem] px-[0.625rem] lg:px-10">
              <div className="relative isolate mx-auto flex h-[var(--header-height)] w-full grow items-center justify-between gap-[20px] px-[10px] lg:px-0">
                <Link
                  href="/"
                  className="font-hero-mono flex shrink-0 flex-col leading-snug"
                >
                  <span className="text-[0.62rem] uppercase leading-relaxed tracking-[0.14em] text-[rgba(220,220,220,0.85)]">
                    Digital Image &amp;
                    <br />
                    Signal Processing Lab
                  </span>
                </Link>

                <nav className="hidden items-center gap-10 lg:flex">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="font-hero-mono flex h-[40px] items-center text-[0.58rem] uppercase leading-[0.938rem] tracking-[0.16em] text-[rgba(200,200,200,0.45)] transition-colors duration-200 hover:text-[rgba(200,200,200,0.9)]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-off-white/10 bg-transparent">
            <div className="flex w-full flex-col gap-4 px-[var(--page-gutter-x)] py-6 text-xs text-off-white/60 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-off-white">
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
                <span className="hidden md:inline text-pulse-ash">•</span>
                <span>Chania, Greece</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
