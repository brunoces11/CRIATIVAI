import type { ReactNode } from "react";
import { RecruitmentAiConsole } from "../components/RecruitmentAiConsole";
import { SiteHeader } from "../components/SiteHeader";
import { isAudienceEnabled } from "../lib/audienceVisibility";

const colors = [
  ["Graphite", "--graphite", "#181D23"],
  ["Blue Black", "--blue-black", "#151A20"],
  ["Blue Cyan", "--blue-cyan", "#21D8FF"],
  ["Blue Steel", "--blue-steel", "#4F8FB8"],
  ["Navy Deep", "--navy-deep", "#0D1824"],
  ["Purple Muted", "--purple-muted", "#8D7BB7"],
  ["Purple Deep", "--purple-deep", "#24162F"],
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
  ["H1", "Creative intelligence", "Orbitron Regular", "3rem"],
  ["H2", "A clear visual hierarchy", "Orbitron Regular", "2.25rem"],
  ["H3", "Human-centered systems", "Orbitron Regular", "1.5rem"],
  ["H4", "Component detail", "Orbitron Regular", "inherit"],
  ["H5", "Supporting information", "Orbitron Regular", "inherit"],
  ["H6", "Metadata and labels", "Orbitron Regular", "inherit"],
] as const;

const fontFamilies = [
  {
    role: "Primary / Display",
    name: "Anton",
    variable: "--font-display",
    stack: "Anton, with Impact and sans-serif fallbacks",
    sample: "Creative AI Solutions",
    styles: ["normal"],
    weights: [[400, "Regular"]],
  },
  {
    role: "Secondary / Interface",
    name: "Inter",
    variable: "--font-sans",
    stack: "Inter",
    sample: "Intelligence made useful",
    styles: ["normal", "italic"],
    weights: [[100, "Thin"], [200, "Extra Light"], [300, "Light"], [400, "Regular"], [500, "Medium"], [600, "Semibold"], [700, "Bold"], [800, "Extra Bold"], [900, "Black"]],
  },
  {
    role: "Tertiary / Brand serif",
    name: "Cormorant Garamond",
    variable: "--font-serif",
    stack: "Cormorant Garamond",
    sample: "Thoughtful systems",
    styles: ["normal"],
    weights: [[600, "Semibold"], [700, "Bold"]],
  },
  {
    role: "Quaternary / Condensed utility",
    name: "Roboto Condensed",
    variable: "--font-condensed",
    stack: "Roboto Condensed, with sans-serif fallback",
    sample: "Condensed interface sample",
    styles: ["normal", "italic"],
    weights: [[100, "Thin"], [200, "Extra Light"], [300, "Light"], [400, "Regular"], [500, "Medium"], [600, "Semibold"], [700, "Bold"], [800, "Extra Bold"], [900, "Black"]],
  },
  {
    role: "Quinary / Condensed alternate",
    name: "Rajdhani",
    variable: "--font-rajdhani",
    stack: "Rajdhani, with sans-serif fallback",
    sample: "Condensed interface sample",
    styles: ["normal"],
    weights: [[300, "Light"], [400, "Regular"], [500, "Medium"], [600, "Semibold"], [700, "Bold"]],
  },
] as const;

const MIDDOT = "\u00B7";
const TIMES = "\u00D7";
const ARROW_NE = "\u2197";

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
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
        <div className="site-container">
          <p className="eyebrow">CriativAI / System reference</p>
          <h1><span>Style</span> Guide</h1>
          <p>
            The visual language behind CriativAI: a practical reference for building consistent, clear, and
            human-centered AI experiences.
          </p>
        </div>
      </section>

      <section className="style-neon-section" aria-labelledby="neon-title">
        <div className="site-container">
          <div className="style-section-head">
            <div><p className="eyebrow">00 / Motion study</p><h2 id="neon-title">Neon short-circuit</h2></div>
            <p>A restrained study of an illuminated neon wordmark: a stable glow, occasional electrical discharges, and no page-wide flash.</p>
          </div>
          <div className="neon-specimen-grid">
            <NeonSpecimen variant="regular" label="Rajdhani / 400" font="rajdhani" />
            <NeonSpecimen variant="regular" label="Roboto / 200 ExtraLight" font="roboto" />
            <NeonSpecimen variant="regular" label="Inter / 200 ExtraLight" font="inter" />
          </div>
        </div>
      </section>

      <section className="style-section style-section--cta" aria-labelledby="actions-title">
        <div className="site-container">
          <div className="style-section-head">
            <div><p className="eyebrow">01 / Actions</p><h2 id="actions-title">Links & buttons</h2></div>
            <p>Interactions are quiet by default and respond with the accent color, movement, and clear keyboard focus.</p>
          </div>
          <div className="action-grid">
            <article className="specimen-card"><p className="micro-label">Primary button</p><a className="button button--light" href="#actions-title">Let&apos;s Talk <span>{ARROW_NE}</span></a><Spec>46px min-height {MIDDOT} 22px horizontal padding {MIDDOT} 2px radius</Spec></article>
            <article className="specimen-card"><p className="micro-label">Blue hover variant</p><a className="button button--light button--light-blue" href="#actions-title">Let&apos;s Talk <span>{ARROW_NE}</span></a><Spec>Original light state {MIDDOT} blue neon hover</Spec></article>
            <article className="specimen-card"><p className="micro-label">Accent button</p><a className="button button--accent" href="#actions-title">Start a Project <span>{ARROW_NE}</span></a><Spec>Accent gradient {MIDDOT} hover lift -2px</Spec></article>
            <article className="specimen-card"><p className="micro-label">Neon outline</p><a className="button button--neon" href="#actions-title">Short Circuit <span>{ARROW_NE}</span><i aria-hidden="true" /></a><Spec>Transparent fill {MIDDOT} neon outline {MIDDOT} rays on hover</Spec></article>
            <article className="specimen-card"><p className="micro-label">Text link</p><a className="style-text-link" href="#actions-title">Explore the system <span>{ARROW_NE}</span></a><Spec>0.75rem {MIDDOT} 0.08em tracking {MIDDOT} accent on hover</Spec></article>
          </div>
        </div>
      </section>

      <section className="style-section" aria-labelledby="colors-title">
        <div className="site-container">
          <div className="style-section-head">
            <div><p className="eyebrow">01 / Foundations</p><h2 id="colors-title">Color system</h2></div>
            <p>Deep graphite surfaces keep the interface focused; warm muted accents guide attention without noise.</p>
          </div>
          <div className="color-grid">
            {colors.map(([name, token, value]) => (
              <article className="color-card" key={token}>
                <div className="color-swatch" style={{ backgroundColor: `var(${token})` }} />
                <div><h3>{name}</h3><Spec>{token} {MIDDOT} {value}</Spec></div>
              </article>
            ))}
          </div>
          <div className="color-strip" aria-label="Full color palette strip">
            {colors.map(([name, token]) => (
              <span key={token} style={{ backgroundColor: `var(${token})` }} title={name} />
            ))}
          </div>
        </div>
      </section>

      <section className="style-section style-section--surface" aria-labelledby="type-title">
        <div className="site-container">
          <div className="style-section-head">
            <div><p className="eyebrow">02 / Type scale</p><h2 id="type-title">Heading hierarchy</h2></div>
            <p>Orbitron powers the neon heading treatment. Inter keeps interfaces direct and legible. Cormorant adds a human note to the brand.</p>
          </div>
          <div className="type-list">
            {headings.map(([tag, text, font, size]) => (
              <HeadingSample key={tag} tag={tag} text={text} font={font} size={size} />
            ))}
          </div>
          <div className="body-samples">
            <article><p className="micro-label">Body / Inter</p><p>Clear, considered copy for complex ideas. Default body text uses 16px with a 1.55 line-height.</p><Spec>16px {MIDDOT} 400 {MIDDOT} line-height 1.55</Spec></article>
            <article><p className="micro-label">Eyebrow / Inter</p><p className="eyebrow">Design {TIMES} Engineering {TIMES} Strategy</p><Spec>0.72rem {MIDDOT} 500 {MIDDOT} 0.15em tracking</Spec></article>
            <article><p className="micro-label">Brand serif / Cormorant Garamond</p><p className="serif-sample">Thoughtful, human, precise.</p><Spec>600-700 {MIDDOT} brand moments</Spec></article>
          </div>
        </div>
      </section>

      <section className="style-section typography-section" aria-labelledby="typography-title">
        <div className="site-container">
          <div className="style-section-head">
            <div><p className="eyebrow">03 / Font families</p><h2 id="typography-title">Typography</h2></div>
            <p>Every font loaded by the site, with the exact weights and stack behavior available for product and brand use. Rajdhani is included here as an alternate condensed system font.</p>
          </div>
          <div className="font-family-list">
            {fontFamilies.map((family) => (
              <article className="font-family-card" key={family.name}>
                <div className="font-family-head">
                  <p className="micro-label">{family.role}</p>
                  <h3 style={{ fontFamily: `var(${family.variable})` }}>{family.name}</h3>
                  <Spec>{family.variable} {MIDDOT} {family.stack}</Spec>
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

      <section className="style-section style-section--surface" aria-labelledby="components-title">
        <div className="site-container">
          <div className="style-section-head">
            <div><p className="eyebrow">05 / Components</p><h2 id="components-title">Core building blocks</h2></div>
            <p>Reusable surfaces, borders, labels, and feedback patterns used to make the interface feel coherent.</p>
          </div>
          <div className="component-grid">
            <article className="component-card"><p className="project-index">01 / Card</p><h3>Surface card</h3><p>Layered dark gradients give modules depth while preserving a calm reading surface.</p><Spec>12px radius {MIDDOT} 1px border {MIDDOT} 14px / 36px shadow</Spec></article>
            <article className="component-card component-card--label"><p className="micro-label">System label</p><h3>Technical foundation</h3><p>Uppercase labels establish context without competing with the main message.</p><Spec>0.72rem {MIDDOT} uppercase {MIDDOT} 0.15em tracking</Spec></article>
            <article className="component-card"><div className="component-status"><i /> Grounded system</div><h3>Accent signal</h3><p>Use warm accent marks to indicate priority, active states, and confidence.</p><Spec>#C8A28F {MIDDOT} subtle glow {MIDDOT} never body copy</Spec></article>
          </div>
          <div className="style-rules">
            <div><span>Layout</span><strong>1,300px maximum content width</strong></div>
            <div><span>Spacing</span><strong>16px base rhythm {MIDDOT} 72px section spacing</strong></div>
            <div><span>Motion</span><strong>220-300ms ease transitions</strong></div>
            <div><span>Focus</span><strong>2px accent-light outline {MIDDOT} 4px offset</strong></div>
          </div>
        </div>
      </section>

      <section className="style-section" aria-labelledby="live-pages-title">
        <div className="site-container">
          <div className="style-section-head">
            <div><p className="eyebrow">06 / Live examples</p><h2 id="live-pages-title">Page links</h2></div>
            <p>Live routes that apply this system in practice, including the new recruitment intake landing page.</p>
          </div>
          <div className="style-page-links">
            {isAudienceEnabled("recruiters") ? (
              <a className="style-page-link" href="/for-recrutiers">
                <span className="micro-label">Recruitment offer</span>
                <strong>For Recruiters</strong>
                <em>Open the service page {ARROW_NE}</em>
              </a>
            ) : null}
            <a className="style-page-link style-page-link--featured" href="/talent-preview">
              <span className="micro-label">Free shortlist request</span>
              <strong>Talent Preview</strong>
              <em>Open the promotional intake page {ARROW_NE}</em>
            </a>
            <a className="style-page-link" href="/contact">
              <span className="micro-label">Direct inquiry</span>
              <strong>Contact</strong>
              <em>Open the contact form {ARROW_NE}</em>
            </a>
          </div>
        </div>
      </section>

      <section className="style-section style-section--surface" aria-labelledby="console-component-title">
        <div className="site-container">
          <div className="style-section-head">
            <div><p className="eyebrow">07 / Extracted component</p><h2 id="console-component-title">Recruitment AI console</h2></div>
            <p>The illustration panel removed from the Human Resources hero now lives here as a standalone reference component.</p>
          </div>
          <div className="style-component-showcase">
            <div className="style-component-shell">
              <p className="micro-label">Component / RecruitmentAiConsole</p>
              <RecruitmentAiConsole />
            </div>
          </div>
        </div>
      </section>

      <footer className="style-footer">
        <div className="site-container"><span>CRIATIVAI / Style guide</span><a href="/">Return to home {ARROW_NE}</a></div>
      </footer>
    </main>
  );
}

type HeadingSampleProps = {
  tag: (typeof headings)[number][0];
  text: (typeof headings)[number][1];
  font: (typeof headings)[number][2];
  size: (typeof headings)[number][3];
};

function HeadingSample({ tag, text, font, size }: HeadingSampleProps) {
  const Tag = tag.toLowerCase() as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <article className="type-row">
      <div className="type-meta"><span>{tag}</span><Spec>{font} {MIDDOT} {size}</Spec></div>
      <Tag className={`type-sample type-sample--${tag.toLowerCase()}`}>{text}</Tag>
    </article>
  );
}

function NeonSpecimen({ variant, label, font }: { variant: "light" | "regular"; label: string; font: "rajdhani" | "roboto" | "inter" }) {
  return (
    <article className={`neon-specimen neon-specimen--${variant} neon-font-${font}`}>
      <p className="micro-label">{label}</p>
      <div className="neon-wordmark neon-ativo" role="img" aria-label={`Neon short-circuit, ${label}`}>
        <svg viewBox="0 0 440 140" aria-hidden="true">
          <text className="neon-glow" x="220" y="96" textAnchor="middle">NEON</text>
          <text className="neon-core" x="220" y="96" textAnchor="middle">NEON</text>
          <g className="neon-arcs">
            <path className="neon-arc neon-arc--one" d="M101 95 L99 88 L95 82 L89 77 L117 69 L104 42" />
            <path className="neon-arc neon-arc--two" d="M162 43 L166 47 L164 53 L179 51 L151 64 L171 79" />
            <path className="neon-arc neon-arc--three" d="M230 57 L235 48 L248 43 L262 49 L270 61 L264 73" />
            <path className="neon-arc neon-arc--four" d="M268 95 L271 84 L278 75 L293 63 L287 42" />
            <path className="neon-arc neon-arc--five" d="M238 73 L231 64 L236 55 L249 47 L262 52 L268 63" />
            <path className="neon-arc neon-arc--six" d="M266 92 L272 82 L267 73 L281 66 L289 54 L286 43" />
            <path className="neon-arc neon-arc--seven" d="M139 43 L132 55 L137 67 L128 80 L141 95" />
            <path className="neon-arc neon-arc--eight" d="M164 79 L178 82 L192 77 L180 88 L164 92" />
            <path className="neon-arc neon-arc--nine" d="M270 73 L263 82 L251 91 L239 87 L232 78" />
            <path className="neon-arc neon-arc--ten" d="M326 42 L319 53 L327 66 L316 80 L326 95" />
            <path className="neon-arc neon-arc--eleven" d="M108 92 L104 84 L111 73 L105 61 L112 47" />
            <path className="neon-arc neon-arc--twelve" d="M242 47 L251 44 L261 51 L268 62 L263 72" />
            <path className="neon-arc neon-arc--thirteen" d="M117 42 L121 53 L113 64 L125 78 L115 94" />
            <path className="neon-arc neon-arc--fourteen" d="M194 43 L188 53 L198 62 L184 73 L193 79" />
            <path className="neon-arc neon-arc--fifteen" d="M255 91 L264 85 L270 75 L258 66 L269 55" />
            <path className="neon-arc neon-arc--sixteen" d="M305 95 L310 84 L303 73 L314 61 L307 43" />
          </g>
        </svg>
      </div>
      <p className="style-spec">Sixteen anchored discharges · each segment leaves and returns to the letter outline</p>
    </article>
  );
}
