import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "../components/SiteHeader";

const HERO_VIDEO_SRC = "/video-bruno-cesar_1440.mp4";
const HERO_PIN_DISTANCE = 2500;
const HERO_SCRUB_DISTANCE = 2200;
const HERO_VIDEO_FPS = 15;
const HERO_VIDEO_FRAME_DURATION = 1 / HERO_VIDEO_FPS;

const stats = [
  { value: "20+", label: "Years of Experience" },
  { value: "50+", label: "Interactive Projects Delivered" },
  { value: "150K+", label: "Followers Across Social Platforms" },
  {
    value: "5",
    label: "International Prompt Engineering Hackathon Awards",
  },
];

const groundingTopics = [
  "Retrieval-Augmented Generation (RAG)",
  "GraphRAG",
  "Knowledge Graphs",
  "Context Engineering",
  "Business Intelligence",
  "Enterprise Knowledge Bases",
  "Long-Term Memory",
  "Multi-Agent Architectures",
  "Private Knowledge Integration",
  "Structured Data Integration",
];

const services = [
  {
    index: "01",
    title: "UI/UX Design",
    text: "Human-centered digital product design focused on usability, accessibility, and exceptional user experiences.",
    featured: true,
  },
  {
    index: "02",
    title: "Enterprise Knowledge System",
    text: "Centralized enterprise knowledge architecture that gives AI agents a single source of truth, improving answer quality, reducing hallucinations, and keeping business context consistent across systems.",
  },
  {
    index: "03",
    title: "System Design",
    text: "Technical architecture and system planning for scalable digital products and AI-powered applications.",
  },
  {
    index: "04",
    title: "AI Automations",
    text: "Workflow automation that eliminates repetitive tasks and increases operational efficiency using artificial intelligence.",
  },
  {
    index: "05",
    title: "Smart Agents",
    text: "Custom AI agents capable of reasoning, using multiple tools, retrieving knowledge, and executing complex business processes autonomously.",
  },
];

const expertise = [
  "Product Design",
  "UI/UX Design",
  "AI Engineering",
  "Context Engineering",
  "Prompt Engineering",
  "Enterprise Automation",
  "Knowledge Systems",
  "Human-Centered AI",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

function ProjectVisual({ type }: { type: "hr" | "trading" | "dante" }) {
  const src =
    type === "hr"
      ? "/project-visuals/project-human-resources.svg"
      : type === "trading"
        ? "/project-visuals/project-trading.svg"
        : "/project-visuals/project-dante.svg";

  if (type === "hr") {
    return (
      <div className="project-visual project-visual--hr" aria-hidden="true">
        <div className="project-graphic-scale">
          <img className="project-visual-image" src={src} alt="" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (type === "trading") {
    return (
      <div className="project-visual project-visual--trading" aria-hidden="true">
        <div className="project-graphic-scale">
          <img className="project-visual-image" src={src} alt="" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="project-visual project-visual--dante" aria-hidden="true">
      <div className="project-graphic-scale">
        <img className="project-visual-image" src={src} alt="" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function VideoPage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const heroMediaRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const durationRef = useRef(0);
  const trailingSyncRef = useRef(0);
  const lastSyncAtRef = useRef(0);
  const readyRef = useRef(false);
  const lastHeroStateRef = useRef<"before" | "pinned" | "released" | null>(null);
  const lastTextOffsetRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number | null>(null);
  const [videoMissing, setVideoMissing] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const syncHero = () => {
      trailingSyncRef.current = 0;
      lastSyncAtRef.current = performance.now();

      const hero = heroRef.current;
      if (!hero) return;

      const heroTop = hero.getBoundingClientRect().top + window.scrollY;
      const heroScroll = window.scrollY - heroTop;
      const scrollProgress = clamp(heroScroll / HERO_PIN_DISTANCE, 0, 1);
      const scrubProgress = clamp(heroScroll / HERO_SCRUB_DISTANCE, 0, 1);
      const heroState = heroScroll < 0 ? "before" : heroScroll < HERO_PIN_DISTANCE ? "pinned" : "released";

      if (heroStageRef.current && heroState !== lastHeroStateRef.current) {
        lastHeroStateRef.current = heroState;
        heroStageRef.current.style.position = heroState === "pinned" ? "fixed" : "absolute";
        heroStageRef.current.style.top = heroState === "released" ? `${HERO_PIN_DISTANCE}px` : "0";
        heroStageRef.current.style.zIndex = heroState === "pinned" ? "1" : "";
      }

      const video = videoRef.current;
      const duration =
        durationRef.current || (video && Number.isFinite(video.duration) ? video.duration : 0);

      if (video && duration > 0) {
        if (!readyRef.current) {
          durationRef.current = duration;
          readyRef.current = true;
          setVideoReady(true);
        }

        const rawTime = scrubProgress * Math.max(duration - 0.001, 0);
        const nextTime = Math.round(rawTime / HERO_VIDEO_FRAME_DURATION) * HERO_VIDEO_FRAME_DURATION;
        video.pause();
        if (
          !video.seeking &&
          nextTime !== lastVideoTimeRef.current &&
          Math.abs(video.currentTime - nextTime) >= HERO_VIDEO_FRAME_DURATION * 0.5
        ) {
          lastVideoTimeRef.current = nextTime;
          video.currentTime = nextTime;
        }
      }

      const textOffset = Math.round(-scrollProgress * 260);
      if (heroCopyRef.current) {
        if (textOffset !== lastTextOffsetRef.current) {
          lastTextOffsetRef.current = textOffset;
          heroCopyRef.current.style.transform = `translate3d(0, ${textOffset}px, 0)`;
        }
      }
    };

    const requestSync = () => {
      const elapsed = performance.now() - lastSyncAtRef.current;
      const waitMs = HERO_VIDEO_FRAME_DURATION * 1000 - elapsed;

      if (waitMs <= 0) {
        if (trailingSyncRef.current) {
          window.clearTimeout(trailingSyncRef.current);
          trailingSyncRef.current = 0;
        }
        syncHero();
        return;
      }

      if (trailingSyncRef.current) return;
      trailingSyncRef.current = window.setTimeout(syncHero, waitMs);
    };

    syncHero();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
      if (trailingSyncRef.current) window.clearTimeout(trailingSyncRef.current);
    };
  }, []);

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    durationRef.current = Number.isFinite(video.duration) ? video.duration : 0;
    video.pause();
    if (durationRef.current > 0) {
      video.currentTime = 0.001;
      readyRef.current = true;
      setVideoReady(true);
      void video.play().then(() => video.pause()).catch(() => undefined);
      window.dispatchEvent(new Event("scroll"));
    }
  };

  const onCanPlay = () => {
    readyRef.current = durationRef.current > 0;
    setVideoReady(readyRef.current);
    window.dispatchEvent(new Event("scroll"));
  };

  const onVideoError = () => {
    readyRef.current = false;
    setVideoMissing(true);
    setVideoReady(false);
  };

  return (
    <main className="video-page" id="top">
      <SiteHeader brand={<Brand />} page="video" />

      <section className="hero video-hero" aria-labelledby="hero-title" ref={heroRef}>
        <div className="video-hero-stage" ref={heroStageRef}>
        <div className="hero-atmosphere video-hero-atmosphere" aria-hidden="true" />

        <div className="video-hero-media" ref={heroMediaRef} aria-hidden="true">
          {!videoMissing ? (
            <video
              ref={videoRef}
              className="video-hero-video"
              src={HERO_VIDEO_SRC}
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={onLoadedMetadata}
              onLoadedData={onCanPlay}
              onCanPlay={onCanPlay}
              onError={onVideoError}
            />
          ) : (
            <div className="video-hero-placeholder" />
          )}
          <div className="video-hero-overlay" />
        </div>

        <div className="site-container video-hero-inner">
          <div className="hero-copy video-hero-copy" ref={heroCopyRef}>
            <p className="eyebrow hero-eyebrow">
              <span /> Design Ã— Engineering Ã— Strategy
            </p>
            <h1 id="hero-title" className="hero-title">
              <span className="hero-line hero-line--one">CREATIVE</span>
              <span className="hero-line hero-line--two">AI SOLUTIONS</span>
            </h1>
            <div className="hero-intro">
              <p>
                Building AI-powered products, intelligent automations, and custom software that combine design,
                engineering, and business strategy to solve real-world challenges.
              </p>
              <div className="hero-actions">
                <a className="button button--light" href="/contact">
                  Let&apos;s Talk <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>

          <a className="scroll-cue video-scroll-cue" href="#experience" aria-label="Scroll to experience and numbers">
            <span>Scroll to explore</span>
            <i aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="video-next-section" aria-labelledby="video-next-title">
        <div className="site-container video-next-section-inner">
          <div className="video-hero-next video-hero-next--section">
            <h2 id="video-next-title" className="hero-title video-hero-next-title">
              <span className="hero-line video-hero-next-line video-hero-next-line--one">WELCOME TO</span>
              <span className="hero-line video-hero-next-line video-hero-next-line--two">THE HYPER-PERSONALIZATION</span>
              <span className="hero-line video-hero-next-line video-hero-next-line--three">ERA</span>
            </h2>
            <p>
              Now it&apos;s your turn to leverage AI and build digital solutions tailored precisely to your business...
              unlocking new opportunities, accelerating your initiatives, and driving better results.
            </p>
            <div className="hero-actions video-hero-next-actions">
              <a className="button button--light" href="/contact">
                Let&apos;s Talk <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section" id="experience" aria-label="Experience and key numbers">
        <div className="site-container stats-grid">
          {stats.map((stat) => (
            <article className="stat" key={stat.value}>
              <strong className="stat-value">{stat.value}</strong>
              <p>{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section projects-section" id="projects" aria-labelledby="projects-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <h2 id="projects-title">Featured Projects</h2>
            </div>
          </div>

          <div className="projects-grid">
            <article className="project-card" id="human-resources">
              <ProjectVisual type="hr" />
              <div className="project-overlay" />
              <div className="project-content">
                <p className="project-index">01 / Automation</p>
                <h3>Human Resources Automations</h3>
                <p>
                  End-to-end recruitment automation, including candidate sourcing, qualification, ranking, workflow
                  automation, report generation, and AI-assisted hiring.
                </p>
              </div>
              <span className="project-arrow" aria-hidden="true">
                ↗
              </span>
            </article>

            <article className="project-card">
              <ProjectVisual type="trading" />
              <div className="project-overlay" />
              <div className="project-content">
                <p className="project-index">02 / Fintech</p>
                <h3>AI-First Trading Platform</h3>
                <p>
                  An AI-native trading platform designed around intelligent agents, predictive analytics,
                  automation, and decision support.
                </p>
              </div>
              <span className="project-arrow" aria-hidden="true">
                ↗
              </span>
            </article>

            <article className="project-card">
              <ProjectVisual type="dante" />
              <div className="project-overlay" />
              <div className="project-content">
                <p className="project-index">03 / Legal AI</p>
                <h3>
                  Dante <span>Legal AI Platform</span>
                </h3>
                <p>
                  An AI solution for the legal industry built with intelligent agents, RAG, GraphRAG, contextual
                  reasoning, and enterprise knowledge systems.
                </p>
              </div>
              <span className="project-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          </div>
        </div>
      </section>

      <section className="section grounding-section" id="grounding" aria-labelledby="grounding-title">
        <div className="grounding-orbit" aria-hidden="true" />
        <div className="site-container grounding-grid">
          <div className="grounding-copy">
            <p className="eyebrow">Technical foundation</p>
            <h2 id="grounding-title">Knowledge Grounding</h2>
            <h3>Building AI systems that truly understand your business.</h3>
            <p>
              Foundation models are powerful, but generic knowledge is not enough for business-critical work.
              Grounding connects AI to your organization&apos;s verified data, context, processes, and relationships so
              every answer is more relevant, traceable, and reliable.
            </p>
          </div>
          <div className="grounding-panel">
            <div className="grounding-panel-head">
              <span>Enterprise intelligence layer</span>
              <span>10 capabilities</span>
            </div>
            <ul className="topic-list">
              {groundingTopics.map((topic, index) => (
                <li key={topic}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {topic}
                </li>
              ))}
            </ul>
            <p className="grounding-note">
              Proprietary knowledge turns a general-purpose model into a system aligned with how your business
              actually operates.
            </p>
          </div>
        </div>
      </section>

      <section className="section services-section" id="services" aria-labelledby="services-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">What we build</p>
              <h2 id="services-title">Services</h2>
            </div>
            <p className="section-intro">
              From the first interface decision to the intelligence layer behind it, every engagement connects
              design quality with technical depth.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article className={`service-card${service.featured ? " service-card--featured" : ""}`} key={service.title}>
                <div className="service-topline">
                  <span>{service.index}</span>
                  <i aria-hidden="true">
                    <b />
                  </i>
                </div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-section" id="about" aria-labelledby="about-title">
        <div className="site-container about-grid">
          <div className="about-image-wrap">
            <img src="/bruno-portrait.png" alt="Bruno, founder of CriativAI" className="about-image" />
            <div className="about-image-meta">
              <span>Bruno</span>
              <span>Founder / Designer / AI Engineer</span>
            </div>
          </div>
          <div className="about-copy">
            <p className="eyebrow">The human behind the systems</p>
            <h2 id="about-title">About</h2>
            <p className="about-lead">
              Technology is most valuable when it amplifies human judgment, not when it gets in the way.
            </p>
            <p>
              Bruno works at the intersection of product design, artificial intelligence, and business strategy.
              His practice combines two decades of creative experience with a systems mindset to turn complex ideas
              into useful, understandable, and carefully crafted digital products.
            </p>
            <div className="expertise-block">
              <p className="micro-label">Areas of expertise</p>
              <ul className="expertise-list">
                {expertise.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta" id="contact" aria-labelledby="contact-title">
        <div className="cta-orbit cta-orbit--one" aria-hidden="true" />
        <div className="cta-orbit cta-orbit--two" aria-hidden="true" />
        <div className="site-container final-cta-inner">
          <p className="eyebrow">Start a conversation</p>
          <h2 id="contact-title">
            Ready to Build Your Next <span>AI Product?</span>
          </h2>
          <p>
            Let&apos;s create intelligent software that combines design, automation, and business strategy to solve real
            business challenges.
          </p>
          <a className="button button--accent" href="/contact">
            Start a Project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="site-container footer-grid">
          <div className="footer-brand">
            <a href="#top" aria-label="CriativAI home">
              <Brand />
            </a>
            <p>AI-powered products, intelligent automations, and human-centered digital experiences.</p>
            <span className="copyright">© {new Date().getFullYear()} CriativAI. All rights reserved.</span>
          </div>
          <div className="footer-links-grid">
            <div>
              <p className="micro-label">Navigation</p>
              <a href="#services">Services</a>
              <a href="#projects">Projects</a>
              <a href="/human-resources">Human Resources</a>
              <a href="/contact">Contact</a>
            </div>
            <div>
              <p className="micro-label">Social Media</p>
              <a
                className="footer-social-link"
                href="https://www.youtube.com/@tutorialmasterbrasil"
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="footer-social-icon" aria-hidden="true">
                  ▶
                </span>
                YouTube
              </a>
              <a
                className="footer-social-link"
                href="https://www.linkedin.com/in/brunoalecrim"
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="footer-social-icon" aria-hidden="true">
                  in
                </span>
                LinkedIn
              </a>
              <a
                className="footer-social-link"
                href="https://www.behance.net/brunoalecrim"
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="footer-social-icon" aria-hidden="true">
                  Bē
                </span>
                Behance
              </a>
              <a
                className="footer-social-link"
                href="https://github.com/brunoces11"
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="footer-social-icon" aria-hidden="true">
                  GH
                </span>
                GitHub
              </a>
            </div>
          </div>
        </div>
        <div className="site-container footer-bottom">
          <span>Creative intelligence, grounded in reality.</span>
          <a className="footer-legal-link" href="/privacy">
            Privacy &amp; Terms
          </a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
