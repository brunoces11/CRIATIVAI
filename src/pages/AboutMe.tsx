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
      "ETL",
      "AI-Assisted Development",
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

      <section className="section about-me-features-section" aria-labelledby="about-me-features-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Capabilities</p>
              <h2 id="about-me-features-title">What Bruno Builds</h2>
            </div>
            <p className="section-intro">
              A hybrid practice that connects AI systems, product experience, and implementation details into one
              coherent product direction.
            </p>
          </div>

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
      </section>

      <section className="section about-me-awards-section" aria-labelledby="about-me-awards-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Awards</p>
              <h2 id="about-me-awards-title">Prompt Engineering</h2>
            </div>
            <p className="section-intro">
              International recognition across prompt engineering competitions, agent design, prompt-app concepts,
              and built-in ChatGPT game experiences.
            </p>
          </div>

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
