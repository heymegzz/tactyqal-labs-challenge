import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Brand } from "@/components/Brand";
export const metadata: Metadata = {
  title: {
    default: "Tactyqal Labs — The Build Notebook",
    template: "%s · Tactyqal Labs",
  },
  description:
    "One-to-one mentoring for young builders. Explore the eight-week program, student projects, and studio field notes.",
  icons: { icon: "/mark.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Navigation />
        <main id="main">{children}</main>
        <footer>
          <div className="wrap foot">
            <Brand />
            <div>
              Independent design & development challenge
              <br />
              Built by Meghna Nair
            </div>
            <nav aria-label="Footer">
              <a href="https://www.tactyqal.com/">Original site ↗</a>
              <a href="/admin">Editor</a>
              <a href="mailto:tactyqal.labs@gmail.com">Contact ↗</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
