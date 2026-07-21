"use client";

import { useEffect, useState, type ReactNode } from "react";

const navigation = [
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Human Resources", href: "#human-resources" },
  { label: "Contact", href: "#contact" },
];

export function SiteHeader({ brand }: { brand: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}${menuOpen ? " site-header--open" : ""}`}>
      <div className="container header-inner">
        <a href="#top" className="header-brand" onClick={() => setMenuOpen(false)}>{brand}</a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>

        <div className="header-right" id="primary-navigation">
          <nav className="primary-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
          </nav>
          <div className="language-selector" aria-label="Language selector">
            <button type="button" className="language-option language-option--active" aria-current="true" title="English">
              <span aria-hidden="true">🇺🇸</span><span className="sr-only">English</span>
            </button>
            <button type="button" className="language-option" disabled title="Portuguese — coming soon">
              <span aria-hidden="true">🇧🇷</span><span className="sr-only">Portuguese — coming soon</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
