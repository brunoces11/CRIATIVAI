import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "../SiteHeader";

export const metadata: Metadata = {
  title: "Style Guide | CriativAI",
  description: "The visual system and component reference for CriativAI.",
};

const colors = [
  ["Graphite", "--graphite", "#181D23"],
  ["Blue Black", "--blue-black", "#151A20"],
  ["Surface", "--surface", "#22272D"],
  ["Surface 2", "--surface-2", "#2B3038"],
  ["Metal", "--metal", "#34383F"],
  ["White", "--white", "#E1E1DF"],
  ["Muted", "--muted", "#9A9DA2"],
  ["Accent", "--accent", "#C8A28F"],
  ["Accent Light", "--accent-light", "#D8B6A4"],
  ["Accent Dark", "--accent-dark", "#A9806E"],
] as const;

const headings = [
  ["H1", "Creative intelligence", "Anton", "clamp(3.6rem, 18vw, 7rem)"],
  ["H2", "A clear visual hierarchy", "Anton", "clamp(2.6rem, 6vw, 5rem)"],
  ["H3", "Human-centered systems", "Inter", "clamp(1.8rem, 2.5vw, 2.45rem)"],
  ["H4", "Component detail", "Inter", "1.25rem"],
  ["H5", "Supporting information", "Inter", "1rem"],
  ["H6", "Metadata and labels", "Inter", "0.76rem"],
] as const;

const fontFamilies = [
  {
    role: "Primary / Display",
    name: "Anton",
    variable: "--font-display",
    sample: "Creative AI Solutions",
    styles: ["normal"],
    weights: [[400, "Regular"]],
  },
  {
    role: "Secondary / Interface",
    name: "Inter",
    variable: "--font-sans",
    sample: "Intelligence made useful",
    styles: ["normal", "italic"],
    weights: [[100, "Thin"], [200, "Extra Light"], [300, "Light"], [400, "Regular"], [500, "Medium"], [600, "Semibold"], [700, "Bold"], [800, "Extra Bold"], [900, "Black"]],
  },
  {
    role: "Tertiary / Brand serif",
    name: "Cormorant Garamond",
    variable: "--font-serif",
    sample: "Thoughtful systems",
    styles: ["normal"],
    weights: [[600, "Semibold"], [700, "Bold"]],
  },
  {
    role: "Quaternary / Condensed utility",
    name: "Roboto Condensed",
    variable: "--font-condensed",
    sample: "Structured intelligence",
    styles: ["normal", "italic"],
    weights: [[100, "Thin"], [200, "Extra Light"], [300, "Light"], [400, "Regular"], [500, "Medium"], [600, "Semibold"], [700, "Bold"], [800, "Extra Bold"], [900, "Black"]],
  },
] as const;

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <span className="brand-monogram" aria-hidden="true">CA</span>
      <span className="brand-name">CRIATIVAI</span>
    </span>
  );
}

function Spec({ children }: { children: ReactNode }) {
  return <p className="style-spec">{children}</p>;
}

export default function StyleGuide() {
  return (
    <main className="style-page" id="top">
      <SiteHeader brand={<Brand />} page="style" />

      <section className="style-hero">
        <div className="container">
          <p className="eyebrow">CriativAI / System reference</p>
          <h1><span>Style</span> Guide</h1>
          <p>
            The visual language behind CriativAI: a practical reference for building consistent, clear, and
            human-centered AI experiences.
          </p>
        </div>
      </section>

      <section className="style-section" aria-labelledby="colors-title">
        <div className="container">
          <div className="style-section-head">
            <div><p className="eyebrow">01 / Foundations</p><h2 id="colors-title">Color system</h2></div>
            <p>Deep graphite surfaces keep the interface focused; warm muted accents guide attention without noise.</p>
          </div>
          <div className="color-grid">
            {colors.map(([name, token, value]) => (
              <article className="color-card" key={token}>
                <div className="color-swatch" style={{ backgroundColor: `var(${token})` }} />
                <div><h3>{name}</h3><Spec>{token} · {value}</Spec></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="style-section style-section--surface" aria-labelledby="type-title">
        <div className="container">
          <div className="style-section-head">
            <div><p className="eyebrow">02 / Type scale</p><h2 id="type-title">Heading hierarchy</h2></div>
            <p>Anton creates editorial impact. Inter keeps interfaces direct and legible. Cormorant adds a human note to the brand.</p>
          </div>
          <div className="type-list">
            {headings.map(([tag, text, font, size]) => (
              <HeadingSample key={tag} tag={tag} text={text} font={font} size={size} />
            ))}
          </div>
          <div className="body-samples">
            <article><p className="micro-label">Body / Inter</p><p>Clear, considered copy for complex ideas. Default body text uses 16px with a 1.55 line-height.</p><Spec>16px · 400 · line-height 1.55</Spec></article>
            <article><p className="micro-label">Eyebrow / Inter</p><p className="eyebrow">Design × Engineering × Strategy</p><Spec>0.72rem · 500 · 0.15em tracking</Spec></article>
            <article><p className="micro-label">Brand serif / Cormorant Garamond</p><p className="serif-sample">Thoughtful, human, precise.</p><Spec>600–700 · brand moments</Spec></article>
          </div>
        </div>
      </section>

      <section className="style-section typography-section" aria-labelledby="typography-title">
        <div className="container">
          <div className="style-section-head">
            <div><p className="eyebrow">03 / Font families</p><h2 id="typography-title">Typography</h2></div>
            <p>Every font loaded by the site, with the exact weights available for product and brand use.</p>
          </div>
          <div className="font-family-list">
            {fontFamilies.map((family) => (
              <article className="font-family-card" key={family.name}>
                <div className="font-family-head">
                  <p className="micro-label">{family.role}</p>
                  <h3>{family.name}</h3>
                  <Spec>{family.variable}</Spec>
                </div>
                <div className="font-weight-list">
                  {family.weights.map(([weight, label]) => (
                    <div className="font-weight-sample" key={weight} style={{ fontFamily: `var(${family.variable})`, fontWeight: weight }}>
                      <span>{weight} / {label}</span>
                      <div className="font-style-examples">
                        {family.styles.map((style) => (
                          <div className="font-case-examples" key={style} style={{ fontStyle: style }}>
                            {family.styles.length > 1 && <em>{style}</em>}
                            <strong>{family.sample.toUpperCase()}</strong>
                            <strong>{family.sample.toLowerCase()}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="style-section" aria-labelledby="actions-title">
        <div className="container">
          <div className="style-section-head">
            <div><p className="eyebrow">04 / Actions</p><h2 id="actions-title">Links & buttons</h2></div>
            <p>Interactions are quiet by default and respond with the accent color, movement, and clear keyboard focus.</p>
          </div>
          <div className="action-grid">
            <article className="specimen-card"><p className="micro-label">Primary button</p><a className="button button--light" href="#actions-title">Let&apos;s Talk <span>↗</span></a><Spec>46px min-height · 22px horizontal padding · 2px radius</Spec></article>
            <article className="specimen-card"><p className="micro-label">Accent button</p><a className="button button--accent" href="#actions-title">Start a Project <span>↗</span></a><Spec>Accent gradient · hover lift −2px</Spec></article>
            <article className="specimen-card"><p className="micro-label">Text link</p><a className="style-text-link" href="#actions-title">Explore the system <span>↗</span></a><Spec>0.75rem · 0.08em tracking · accent on hover</Spec></article>
          </div>
        </div>
      </section>

      <section className="style-section style-section--surface" aria-labelledby="components-title">
        <div className="container">
          <div className="style-section-head">
            <div><p className="eyebrow">05 / Components</p><h2 id="components-title">Core building blocks</h2></div>
            <p>Reusable surfaces, borders, labels, and feedback patterns used to make the interface feel coherent.</p>
          </div>
          <div className="component-grid">
            <article className="component-card"><p className="project-index">01 / Card</p><h3>Surface card</h3><p>Layered dark gradients give modules depth while preserving a calm reading surface.</p><Spec>12px radius · 1px border · 14px / 36px shadow</Spec></article>
            <article className="component-card component-card--label"><p className="micro-label">System label</p><h3>Technical foundation</h3><p>Uppercase labels establish context without competing with the main message.</p><Spec>0.72rem · uppercase · 0.15em tracking</Spec></article>
            <article className="component-card"><div className="component-status"><i /> Grounded system</div><h3>Accent signal</h3><p>Use warm accent marks to indicate priority, active states, and confidence.</p><Spec>#C8A28F · subtle glow · never body copy</Spec></article>
          </div>
          <div className="style-rules">
            <div><span>Layout</span><strong>1,300px maximum content width</strong></div>
            <div><span>Spacing</span><strong>16px base rhythm · 72px section spacing</strong></div>
            <div><span>Motion</span><strong>220–300ms ease transitions</strong></div>
            <div><span>Focus</span><strong>2px accent-light outline · 4px offset</strong></div>
          </div>
        </div>
      </section>

      <footer className="style-footer">
        <div className="container"><span>CRIATIVAI / Style guide</span><a href="/">Return to home ↗</a></div>
      </footer>
    </main>
  );
}

function HeadingSample({ tag, text, font, size }: (typeof headings)[number]) {
  const Tag = tag.toLowerCase() as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <article className="type-row">
      <div className="type-meta"><span>{tag}</span><Spec>{font} · {size}</Spec></div>
      <Tag className={`type-sample type-sample--${tag.toLowerCase()}`}>{text}</Tag>
    </article>
  );
}
