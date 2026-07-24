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
    let frameId = 0;
    let lastProgress = -1;

    const updateProgress = () => {
      frameId = 0;
      const nextProgress = Math.min(window.scrollY / 300, 1);
      const roundedProgress = Math.round(nextProgress * 100) / 100;

      if (roundedProgress !== lastProgress) {
        lastProgress = roundedProgress;
        setScrollProgress(roundedProgress);
      }
    };

    const onScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateProgress);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const headerStyle = useMemo(() => ({
    "--header-background-opacity": String(0.2 + scrollProgress * 0.62),
    "--header-blur": `${1 + scrollProgress * 5}px`,
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
              <img className="language-option__icon" src="/icons/flag-uk.svg" alt="" aria-hidden="true" width="18" height="18" />
              <span className="sr-only">English</span>
            </button>
            <button type="button" className="language-option" disabled title="Portuguese — coming soon">
              <img className="language-option__icon" src="/icons/flag-brazil.svg" alt="" aria-hidden="true" width="18" height="18" />
              <span className="sr-only">Portuguese — coming soon</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
