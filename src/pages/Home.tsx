import { SiteHeader } from "../components/SiteHeader";

const groundingTopics = [
  "Custom RAG Setups",
  "Knowledge Graphs | GraphRAG",
  "Prompt Engineering Research",
  "Context Engineering",
  "Enterprise Knowledge Systems",
  "Multi Agent Architecture",
  "ETL, Data Processing",
  "Context Enrichment",
  "Smart Chunk processing",
  "Guard rails | Observability",
];

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
    title: "Product Design + Enterprise Knowledge Systems",
    text: "Human-centered product design connected to enterprise knowledge architecture, giving AI experiences clear interfaces, verified context, and a reliable source of truth.",
    featured: true,
  },
  {
    index: "02",
    title: "Increase Lead Generation + Conversion Rate with AI",
    text: "AI-assisted acquisition systems for lead capture, qualification, nurturing, personalization, and conversion improvements across the customer journey.",
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

export default function Home() {
  return (
    <main id="top">
      <SiteHeader brand={<Brand />} />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span /> Design Ã— Engineering Ã— Strategy</p>
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
                <a className="button button--light" href="/contact">Let&apos;s Talk <span aria-hidden="true">â†—</span></a>
              </div>
            </div>
          </div>

          <div className="hero-portrait-column">
            <div className="portrait-orbit portrait-orbit--outer" aria-hidden="true" />
            <div className="portrait-orbit portrait-orbit--inner" aria-hidden="true" />
            <div className="hero-portrait-frame">
              <img
                src="/bruno-portrait.png"
                alt="Portrait of Bruno wearing round orange-tinted glasses"
                className="hero-portrait"
              />
              <div className="hero-portrait-shade" aria-hidden="true" />
            </div>
          </div>
        </div>
        <a className="scroll-cue" href="#projects" aria-label="Scroll to featured projects">
          <span>Scroll to explore</span><i aria-hidden="true" />
        </a>
      </section>


      <section className="section grounding-section" id="custom-development" aria-labelledby="custom-development-title">
        <div className="grounding-orbit" aria-hidden="true" />
        <div className="site-container grounding-grid grounding-grid--reverse">
          <div className="grounding-panel grounding-panel--image">
            <img
              src="/bruno-cesar-custom-software-development.jpg"
              alt="Custom software development"
              className="grounding-panel-image"
              loading="lazy"
            />
          </div>
          <div className="grounding-copy">
            <h2 id="custom-development-title">Custom Development</h2>
            <h3>Custom software built for your operation, without lock-in or workarounds.</h3>
            <p>
              Stop paying for rigid third-party tools, forced workarounds, and vendor lock-in. Build exactly what your
              operation needs, whether that means an intelligence hub, CRM, ERP, or internal platform, designed to fit
              your workflow, your goals, and the way your business actually runs.
            </p>
          </div>
        </div>
      </section>

      <section className="section grounding-section" id="grounding" aria-labelledby="grounding-title">
        <div className="grounding-orbit" aria-hidden="true" />
        <div className="site-container grounding-grid">
          <div className="grounding-copy">
            <h2 id="grounding-title">Knowledge Grounding</h2>
            <h3>Building AI systems that truly understand your business.</h3>
            <p>
              With the mission of transforming business information into actionable business knowledge, this layer helps
              AI agents answer with precision and predictability inside your project constraints, processing multi-source
              data into a reliable context retrieval system that gives you clear control over what your agents consume
              and consistently improves the quality of their responses.
            </p>
          </div>
          <div className="grounding-panel">
            <div className="grounding-panel-head">
              <span>Enterprise intelligence layer</span>
              <span>10 capabilities</span>
            </div>
            <ul className="topic-list">
              {groundingTopics.map((topic, index) => (
                <li key={topic}><span>{String(index + 1).padStart(2, "0")}</span>{topic}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section grounding-section grounding-section--lead-gen" id="lead-generation" aria-labelledby="lead-generation-title">
        <div className="grounding-orbit grounding-orbit--right" aria-hidden="true" />
        <div className="site-container grounding-grid">
          <div className="grounding-copy">
            <h2 id="lead-generation-title">AI Lead Generation and Convertion Agents</h2>
            <h3>Increase revenue with better qualified leads and smarter conversion.</h3>
            <p>
              Capture relevant leads, qualify them automatically, discover exactly who to connect with, and automate
              outbound actions that expand your conversion potential and drive more revenue.
            </p>
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
              <h2 id="projects-title">Featured Projects</h2>
            </div>
          </div>

          <div className="projects-grid">
            <article className="project-card" id="human-resources">
              <ProjectVisual type="hr" />
              <div className="project-overlay" />
              <div className="project-content">
                <p className="project-index">01 / Automation</p>
                <h3>Inteliggence Dashboard</h3>
                <p>
                  Gain a clearer view of your business with personalized smart dashboards, fully connected to your
                  business knowledge and focused exactly on your precise operational needs.
                </p>
              </div>
              <span className="project-arrow" aria-hidden="true">Ã¢â€ â€”</span>
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
              <span className="project-arrow" aria-hidden="true">Ã¢â€ â€”</span>
            </article>

            <article className="project-card">
              <ProjectVisual type="dante" />
              <div className="project-overlay" />
              <div className="project-content">
                <p className="project-index">03 / Legal AI</p>
                <h3>Dante <span>Legal AI Platform</span></h3>
                <p>
                  An AI solution for the legal industry built with intelligent agents, RAG, GraphRAG, contextual
                  reasoning, and enterprise knowledge systems.
                </p>
              </div>
              <span className="project-arrow" aria-hidden="true">Ã¢â€ â€”</span>
            </article>
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
                  <i aria-hidden="true"><b /></i>
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
              Technology is most valuable when it amplifies human judgmentâ€”not when it gets in the way.
            </p>
            <p>
              Bruno works at the intersection of product design, artificial intelligence, and business strategy.
              His practice combines two decades of creative experience with a systems mindset to turn complex ideas
              into useful, understandable, and carefully crafted digital products.
            </p>
            <div className="expertise-block">
              <p className="micro-label">Areas of expertise</p>
              <ul className="expertise-list">
                {expertise.map((item) => <li key={item}>{item}</li>)}
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
          <h2 id="contact-title">Ready to Build Your Next <span>AI Product?</span></h2>
          <p>
            Let&apos;s create intelligent software that combines design, automation, and business strategy to solve real
            business challenges.
          </p>
          <a className="button button--accent" href="/contact">
            Start a Project <span aria-hidden="true">â†—</span>
          </a>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="site-container footer-grid">
          <div className="footer-brand">
            <a href="#top" aria-label="CriativAI home"><Brand /></a>
            <p>AI-powered products, intelligent automations, and human-centered digital experiences.</p>
            <span className="copyright">Â© {new Date().getFullYear()} CriativAI. All rights reserved.</span>
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
              <a className="footer-social-link" href="https://www.youtube.com/@tutorialmasterbrasil" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">â–¶</span>YouTube</a>
              <a className="footer-social-link" href="https://www.linkedin.com/in/brunoalecrim" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">in</span>LinkedIn</a>
              <a className="footer-social-link" href="https://www.behance.net/brunoalecrim" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">BÄ“</span>Behance</a>
              <a className="footer-social-link" href="https://github.com/brunoces11" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">GH</span>GitHub</a>
            </div>
          </div>
        </div>
        <div className="site-container footer-bottom"><span>Creative intelligence, grounded in reality.</span><a className="footer-legal-link" href="/privacy">Privacy &amp; Terms</a><a href="#top">Back to top â†‘</a></div>
      </footer>
    </main>
  );
}
