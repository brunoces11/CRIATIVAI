import { useState } from "react";

import { SiteHeader } from "../components/SiteHeader";

type Award = {
  result: string;
  category: string;
  image: string;
  grayscaleImage: string;
  title: string;
  description: string;
  resultsUrl?: string;
  projectUrl: string;
};

type Experience = {
  company: string;
  companyMark: string;
  role: string;
  period: string;
  location: string;
  workMode?: string;
  description?: string;
  skills: readonly string[];
};

const featureColumns = [
  {
    title: "AI Architecture",
    items: [
      "DevOps",
      "Custom RAG setup",
      "GraphRAG",
      "Context Prompt Engineering",
      "Knowledge Systems",
      "Smart AI Agents",
    ],
  },
  {
    title: "UI/UX Product Design",
    items: [
      "Design System",
      "Web Design",
      "Content Automation",
      "Product Vision",
      "Branding",
      "Human-Centered AI",
    ],
  },
  {
    title: "AI Engineering",
    items: [
      "Frontend Design",
      "Backend Development",
      "ETL, Data Processing, Custom RAGs | GraphRAG",
      "Supabase, Postgres, Mongo, Big data",
      "Python, Next.js, React",
      "API / MCP Integration",
    ],
  },
] as const;

const stats = [
  { value: "20+", label: "Years of Experience" },
  { value: "50+", label: "Interactive Projects Delivered" },
  { value: "150K+", label: "Followers Across Social Platforms" },
  {
    value: "5+",
    label: "International Prompt Engineering Hackathon Awards",
  },
] as const;

const productCycle = [
  {
    index: "01",
    title: "Ideation",
    text: "I can join from the earliest idea stage, helping clarify requirements, collect the briefing, and turn loose goals into a practical product direction.",
  },
  {
    index: "02",
    title: "Planning",
    text: "A simple, effective onboarding process: you define the objective, I help expand the vision, then we shape the right plan for your business.",
  },
  {
    index: "03",
    title: "Design",
    text: "More than 20 years of product design experience, strengthened by AI, from the Macromedia Flash era to refined React web applications focused on great user experience.",
  },
  {
    index: "04",
    title: "Agentic Development",
    text: "From harness to production system. I do not reinvent the wheel; I use AI intelligently to build reliable, efficient systems with strong delivery and accessible cost.",
  },
  {
    index: "05",
    title: "Delivery",
    text: "Infrastructure and deployment adapted to the project, from corporate environments to your own server, with availability and reliability aligned with serious production standards.",
  },
] as const;

const professionalExperience: Experience[] = [
  {
    company: "DANTE IA",
    companyMark: "DI",
    role: "CTO | AI Architect",
    period: "Apr 2025 - Present",
    location: "Blumenau, Santa Catarina, Brazil",
    workMode: "Hybrid | Part-time",
    skills: ["SSH", "Ontologies", "AI Architecture", "Knowledge Systems"],
  },
  {
    company: "DANTE IA",
    companyMark: "DI",
    role: "Prompt Engineer | UX Designer",
    period: "Oct 2024 - Apr 2025",
    location: "Brazil",
    workMode: "Remote | Part-time",
    skills: ["UX Design", "Front-end Design", "Prompt Engineering", "Product Design"],
  },
  {
    company: "EcoFactor",
    companyMark: "EF",
    role: "Team Lead | Prompt Engineer",
    period: "Mar 2024 - Mar 2025",
    location: "Brazil",
    workMode: "Remote | Part-time",
    description:
      "Led the development team across the full AI platform lifecycle and designed the architecture of an intelligent manufacturing system focused on industrial optimization, ESG compliance, and sustainable product research.",
    skills: ["Context Prompt Engineering", "Ontologies", "AI Platform Architecture"],
  },
  {
    company: "Prompt-Master.org",
    companyMark: "PM",
    role: "Creative Prompt Engineer",
    period: "Jan 2023 - Present",
    location: "Rio de Janeiro, Brazil",
    workMode: "Remote | Part-time",
    skills: ["Design Thinking", "Prompt Engineering Research", "Context Engineering"],
  },
  {
    company: "TutorialMaster.org",
    companyMark: "TM",
    role: "Owner | Founder | Instructor",
    period: "Jan 2013 - 2020",
    location: "Vidigal, Rio de Janeiro, Brazil",
    workMode: "Part-time",
    description:
      "Founded a technology, creativity, and design-thinking education community that, together with its YouTube channel, reached more than 150,000 followers and students.",
    skills: ["UX Design", "Design Thinking", "Creative Education", "Digital Content"],
  },
  {
    company: "CA Comunicacao",
    companyMark: "CA",
    role: "Senior Art Director",
    period: "Jan 2009 - Dec 2012",
    location: "Brazil",
    description:
      "Led creative work for clients including Chevrolet, TIM, Unimed, Vale, Sebrae, and the State Government, while directing special projects for interactive media and promotional websites.",
    skills: ["Art Direction", "Interactive Media", "Product Launches"],
  },
  {
    company: "Instituto Infnet",
    companyMark: "II",
    role: "Professor of Computer Graphics and UI/UX Design",
    period: "Jan 2007 - Dec 2008",
    location: "Rio de Janeiro, Brazil",
    description:
      "Taught computer graphics and design at Rio de Janeiro's first authorized Adobe training center, strengthening expertise in teaching methodology, communication, and Adobe creative software.",
    skills: ["UI/UX Design", "Computer Graphics", "Teaching", "Adobe Software"],
  },
  {
    company: "Copacabana Brasil",
    companyMark: "CB",
    role: "Art Director",
    period: "Oct 2005 - Aug 2007",
    location: "Rio de Janeiro, Brazil",
    description:
      "Managed strategic accounts, creative direction, remote client support, and internal production, building deep experience in advertising operations and production workflows.",
    skills: ["UX Design", "GUI Design", "Creative Management", "Production"],
  },
  {
    company: "Comunique-se S/A",
    companyMark: "CS",
    role: "UI / UX / Web Designer",
    period: "Jan 2004 - Jul 2005",
    location: "Brazil",
    description:
      "Planned user experiences and new digital products for a large communications portal, creating online press rooms, email campaigns, advertising, and institutional materials.",
    skills: ["UX Design", "GUI Design", "Web Design", "Digital Products"],
  },
  {
    company: "Visiva Comunicacao Visual",
    companyMark: "VC",
    role: "Graphic Designer",
    period: "Aug 2001 - Apr 2003",
    location: "Rio de Janeiro, Brazil",
    description:
      "Created visual identities, stationery, annual reports, and institutional print systems for organizations including Petrobras, Vale, and Fundacao Getulio Vargas.",
    skills: ["Graphic Design", "Visual Identity", "Editorial Design", "Print Production"],
  },
  {
    company: "IDS - Interactive Design System",
    companyMark: "IDS",
    role: "Multimedia Designer | UI/UX Designer",
    period: "Jan 1998 - Dec 2000",
    location: "Rio de Janeiro, Brazil",
    description:
      "Began a career in interactive design at one of Brazil's pioneering multimedia companies, learning the usability principles that continue to guide every product today.",
    skills: ["UX Design", "GUI Design", "Multimedia", "Usability"],
  },
];

const awards: Award[] = [
  {
    result: "1st place at Chipp.ai",
    category: "Prompt Engineer Hackathon",
    image: "/CPT_TUB_AGENTOS.jpg",
    grayscaleImage: "/PB_CPT_TUB_AGENTOS.jpg",
    title: "AgentOS, Multi-Tasking AI Agent",
    description:
      "AgentOS is a personalized multi-tasking AI agent designed to execute multiple internal and external functions from a single prompt input.",
    resultsUrl: "https://chipp.substack.com/p/chipp-hackathon-winners-showcase",
    projectUrl: "https://agentos-12981.chipp.ai/",
  },
  {
    result: "1st place at FlowGPT",
    category: "Original Prompt Engineering Technique",
    image: "/CPT_TUB.jpg",
    grayscaleImage: "/PB_CPT_TUB.jpg",
    title: "Concatenated Prompt Technique",
    description:
      "An advanced prompt engineering method that lets ChatGPT run multiple prompt layers in a single input, expanding complex interactions into prompt-app experiences.",
    resultsUrl: "https://flowgpt.com/bounty/s3-original-prompt-techniques",
    projectUrl: "https://flowgpt.com/p/cpt-concatenated-prompt-technique-4",
  },
  {
    result: "2nd place at FlowGPT Hackathon S3",
    category: "Prompt Engineer, Judge Category",
    image: "/TUB_JUDGEN.jpg",
    grayscaleImage: "/PB_TUB_JUDGEN.jpg",
    title: "AI Judgen",
    description:
      "A prompt evaluation agent that grades creativity, clarity, precision, originality, syntax consistency, logical structure, and improvement opportunities.",
    resultsUrl: "https://flowgpt.com/bounty/s3-chatgpt-judge",
    projectUrl: "https://flowgpt.com/p/judgen-ai-1",
  },
  {
    result: "1st place at FlowGPT Prompt Battle",
    category: "Past and Future",
    image: "/TIME_TUB2.jpg",
    grayscaleImage: "/PB_TIME_TUB2.jpg",
    title: "Track to the Future",
    description:
      "An innovative built-in ChatGPT game about quantum travel, hidden life secrets, and speculative scenarios for humanity's future.",
    resultsUrl: "https://flowgpt.com/bounty/past-and-future",
    projectUrl: "https://flowgpt.com/p/track-to-the-future-game-1",
  },
  {
    result: "3rd place at FlowGPT Hackathon S2",
    category: "Creative Category",
    image: "/GPTINDER_Brazil.jpg",
    grayscaleImage: "/PB_GPTINDER_Brazil.jpg",
    title: "GPTinder",
    description:
      "A creative dating advisor prompt that generates personalized conversation lines and topics for dating apps based on user and match context.",
    resultsUrl: "https://flowgpt.com/bounty/hMydz_Vg7yIIoRQ8wK1y-",
    projectUrl: "https://flowgpt.com/p/gptinder-your-turbocharged-dating-advisor-16",
  },
  {
    result: "3rd place at FlowGPT Hackathon S2",
    category: "Software Development",
    image: "/TUB_ICON_v2.jpg",
    grayscaleImage: "/PB_TUB_ICON_v2.jpg",
    title: "ICON Machine",
    description:
      "A Unicode icon discovery tool for ChatGPT that finds related icons, official names, and deployment-ready icon tables from any reference.",
    resultsUrl: "https://flowgpt.com/bounty/xa_9CI5A41wMta9FTyTET",
    projectUrl: "https://flowgpt.com/p/icon-machine-is-everything-you-need-to-deal-with-icons-4-any-application-2",
  },
  {
    result: "Finalist at FlowGPT Prompt Battle",
    category: "Innovative Built-In ChatGPT Game",
    image: "/MINECRAFT_MASHUP_CHATGPT_GAME.jpg",
    grayscaleImage: "/PB_MINECRAFT_MASHUP_CHATGPT_GAME.jpg",
    title: "Minecraft Mashup Game",
    description:
      "A ChatGPT game experience built around an epic journey beyond The End, hidden messages, iconic game characters, and a mystery-driven adventure.",
    resultsUrl: "https://flowgpt.com/bounty/promptBattle0724",
    projectUrl: "https://flowgpt.com/p/nM8rkh83STfc2UIE4E9xj",
  },
  {
    result: "Finalist at FlowGPT Prompt Battle",
    category: "Innovative ChatGPT Built-In Game",
    image: "/SHERLOCK_TUB.jpg",
    grayscaleImage: "/PB_SHERLOCK_TUB.jpg",
    title: "Sherlock Hoax",
    description:
      "A themed investigation game with expert characters designed to explore complex theories from multiple perspectives inside a conversational experience.",
    projectUrl: "https://flowgpt.com/p/sherlock-hoax-game",
  },
];

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

function openAssistantChat() {
  window.dispatchEvent(new Event("criativai:open-chat"));
}

export default function AboutMePage() {
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  const toggleAccordion = (accordionId: string) => {
    setOpenAccordionId((currentId) => currentId === accordionId ? null : accordionId);
  };

  return (
    <main className="about-me-page" id="top">
      <SiteHeader brand={<Brand />} page="about-me" />

      <section className="about-me-hero" aria-labelledby="about-me-title">
        <div className="site-container about-me-hero-grid">
          <div className="about-me-hero-copy">
            <h1 id="about-me-title">
              GenAI Architect <span className="about-me-title-subline">Context Prompt Engineer</span>
            </h1>
            <p className="about-me-hero-role">with Creative Design Background</p>
            <p className="about-me-hero-lead">
              Bruno works at the intersection of product design, artificial intelligence, and business strategy.
              His practice combines two decades of creative experience with a systems mindset to turn complex ideas
              into useful, understandable, and carefully crafted digital products.
            </p>
            <div className="hero-actions about-me-actions">
              <button className="button button--accent" type="button" onClick={openAssistantChat}>
                Ask My AI Assistant and Book a Call <span aria-hidden="true">-&gt;</span>
              </button>
              <a className="button button--ghost" href="/contact">
                Drop Me a Message <span aria-hidden="true">-&gt;</span>
              </a>
            </div>
          </div>

          <div className="about-me-portrait-column">
            <div className="about-me-portrait-card">
              <img
                src="/Bruno_cesar_ai_architect_edge.png"
                alt="Bruno Cesar, GenAI Architect and Context Prompt Engineer"
                className="about-me-portrait"
              />
              <span className="about-me-portrait-name">BRUNO CESAR</span>
              <div className="about-me-portrait-meta">
                <strong>AI Architecture / Design / Strategy</strong>
              </div>
            </div>
            <nav className="about-me-social-links" aria-label="Bruno Cesar social links">
              <a href="https://www.youtube.com/@tutorialmasterbrasil" target="_blank" rel="noreferrer noopener" aria-label="YouTube" title="YouTube">YT</a>
              <a href="https://www.linkedin.com/in/brunoalecrim" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" title="LinkedIn">in</a>
              <a href="https://www.behance.net/brunoalecrim" target="_blank" rel="noreferrer noopener" aria-label="Behance" title="Behance">Be</a>
              <a href="https://github.com/brunoces11" target="_blank" rel="noreferrer noopener" aria-label="GitHub" title="GitHub">GH</a>
            </nav>
          </div>
        </div>
      </section>

      <section className="stats-section about-me-stats-section" id="experience" aria-label="Experience and key numbers">
        <div className="site-container stats-grid">
          {stats.map((stat) => (
            <article className="stat" key={stat.value}>
              <strong className="stat-value">{stat.value}</strong>
              <p>{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section about-me-product-cycle-section" aria-labelledby="about-me-product-cycle-title">
        <div className="site-container">
          <div className="about-me-product-cycle-heading">
            <p className="eyebrow">Full Product Cycle</p>
            <h2 id="about-me-product-cycle-title">
              <span className="about-me-product-cycle-line about-me-product-cycle-line--primary">One Professional,</span>
              <span className="about-me-product-cycle-line about-me-product-cycle-line--secondary">Full Product Cycle</span>
            </h2>
            <p>AI, design, and engineering combined into one brain.</p>
          </div>

          <div className="about-me-product-cycle-grid">
            {productCycle.map((item) => (
              <article className="about-me-product-cycle-card" key={item.title}>
                <span>{item.index}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-me-features-section" aria-labelledby="about-me-features-title">
        <div className="site-container">
          <div className="about-me-awards-accordion">
            <article className={`about-me-awards-accordion-item${openAccordionId === "features" ? " is-open" : ""}`}>
              <h2 className="sr-only" id="about-me-features-title">Capabilities What Bruno Builds</h2>
              <button
                type="button"
                className="section-heading section-heading--split about-me-awards-heading"
                aria-expanded={openAccordionId === "features"}
                aria-controls="about-me-features-panel"
                onClick={() => toggleAccordion("features")}
              >
                <div className="about-me-awards-heading-copy">
                  <p className="eyebrow">Tech Stack</p>
                  <h3 className="about-me-awards-heading-title">Capabilities</h3>
                </div>
                <div className="about-me-awards-heading-side">
                  <p className="section-intro about-me-awards-intro">
                    From deep creative AI background to solid technical knowledge of GenAI and related technologies.
                  </p>
                </div>
                <span className="about-me-awards-chevron-wrap" aria-hidden="true">
                  <span className="about-me-awards-hover-label">Click to view details</span>
                  <span className="about-me-awards-chevron">
                    <span />
                    <span />
                  </span>
                </span>
              </button>

              <div
                id="about-me-features-panel"
                className="about-me-awards-panel"
                hidden={openAccordionId !== "features"}
              >
                <div className="about-me-feature-grid">
                  {featureColumns.map((column) => (
                    <article className="about-me-feature-card" key={column.title}>
                      <h3>{column.title}</h3>
                      <ul>
                        {column.items.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section about-me-awards-section" aria-labelledby="about-me-awards-title">
        <div className="site-container">
          <div className="about-me-awards-accordion">
            <article className={`about-me-awards-accordion-item${openAccordionId === "awards" ? " is-open" : ""}`}>
              <h2 className="sr-only" id="about-me-awards-title">Awards Prompt Engineering</h2>
              <button
                type="button"
                className="section-heading section-heading--split about-me-awards-heading"
                aria-expanded={openAccordionId === "awards"}
                aria-controls="about-me-awards-panel"
                onClick={() => toggleAccordion("awards")}
              >
                <div className="about-me-awards-heading-copy">
                  <p className="eyebrow">Awards</p>
                  <h3 className="about-me-awards-heading-title">Prompt Engineering</h3>
                </div>
                <div className="about-me-awards-heading-side">
                  <p className="section-intro about-me-awards-intro">
                    International recognition in prompt engineering, agent design, prompt-app concepts, and built-in
                    ChatGPT games.
                  </p>
                </div>
                <span className="about-me-awards-chevron-wrap" aria-hidden="true">
                  <span className="about-me-awards-hover-label">Click to view details</span>
                  <span className="about-me-awards-chevron">
                    <span />
                    <span />
                  </span>
                </span>
              </button>

              <div
                id="about-me-awards-panel"
                className="about-me-awards-panel"
                hidden={openAccordionId !== "awards"}
              >
                <div className="about-me-awards-grid">
                  {awards.map((award) => (
                    <article className="about-me-award-card" key={`${award.result}-${award.title}`}>
                      <div className="about-me-award-image-wrap">
                        <img src={award.grayscaleImage} alt="" className="about-me-award-image about-me-award-image--gray" loading="lazy" />
                        <img src={award.image} alt="" className="about-me-award-image about-me-award-image--color" loading="lazy" />
                      </div>
                      <div className="about-me-award-content">
                        <p className="about-me-award-result">{award.result}</p>
                        <p className="about-me-award-category">{award.category}</p>
                        <h3>{award.title}</h3>
                        <p>{award.description}</p>
                        <div className="about-me-award-links">
                          {award.resultsUrl ? (
                            <a href={award.resultsUrl} target="_blank" rel="noreferrer noopener">
                              Results Page <span aria-hidden="true">-&gt;</span>
                            </a>
                          ) : null}
                          <a href={award.projectUrl} target="_blank" rel="noreferrer noopener">
                            Open Project <span aria-hidden="true">-&gt;</span>
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section about-me-experience-section" aria-labelledby="about-me-experience-title">
        <div className="site-container">
          <div className="about-me-awards-accordion">
            <article className={`about-me-awards-accordion-item${openAccordionId === "experience" ? " is-open" : ""}`}>
              <h2 className="sr-only" id="about-me-experience-title">Professional Experience</h2>
              <button
                type="button"
                className="section-heading section-heading--split about-me-awards-heading"
                aria-expanded={openAccordionId === "experience"}
                aria-controls="about-me-experience-panel"
                onClick={() => toggleAccordion("experience")}
              >
                <div className="about-me-awards-heading-copy">
                  <p className="eyebrow">Professional</p>
                  <h3 className="about-me-awards-heading-title">Experience</h3>
                </div>
                <div className="about-me-awards-heading-side">
                  <p className="section-intro about-me-awards-intro">
                    20+ years building interactive systems, from a deep creative design background to modern AI
                    development.
                  </p>
                </div>
                <span className="about-me-awards-chevron-wrap" aria-hidden="true">
                  <span className="about-me-awards-hover-label">Click to view details</span>
                  <span className="about-me-awards-chevron">
                    <span />
                    <span />
                  </span>
                </span>
              </button>

              <div
                id="about-me-experience-panel"
                className="about-me-awards-panel about-me-experience-panel"
                hidden={openAccordionId !== "experience"}
              >
                <div className="about-me-timeline">
                  {professionalExperience.map((experience) => (
                    <article
                      className="about-me-timeline-item"
                      key={`${experience.company}-${experience.role}-${experience.period}`}
                    >
                      <div className="about-me-timeline-card">
                        <div className="about-me-timeline-card-header">
                          <span className="about-me-timeline-company-mark" aria-hidden="true">
                            {experience.companyMark}
                          </span>
                          <div>
                            <p className="about-me-timeline-company">{experience.company}</p>
                            <h3>{experience.role}</h3>
                          </div>
                        </div>
                        <p className="about-me-timeline-period">{experience.period}</p>
                        <p className="about-me-timeline-location">
                          {experience.location}{experience.workMode ? ` | ${experience.workMode}` : ""}
                        </p>
                        {experience.description ? <p className="about-me-timeline-description">{experience.description}</p> : null}
                        <ul className="about-me-timeline-skills" aria-label={`Key skills at ${experience.company}`}>
                          {experience.skills.map((skill) => <li key={skill}>{skill}</li>)}
                        </ul>
                      </div>
                      <span className="about-me-timeline-marker" aria-hidden="true" />
                    </article>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="final-cta about-me-final-cta" aria-labelledby="about-me-cta-title">
        <div className="cta-orbit cta-orbit--one" aria-hidden="true" />
        <div className="cta-orbit cta-orbit--two" aria-hidden="true" />
        <div className="site-container final-cta-inner">
          <p className="eyebrow">BUILD WITH CONFIDENCE</p>
          <h2 id="about-me-cta-title">
            Technology is most valuable when it amplifies human capabilities
          </h2>
          <p>
            Let's build amazing things together. Send a message through the form or ask the AI assistant about ideas,
            availability, and the best next step for your project.
          </p>
          <div className="hero-actions about-me-cta-actions">
            <button className="button button--accent" type="button" onClick={openAssistantChat}>
              Ask My AI Assistant and Book a Call <span aria-hidden="true">-&gt;</span>
            </button>
            <a className="button button--ghost" href="/contact">
              Contact Bruno <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="site-container footer-grid">
          <div className="footer-brand">
            <a href="#top" aria-label="CriativAI About Me home"><Brand /></a>
            <p>AI-powered products, intelligent automations, and human-centered digital experiences.</p>
            <span className="copyright">&copy; {new Date().getFullYear()} CriativAI. All rights reserved.</span>
          </div>
          <div className="footer-links-grid">
            <div>
              <p className="micro-label">Navigation</p>
              <a href="/#services">Services</a>
              <a href="/#projects">Projects</a>
              <a href="/about-me">About Me</a>
              <a href="/contact">Contact</a>
            </div>
            <div>
              <p className="micro-label">Social Media</p>
              <a className="footer-social-link" href="https://www.youtube.com/@tutorialmasterbrasil" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">YT</span>YouTube</a>
              <a className="footer-social-link" href="https://www.linkedin.com/in/brunoalecrim" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">in</span>LinkedIn</a>
              <a className="footer-social-link" href="https://www.behance.net/brunoalecrim" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">Be</span>Behance</a>
              <a className="footer-social-link" href="https://github.com/brunoces11" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">GH</span>GitHub</a>
            </div>
          </div>
        </div>
        <div className="site-container footer-bottom"><span>Creative intelligence, grounded in reality.</span><a className="footer-legal-link" href="/privacy">Privacy &amp; Terms</a><a href="#top">Back to top</a></div>
      </footer>
    </main>
  );
}
