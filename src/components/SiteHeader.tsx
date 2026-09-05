"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { getCurrentLanguage, getLocalizedPath } from "../i18n/getCurrentLanguage";
import { type Language } from "../i18n/constants";
import { isAudienceEnabled, type Audience } from "../lib/audienceVisibility";

type NavigationItem = { labelKey: string; href: string; adminOnly?: boolean; audience?: Audience };

const navigation: NavigationItem[] = [
  { labelKey: "hireMe", href: "/hire-me", adminOnly: true },
  { labelKey: "services", href: "/services" },
  { labelKey: "projects", href: "#projects", adminOnly: true },
  { labelKey: "recruiters", href: "/for-recrutiers", audience: "recruiters" },
  { labelKey: "about", href: "/about-me" },
  { labelKey: "video", href: "/", adminOnly: true },
  { labelKey: "contact", href: "/contact" },
  { labelKey: "style", href: "/style", adminOnly: true },
];

const solutionsNavigation = [
  { href: "/for-recrutiers", page: "human-resources" },
  { href: "/founding-sdr", page: "founding-sdr" },
] as const;

const pageToHref: Partial<Record<"home" | "style" | "human-resources" | "founding-sdr" | "talent-preview" | "contact" | "video" | "about-me" | "services" | "hire-me" | "adm", string>> = {
  style: "/style",
  "human-resources": "/for-recrutiers",
  "founding-sdr": "/founding-sdr",
  contact: "/contact",
  "about-me": "/about-me",
  services: "/services",
  "hire-me": "/hire-me",
};

export function SiteHeader({ brand, page = "home" }: { brand: ReactNode; page?: "home" | "style" | "human-resources" | "founding-sdr" | "talent-preview" | "contact" | "video" | "about-me" | "services" | "hire-me" | "adm" }) {
  const { t } = useTranslation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const activeHref = pageToHref[page];
  const currentLanguage = getCurrentLanguage();
  const changeLanguage = (language: Language) => {
    window.sessionStorage.removeItem("chat_session_id");
    window.sessionStorage.removeItem("chat_welcome_key");
    window.location.assign(getLocalizedPath(window.location.pathname + window.location.search + window.location.hash, language));
  };
  const languageSelector = (variant: "desktop" | "mobile") => (
    <div className={`language-selector language-selector--${variant}`} aria-label={t("header.languageSelector")}>
      <button type="button" className={`language-option${currentLanguage === "pt" ? " language-option--active" : ""}`} aria-current={currentLanguage === "pt" ? "true" : undefined} title={t("header.portuguese")} onClick={() => changeLanguage("pt")}>
        <img className="language-option__icon" src="/icons/flag-brazil.svg" alt="" aria-hidden="true" width="18" height="18" />
        <span className="sr-only">{t("header.portuguese")}</span>
      </button>
      <button type="button" className={`language-option${currentLanguage === "en" ? " language-option--active" : ""}`} aria-current={currentLanguage === "en" ? "true" : undefined} title={t("header.english")} onClick={() => changeLanguage("en")}>
        <img className="language-option__icon" src="/icons/flag-usa.svg" alt="" aria-hidden="true" width="18" height="18" />
        <span className="sr-only">{t("header.english")}</span>
      </button>
    </div>
  );

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
        <a href={page === "home" ? "#top" : getLocalizedPath("/", currentLanguage)} className="header-brand" onClick={() => setMenuOpen(false)}>{brand}</a>

        {languageSelector("mobile")}

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
        </button>

        <div className="header-right" id="primary-navigation">
          <nav className="primary-nav" aria-label={t("header.primaryNavigation")}>
            {navigation.filter((item) => (!item.adminOnly || page === "adm") && (!item.audience || isAudienceEnabled(item.audience))).map((item) => {
              const href = page !== "home" && item.href.startsWith("#") ? `/${item.href}` : item.href;
              const localizedHref = href.startsWith("#") ? href : getLocalizedPath(href, currentLanguage);
              const isActive = activeHref === href;
              return <a key={item.href} href={localizedHref} aria-current={isActive ? "page" : undefined} onClick={() => setMenuOpen(false)}>{t(`header.${item.labelKey}`)}</a>;
            })}
            {page === "adm" ? (
              <div className={`solutions-menu${solutionsOpen ? " solutions-menu--open" : ""}`}>
                <button
                  type="button"
                  className="solutions-menu__toggle"
                  aria-haspopup="menu"
                  aria-expanded={solutionsOpen}
                  onClick={() => setSolutionsOpen((open) => !open)}
                >
                  <span>{t("header.solutions")}</span>
                  <span className="solutions-menu__chevron" aria-hidden="true">v</span>
                </button>
                <div className="solutions-menu__panel" role="menu" aria-label={t("header.solutionsSubmenu")}>
                  {solutionsNavigation.map((item) => (
                    <a
                      key={item.href}
                      href={getLocalizedPath(item.href, currentLanguage)}
                      role="menuitem"
                      aria-current={undefined}
                      onClick={() => {
                        setMenuOpen(false);
                        setSolutionsOpen(false);
                      }}
                    >
                      {item.page === "human-resources" ? t("header.recruiters") : t("header.founders")}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </nav>
          {languageSelector("desktop")}
        </div>
      </div>
    </header>
  );
}
