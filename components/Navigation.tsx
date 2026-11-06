"use client";
import { useState } from "react";
import { Brand } from "./Brand";
import { booking } from "@/src/program";
export function Navigation() {
  const [open, set] = useState(false);
  return (
    <header className="mast">
      <div className="wrap nav">
        <Brand />
        <button
          className="menubtn"
          aria-expanded={open}
          aria-controls="toplinks"
          onClick={() => set(!open)}
        >
          {open ? "Close ×" : "Menu ☰"}
        </button>
        <nav
          id="toplinks"
          className={open ? "open" : ""}
          aria-label="Main"
          onClick={() => set(false)}
        >
          <a href="/#program">Program</a>
          <a href="/#projects">Student work</a>
          <a href="/blog">Field notes</a>
          <a className="navcta" href={booking}>
            Free consultation ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
