"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

const navigation = [
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Human Resources", href: "/human-resources" },
  { label: "Contact", href: "/contact" },
  { label: "Style", href: "/style" },
];

export function SiteHeader({ brand, page = "home" }: { brand: ReactNode; page?: "home" | "style" | "human-resources" | "talent-preview" | "contact" }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollProgress(Math.min(window.scrollY / 300, 1));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const headerStyle = useMemo(() => ({
    "--header-background-opacity": String(0.2 + scrollProgress * 0.6),
    "--header-blur": `${1 + scrollProgress * 4}px`,
    "--header-border-opacity": String(0.03 + scrollProgress * 0.06),
  }) as CSSProperties, [scrollProgress]);

  return (
    <header className={`site-header${menuOpen ? " site-header--open" : ""}`} style={headerStyle}>
      <div className="site-container header-inner">
        <a href={page === "home" ? "#top" : "/"} className="header-brand" onClick={() => setMenuOpen(false)}>{brand}</a>

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
            {navigation.map((item) => {
              const href = page !== "home" && item.href.startsWith("#") ? `/${item.href}` : item.href;
              return <a key={item.href} href={href} onClick={() => setMenuOpen(false)}>{item.label}</a>;
            })}
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
