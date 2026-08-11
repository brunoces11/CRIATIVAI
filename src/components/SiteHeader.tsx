"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

const navigation = [
  { label: "Hire me", href: "/hire-me", adminOnly: true },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "#projects", adminOnly: true },
  { label: "About", href: "/about-me" },
  { label: "Video", href: "/", adminOnly: true },
  { label: "Contact", href: "/contact" },
  { label: "Style", href: "/style", adminOnly: true },
];

const solutionsNavigation = [{ label: "For Recruiters", href: "/for-recrutiers" }] as const;

const pageToHref: Partial<Record<"home" | "style" | "human-resources" | "talent-preview" | "contact" | "video" | "about-me" | "services" | "hire-me" | "adm", string>> = {
  style: "/style",
  "human-resources": "/for-recrutiers",
  contact: "/contact",
  "about-me": "/about-me",
  services: "/services",
  "hire-me": "/hire-me",
};

export function SiteHeader({ brand, page = "home" }: { brand: ReactNode; page?: "home" | "style" | "human-resources" | "talent-preview" | "contact" | "video" | "about-me" | "services" | "hire-me" | "adm" }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const activeHref = pageToHref[page];

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

  useEffect(() => {
    if (!menuOpen) setSolutionsOpen(false);
  }, [menuOpen]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!solutionsOpen) return;
      const target = event.target as Node | null;
      if (target && headerRef.current?.contains(target)) return;
      setSolutionsOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSolutionsOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [solutionsOpen]);

  const headerStyle = useMemo(() => ({
    "--header-background-opacity": String(0.2 + scrollProgress * 0.62),
    "--header-blur": `${1 + scrollProgress * 5}px`,
    "--header-border-opacity": String(0.03 + scrollProgress * 0.06),
  }) as CSSProperties, [scrollProgress]);

  return (
    <header ref={headerRef} className={`site-header${menuOpen ? " site-header--open" : ""}`} style={headerStyle}>
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
            {navigation.filter((item) => !item.adminOnly || page === "adm").map((item) => {
              const href = page !== "home" && item.href.startsWith("#") ? `/${item.href}` : item.href;
              const isActive = activeHref === href;
              return <a key={item.href} href={href} aria-current={isActive ? "page" : undefined} onClick={() => setMenuOpen(false)}>{item.label}</a>;
            })}
            <div className={`solutions-menu${solutionsOpen ? " solutions-menu--open" : ""}`}>
              <button
                type="button"
                className={`solutions-menu__toggle${page === "human-resources" ? " is-active" : ""}`}
                aria-haspopup="menu"
                aria-expanded={solutionsOpen}
                onClick={() => setSolutionsOpen((open) => !open)}
              >
                <span>Solutions</span>
                <span className="solutions-menu__chevron" aria-hidden="true">v</span>
              </button>
              <div className="solutions-menu__panel" role="menu" aria-label="Solutions submenu">
                {solutionsNavigation.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    aria-current={page === "human-resources" ? "page" : undefined}
                    onClick={() => {
                      setMenuOpen(false);
                      setSolutionsOpen(false);
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>
          <div className="language-selector" aria-label="Language selector">
            <button type="button" className="language-option language-option--active" aria-current="true" title="English">
              <img className="language-option__icon" src="/icons/flag-uk.svg" alt="" aria-hidden="true" width="18" height="18" />
              <span className="sr-only">English</span>
            </button>
            <button type="button" className="language-option" disabled title="Portuguese - coming soon">
              <img className="language-option__icon" src="/icons/flag-brazil.svg" alt="" aria-hidden="true" width="18" height="18" />
              <span className="sr-only">Portuguese - coming soon</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
