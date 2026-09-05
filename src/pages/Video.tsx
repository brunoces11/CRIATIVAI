import { type ReactNode, useEffect, useRef, useState } from "react";
import { EditableCta } from "../components/CtaEditorButton";
import { SiteHeader } from "../components/SiteHeader";
import { useTranslation } from "react-i18next";
import { openAssistantChat } from "../lib/chatContext";
import { isAudienceEnabled } from "../lib/audienceVisibility";

const HERO_VIDEO_SRC = "/SQ_1200_15FPS_1kf.mp4";
const HERO_PIN_DISTANCE = 2500;
const HERO_SCRUB_DISTANCE = 2200;
const HERO_VIDEO_FPS = 15;
const HERO_VIDEO_FRAME_DURATION = 1 / HERO_VIDEO_FPS;
const HERO_VIDEO_SEEK_TIMEOUT_MS = 1200;
const HERO_VIDEO_MAX_RECOVERY_ATTEMPTS = 2;
const MEDIA_HAVE_METADATA = 1;
const MEDIA_NETWORK_EMPTY = 0;
const HERO_TOPIC_REVEAL_START = 0.1;
const HERO_TOPIC_REVEAL_STEP = 0.12;
const HERO_TOPIC_REVEAL_SPAN = 0.12;

const groundingTopics = [
  {
    title: "Custom RAG Setups | Knowledge Graphs | GraphRAG",
    description:
      "Connect private knowledge to AI answers with tailored retrieval while mapping relationships, entities, and dependencies so agents keep context grounded across the full knowledge layer.",
  },
  {
    title: "Prompt Engineering Research | Context Engineering",
    description:
      "Design tested prompts and reasoning patterns while controlling the exact information your agents receive before they answer or act, keeping outputs clearer and more predictable.",
  },
  {
    title: "Enterprise Knowledge Systems",
    description:
      "Turn scattered company information into a reliable intelligence layer for people and AI, giving your team a more structured and actionable source of truth.",
  },
  {
    title: "Multi Agent Architecture",
    description:
      "Coordinate specialized agents that plan, retrieve, validate, and execute complex workflows with cleaner orchestration across the full system.",
  },
  {
    title: "ETL, Data Processing | Context Enrichment",
    description:
      "Clean, transform, structure, and enrich multi-source data so it becomes useful AI-ready knowledge with better metadata, relationships, and meaning for retrieval.",
  },
  {
    title: "Smart Chunk Processing",
    description:
      "Split knowledge into precise chunks that preserve meaning, reduce noisy retrieval, and keep your AI responses aligned with the most relevant source material.",
  },
  {
    title: "Guard Rails | Observability",
    description:
      "Monitor, constrain, and improve agent behavior with clearer controls, better visibility, and more reliable operational feedback.",
  },
] as const;

const customDevelopmentTopics = [
  "Intelligence Hubs",
  "Custom CRM Systems",
  "Tailored ERP Operations",
  "High-Conversion Landing Pages",
  "AI-Powered Internal Tools",
  "Custom Workflow Automations",
  "Business-Critical Integrations",
  "Operational Dashboards",
  "Process-Specific UX",
  "No Vendor Lock-In",
];

const services = [
  {
    index: "01",
    icon: "product",
    featured: true,
  },
  {
    index: "02",
    icon: "knowledge",
  },
  {
    index: "03",
    icon: "system",
  },
  {
    index: "04",
    icon: "automation",
  },
  {
    index: "05",
    icon: "agents",
  },
  {
    index: "06",
    icon: "websites",
  },
  {
    index: "07",
    icon: "training",
  },
  {
    index: "08",
    icon: "consulting",
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

function ServiceIcon({ type }: { type: string }) {
  const iconPaths: Record<string, ReactNode> = {
    product: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1.2" />
      </>
    ),
    knowledge: (
      <>
        <path d="M6 5h9a3 3 0 0 1 3 3v11H8a3 3 0 0 1-3-3V5Z" />
        <path d="M8 9h7" />
        <path d="M8 13h5" />
      </>
    ),
    system: (
      <>
        <path d="M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Z" />
        <path d="M12 12 4.8 7.8" />
        <path d="M12 12v8.5" />
        <path d="m12 12 7.2-4.2" />
      </>
    ),
    automation: (
      <>
        <path d="M6 12a6 6 0 0 1 10.2-4.3" />
        <path d="M16 4v4h-4" />
        <path d="M18 12a6 6 0 0 1-10.2 4.3" />
        <path d="M8 20v-4h4" />
      </>
    ),
    agents: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20a7 7 0 0 1 14 0" />
        <path d="M4 9h2" />
        <path d="M18 9h2" />
      </>
    ),
    websites: (
      <>
        <rect x="3.5" y="5" width="17" height="13" rx="2" />
        <path d="M3.5 9h17" />
        <path d="M7 14h5" />
        <path d="M15 14h2" />
      </>
    ),
    training: (
      <>
        <path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" />
        <path d="M7 10v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V10" />
        <path d="M20 8v5" />
      </>
    ),
    consulting: (
      <>
        <path d="M5 17.5 9.5 13l3 3L19 9.5" />
        <path d="M15 9h4v4" />
        <path d="M4 5h8" />
        <path d="M4 9h5" />
      </>
    ),
  };

  return (
    <svg className="service-title-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {iconPaths[type] ?? iconPaths.system}
    </svg>
  );
}

function ProjectVisual({ type }: { type: "hr" | "trading" | "dante" }) {
  const src =
    type === "hr"
      ? "/tub_dashboard_inteligence.png"
      : type === "trading"
        ? "/tub_ai-first-trading-plataform.png"
        : "/tub_dante_ai_legal_system.png";

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
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement | null>(null);
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const heroMediaRef = useRef<HTMLDivElement | null>(null);
  const heroTopicsRef = useRef<HTMLUListElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const durationRef = useRef(0);
  const loopFrameRef = useRef(0);
  const heroMetricsRef = useRef({ top: 0 });
  const pendingVideoTimeRef = useRef<number | null>(null);
  const readyRef = useRef(false);
  const lastVideoTimeRef = useRef<number | null>(null);
  const seekStartedAtRef = useRef<number | null>(null);
  const recoveryAttemptsRef = useRef(0);
  const requestHeroSyncRef = useRef<() => void>(() => undefined);
  const [videoMissing, setVideoMissing] = useState(false);
  const [expandedGroundingTopic, setExpandedGroundingTopic] = useState<{ columnId: string; title: string } | null>(null);

  const toggleGroundingTopic = (columnId: string, topicTitle: string) => {
    setExpandedGroundingTopic((currentTopic) =>
      currentTopic?.columnId === columnId && currentTopic.title === topicTitle ? null : { columnId, title: topicTitle },
    );
  };

  useEffect(() => {
    const measureHero = () => {
      const hero = heroRef.current;
      if (!hero) return;

      const nextTop = hero.getBoundingClientRect().top + window.scrollY;
      if (Math.abs(nextTop - heroMetricsRef.current.top) >= 0.5) {
        heroMetricsRef.current = { top: nextTop };
      }
    };

    const getVideoDuration = (video: HTMLVideoElement) => {
      const duration = durationRef.current || video.duration;
      return Number.isFinite(duration) && duration > 0 ? duration : 0;
    };

    const applyPendingVideoTime = () => {
      const video = videoRef.current;
      const pendingTime = pendingVideoTimeRef.current;
      if (!video || pendingTime === null) return;

      if (video.networkState === MEDIA_NETWORK_EMPTY) {
        video.load();
        return;
      }

      const duration = getVideoDuration(video);
      if (duration <= 0) {
        readyRef.current = false;
        return;
      }

      if (video.readyState < MEDIA_HAVE_METADATA) {
        return;
      }

      if (video.seeking) {
        const seekStartedAt = seekStartedAtRef.current ?? performance.now();
        seekStartedAtRef.current = seekStartedAt;

        if (performance.now() - seekStartedAt > HERO_VIDEO_SEEK_TIMEOUT_MS) {
          lastVideoTimeRef.current = null;
          seekStartedAtRef.current = null;
        }

        return;
      }

      const nextTime = clamp(pendingTime, 0, Math.max(duration - 0.001, 0));
      if (lastVideoTimeRef.current !== null && Math.abs(lastVideoTimeRef.current - nextTime) < HERO_VIDEO_FRAME_DURATION * 0.5) return;
      lastVideoTimeRef.current = nextTime;
      seekStartedAtRef.current = performance.now();

      try {
        if (typeof video.fastSeek === "function") {
          video.fastSeek(nextTime);
        } else {
          video.currentTime = nextTime;
        }
      } catch {
        seekStartedAtRef.current = null;
        // If the browser is temporarily busy seeking, the next animation frame will retry.
      }
    };

    const syncHero = () => {
      const hero = heroRef.current;
      if (!hero) return;

      const heroScroll = window.scrollY - heroMetricsRef.current.top;
      const scrollProgress = clamp(heroScroll / HERO_PIN_DISTANCE, 0, 1);
      const scrubProgress = clamp(heroScroll / HERO_SCRUB_DISTANCE, 0, 1);
      const heroState = heroScroll < 0 ? "before" : heroScroll < HERO_PIN_DISTANCE ? "pinned" : "released";

      if (heroStageRef.current) {
        heroStageRef.current.style.position = heroState === "pinned" ? "fixed" : "absolute";
        heroStageRef.current.style.top = heroState === "released" ? `${HERO_PIN_DISTANCE}px` : "0";
        heroStageRef.current.style.zIndex = heroState === "pinned" ? "1" : "";
      }

      const video = videoRef.current;
      const duration = video ? getVideoDuration(video) : 0;

      if (video) {
        video.preload = "auto";

        if (duration <= 0) {
          applyPendingVideoTime();
        } else if (!readyRef.current) {
          durationRef.current = duration;
          readyRef.current = true;
        }
      }

      if (video && duration > 0) {
        if (!readyRef.current) {
          durationRef.current = duration;
          readyRef.current = true;
        }

        const rawTime = scrubProgress * Math.max(duration - 0.001, 0);
        const nextTime = Math.round(rawTime / HERO_VIDEO_FRAME_DURATION) * HERO_VIDEO_FRAME_DURATION;
        pendingVideoTimeRef.current = nextTime;
        applyPendingVideoTime();
      }

      const textOffset = Math.round(-scrollProgress * 260);
      if (heroCopyRef.current) {
        heroCopyRef.current.style.transform = `translate3d(0, ${textOffset}px, 0)`;
      }

      const topicItems = heroTopicsRef.current?.children;
      if (topicItems) {
        Array.from(topicItems).forEach((item, index) => {
          const start = HERO_TOPIC_REVEAL_START + index * HERO_TOPIC_REVEAL_STEP;
          const topicProgress = clamp((scrollProgress - start) / HERO_TOPIC_REVEAL_SPAN, 0, 1);
          const roundedTopicProgress = Math.round(topicProgress * 100) / 100;
          const offset = Math.round((1 - topicProgress) * 56);
          const element = item as HTMLElement;

          element.style.opacity = `${roundedTopicProgress}`;
          element.style.transform = `translate3d(${offset}px, 0, 0)`;
        });
      }
    };

    const requestMeasuredSync = () => {
      measureHero();
      syncHero();
    };

    requestHeroSyncRef.current = requestMeasuredSync;

    const requestVisibleSync = () => {
      if (document.visibilityState === "hidden") return;
      requestMeasuredSync();
    };

    const video = videoRef.current;
    measureHero();
    syncHero();
    window.addEventListener("resize", requestMeasuredSync);
    window.addEventListener("focus", requestMeasuredSync);
    window.addEventListener("pageshow", requestMeasuredSync);
    document.addEventListener("visibilitychange", requestVisibleSync);
    video?.addEventListener("loadedmetadata", requestMeasuredSync);
    video?.addEventListener("loadeddata", requestMeasuredSync);
    video?.addEventListener("canplay", requestMeasuredSync);
    video?.addEventListener("durationchange", requestMeasuredSync);
    video?.addEventListener("stalled", requestMeasuredSync);
    video?.addEventListener("emptied", requestMeasuredSync);

    const tick = () => {
      syncHero();
      loopFrameRef.current = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener("resize", requestMeasuredSync);
      window.removeEventListener("focus", requestMeasuredSync);
      window.removeEventListener("pageshow", requestMeasuredSync);
      document.removeEventListener("visibilitychange", requestVisibleSync);
      video?.removeEventListener("loadedmetadata", requestMeasuredSync);
      video?.removeEventListener("loadeddata", requestMeasuredSync);
      video?.removeEventListener("canplay", requestMeasuredSync);
      video?.removeEventListener("durationchange", requestMeasuredSync);
      video?.removeEventListener("stalled", requestMeasuredSync);
      video?.removeEventListener("emptied", requestMeasuredSync);
      requestHeroSyncRef.current = () => undefined;
      if (loopFrameRef.current) window.cancelAnimationFrame(loopFrameRef.current);
    };
  }, []);

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    setVideoMissing(false);
    recoveryAttemptsRef.current = 0;
    seekStartedAtRef.current = null;
    durationRef.current = Number.isFinite(video.duration) ? video.duration : 0;
    if (durationRef.current > 0) {
      const pendingTime = pendingVideoTimeRef.current ?? 0.001;
      video.currentTime = clamp(pendingTime, 0, Math.max(durationRef.current - 0.001, 0));
      readyRef.current = true;
      requestHeroSyncRef.current();
    }
  };

  const onCanPlay = () => {
    setVideoMissing(false);
    recoveryAttemptsRef.current = 0;
    seekStartedAtRef.current = null;
    readyRef.current = durationRef.current > 0;
    requestHeroSyncRef.current();
  };

  const onVideoError = () => {
    const video = videoRef.current;

    readyRef.current = false;
    lastVideoTimeRef.current = null;
    seekStartedAtRef.current = null;

    if (video && recoveryAttemptsRef.current < HERO_VIDEO_MAX_RECOVERY_ATTEMPTS) {
      recoveryAttemptsRef.current += 1;
      setVideoMissing(false);
      video.load();
      requestHeroSyncRef.current();
      return;
    }

    setVideoMissing(true);
    if (video) {
      video.pause();
    }
  };

  return (
    <main className="video-page" id="top">
      <SiteHeader brand={<Brand />} page="video" />

      <section className="hero video-hero" aria-labelledby="hero-title" ref={heroRef}>
        <div className="video-hero-stage" ref={heroStageRef}>
        <div className="hero-atmosphere video-hero-atmosphere" aria-hidden="true" />

        <div className="video-hero-media" ref={heroMediaRef} aria-hidden="true">
          <video
            ref={videoRef}
            className={`video-hero-video${videoMissing ? " video-hero-video--hidden" : ""}`}
            src={HERO_VIDEO_SRC}
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={onLoadedMetadata}
            onLoadedData={onCanPlay}
            onCanPlay={onCanPlay}
            onError={onVideoError}
          />
          <div className={`video-hero-placeholder${videoMissing ? " is-visible" : ""}`} />
          <div className="video-hero-overlay" />
        </div>

        <div className="site-container video-hero-inner">
          <div className="hero-copy video-hero-copy" ref={heroCopyRef}>
            <p className="eyebrow hero-eyebrow">
              <span /> {t("video.heroEyebrow")}
            </p>
            <h1 id="hero-title" className="hero-title">
              <span className="hero-line hero-line--one">{t("video.creative")}</span>
              <span className="hero-line hero-line--two">{t("video.aiSolutions")}</span>
            </h1>
            <div className="hero-intro">
              <p>
                {t("home.heroLead")}
              </p>
              <div className="hero-actions">
                <span className="button button--light">
                  {t("home.talk")} <span aria-hidden="true">{"\u2197"}</span>
                </span>
              </div>
            </div>
            <ul className="video-hero-topics" ref={heroTopicsRef} aria-label={t("video.topicsAria")}>
              {[
                t("video.topic1"),
                t("video.topic2"),
                t("video.topic3"),
                t("video.topic4"),
                t("video.topic5"),
                t("video.topic6"),
                t("video.topic7"),
                t("video.topic8"),
              ].map((topic) => (
                <li key={topic}>
                  <span className="video-hero-topic-cube" aria-hidden="true" />
                  <h4>{topic}</h4>
                </li>
              ))}
            </ul>
          </div>
        </div>

          <a className="scroll-cue video-scroll-cue" href="#projects" aria-label={t("video.scrollProjects")}>
              <span>{t("home.scroll")}</span>
            <i aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="video-next-section" aria-labelledby="video-next-title">
        <div className="site-container video-next-section-inner">
          <div className="video-hero-next video-hero-next--section">
            <h2 id="video-next-title" className="hero-title video-hero-next-title">
            </h2>
            <p className="hero-line video-hero-next-line video-hero-next-line--one video-hero-next-welcome video-hero-next-welcome--top">
              {t("video.welcome")}
            </p>
            <p className="hero-line video-hero-next-line video-hero-next-line--one video-hero-next-welcome">
              {t("video.hyper")} <span className="video-hero-next-white">{t("video.personalization")}</span> {t("video.era")}
            </p>
            <p className="video-hero-next-description">
              {t("video.nextLead")}
            </p>
            <div className="hero-actions video-hero-next-actions">
              <EditableCta welcomeKey="video/hyper-personalization-era/next-step/ask-my-ai-assistant-and-book-a-call">
                <button className="button button--accent" type="button" onClick={() => openAssistantChat({ welcomeKey: "video/hyper-personalization-era/next-step/ask-my-ai-assistant-and-book-a-call" })}>
                  {t("video.askBook")} <span aria-hidden="true">-&gt;</span>
                </button>
              </EditableCta>
              <a className="button button--ghost" href="/contact">
                {t("about.dropMessage")} <span aria-hidden="true">-&gt;</span>
              </a>
            </div>
          </div>
        </div>
      </section>


      <section className="section grounding-section" id="custom-development" aria-labelledby="custom-development-title">
        <div className="grounding-orbit" aria-hidden="true" />
        <div className="site-container grounding-grid">
          <div className="grounding-copy">
            <h2 id="custom-development-title">{t("home.customDevelopment")}</h2>
            <h3>{t("home.customLead")}</h3>
            <p>
              {t("home.customText")}
            </p>
            <div className="grounding-actions">
              <a className="button button--accent" href="/contact">{t("home.iWantBuild")}</a>
              <a className="button button--ghost" href="/contact">{t("about.bookCall")}</a>
            </div>
          </div>
          <div className="grounding-panel grounding-panel--image">
            <img
              src="/TUB_BRUNO_CESAR_CUSTOM_DEVELOPMENT.png"
              alt="Custom software development"
              className="grounding-panel-image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="section grounding-section" id="grounding" aria-labelledby="grounding-title">
        <div className="grounding-orbit" aria-hidden="true" />
        <div className="site-container grounding-grid">
          <div className="grounding-copy">
            <h2 id="grounding-title">{t("home.knowledgeGrounding")}</h2>
            <h3>{t("home.groundingLead")}</h3>
            <p>
              {t("home.groundingText")}
            </p>
            <div className="grounding-actions">
              <a className="button button--accent" href="/contact">{t("home.iWantBuild")}</a>
              <a className="button button--ghost" href="/contact">{t("about.bookCall")}</a>
            </div>
          </div>
          <div className="grounding-panel">
            <div className="grounding-panel-head">
                <span>{t("video.enterpriseLayer")}</span>
              <span>{t("video.capabilitiesCount")}</span>
            </div>
            <div className="topic-list" role="list">
              <div className="topic-list-column">
                {groundingTopics.map((topic, index) => {
                  const isExpanded = expandedGroundingTopic?.title === topic.title;
                  const isCompact = Boolean(expandedGroundingTopic) && !isExpanded;
                  const detailId = `grounding-topic-${index}`;

                  return (
                    <div
                      role="listitem"
                      className={`topic-list-item${isExpanded ? " is-expanded" : ""}${isCompact ? " is-compact" : ""}`}
                      key={topic.title}
                    >
                      <button
                        type="button"
                        className="topic-list-button"
                        aria-expanded={isExpanded}
                        aria-controls={detailId}
                        onClick={() => toggleGroundingTopic("single", topic.title)}
                      >
                        <span className="topic-list-toggle" aria-hidden="true" />
                        <span className="topic-list-index">{String(index + 1).padStart(2, "0")}</span>
                        <span className="topic-list-title">{topic.title}</span>
                        <span id={detailId} className="topic-list-detail" hidden={!isExpanded}>
                          {topic.description}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section grounding-section grounding-section--lead-gen" id="lead-generation" aria-labelledby="lead-generation-title">
        <div className="grounding-orbit grounding-orbit--right" aria-hidden="true" />
        <div className="site-container grounding-grid">
          <div className="grounding-copy">
            <h2 id="lead-generation-title">{t("video.leadTitle")}</h2>
            <h3>{t("video.leadSubtitle")}</h3>
            <p>
              {t("video.leadText")}
            </p>
            <div className="grounding-actions">
              <a className="button button--accent" href="/contact">{t("services.iWantIt")}</a>
              <a className="button button--ghost" href="/contact">{t("about.bookCall")}</a>
            </div>
          </div>
          <div className="grounding-panel grounding-panel--image">
            <img
              src="/LEAD_FUNNEL.png"
              alt="Lead generation funnel placeholder"
              className="grounding-panel-image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="section projects-section" id="projects" aria-labelledby="projects-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <h2 id="projects-title">{t("home.projects")}</h2>
            </div>
          </div>

          <div className="projects-grid">
            <article className="project-card" id="human-resources">
              <ProjectVisual type="hr" />
              <div className="project-overlay" />
              <div className="project-content">
                <p className="project-index">01 / {t("video.automation")}</p>
                <h3>{t("video.projectDashboard")}</h3>
                <p>
                  {t("video.projectDashboardText")}
                </p>
              </div>
            </article>

            <article className="project-card">
              <ProjectVisual type="trading" />
              <div className="project-overlay" />
              <div className="project-content">
                <p className="project-index">02 / {t("video.fintech")}</p>
                <h3>{t("video.projectTrading")}</h3>
                <p>
                  {t("video.projectTradingText")}
                </p>
              </div>
            </article>

            <article className="project-card">
              <ProjectVisual type="dante" />
              <div className="project-overlay" />
              <div className="project-content">
                <p className="project-index">03 / {t("video.legalAi")}</p>
                <h3>
                  Dante <span>{t("video.legalAiPlatform")}</span>
                </h3>
                <p>
                  {t("video.projectDanteText")}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section services-section" id="services" aria-labelledby="services-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{t("video.whatWeBuild")}</p>
              <h2 id="services-title">{t("home.services")}</h2>
            </div>
            <p className="section-intro">
              {t("video.servicesLead")}
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article className={`service-card${service.featured ? " service-card--featured" : ""}`} key={service.index}>
                <div className="service-topline">
                  <span>{service.index}</span>
                  <i aria-hidden="true">
                    <b />
                  </i>
                </div>
                <div className="service-title-row">
                  <ServiceIcon type={service.icon} />
                  <h3>{t(`videoServices.${service.index}.title`)}</h3>
                </div>
                <p>{t(`videoServices.${service.index}.text`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta" id="contact" aria-labelledby="contact-title">
        <div className="cta-orbit cta-orbit--one" aria-hidden="true" />
        <div className="cta-orbit cta-orbit--two" aria-hidden="true" />
        <div className="site-container final-cta-inner">
          <p className="eyebrow">{t("home.startConversation")}</p>
          <h2 id="contact-title">
            <span>{t("video.readyToBuild")}</span>
            <span>{t("video.nextAiProduct")}</span>
          </h2>
          <p>
            {t("video.finalLead")}
          </p>
          <a className="button button--accent" href="/contact">
            {t("video.startProject")} <span aria-hidden="true">{"\u2197"}</span>
          </a>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="site-container footer-grid">
          <div className="footer-brand">
            <a href="#top" aria-label="CriativAI home">
              <Brand />
            </a>
            <p>{t("footer.productLead")}</p>
            <span className="copyright">{"\u00A9"} {new Date().getFullYear()} CriativAI. All rights reserved.</span>
          </div>
          <div className="footer-links-grid">
            <div>
              <p className="micro-label">{t("footer.navigation")}</p>
              <a href="#services">{t("header.services")}</a>
              <a href="#projects">{t("footer.projects")}</a>
              {isAudienceEnabled("recruiters") ? <a href="/for-recrutiers">{t("footer.recruiters")}</a> : null}
              <a href="/contact">{t("header.contact")}</a>
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
                  {"\u25B6"}
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
                  BÄ“
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
          <span>{t("footer.bottom")}</span>
          <a className="footer-legal-link" href="/privacy">
            {t("legal.eyebrow")}
          </a>
          <a href="#top">{t("header.backToTop")} {"\u2191"}</a>
        </div>
      </footer>
    </main>
  );
}
