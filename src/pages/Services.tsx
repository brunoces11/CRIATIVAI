import { type ReactNode } from "react";
import { SiteHeader } from "../components/SiteHeader";

const services = [
  {
    index: "01",
    title: "Product Design",
    text: "Human-centered digital product and UI/UX design focused on usability, accessibility, conversion, and exceptional user experiences.",
    icon: "product",
  },
  {
    index: "02",
    title: "Refined Websites",
    text: "Fast, accessible, refined websites for large-scale corporate platforms or simple landing pages built to convert, with clean infrastructure, continuous deployment, and code your team can own.",
    icon: "websites",
  },
  {
    index: "03",
    title: "Custom Software",
    text: "Purpose-built software shaped around your workflows, users, data, and operational constraints, combining AI-assisted architecture, development, testing, deployment, and optimized delivery across the full build process.",
    icon: "software",
  },
  {
    index: "04",
    title: "AI Client Acquisition",
    text: "AI-assisted acquisition flows that qualify leads, capture context, personalize follow-ups, and help turn visitor intent into real commercial opportunities.",
    icon: "acquisition",
  },
  {
    index: "05",
    title: "AI Customer Service",
    text: "AI customer service agents that respond instantly, assemble requests inside the conversation, route orders or tickets to operations, and keep customers updated automatically.",
    icon: "support",
  },
  {
    index: "06",
    title: "AI Automations",
    text: "AI-powered business process automation that eliminates repetitive tasks, connects tools and approvals, and increases operational efficiency.",
    icon: "automation",
  },
  {
    index: "07",
    title: "Smart AI Agents",
    text: "Custom AI agents capable of reasoning, using multiple tools, retrieving knowledge, and executing complex business processes autonomously.",
    icon: "agents",
  },
  {
    index: "08",
    title: "Enterprise Knowledge Systems",
    text: "Enterprise knowledge architecture that gives AI agents a single source of truth through knowledge lakes, custom RAG setups, GraphRAG, process context, and traceable business data relationships.",
    icon: "knowledge",
  },
  {
    index: "09",
    title: "Enterprise Consulting",
    text: "Specialized AI consulting to identify opportunities, define implementation paths, and bring practical AI capabilities into the organization.",
    icon: "consulting",
  },
  {
    index: "10",
    title: "AI Training",
    text: "Tailored AI training programs designed around your team's tools, workflows, maturity level, and business priorities.",
    icon: "training",
  },
] as const;

const steps = [
  {
    index: "01",
    title: "Initial AI Briefing",
    text: "With our AI assistant, you describe the initial scope of your idea so we can collect the first briefing and understand the business context.",
  },
  {
    index: "02",
    title: "Planning Call",
    text: "You schedule a call with our AI-assisted process so we can refine the plan, discuss ideas, define priorities, and shape the budget.",
  },
  {
    index: "03",
    title: "Development & Delivery",
    text: "We start development with key stages shared for your review, including follow-up meetings and iteration rounds until delivery.",
  },
] as const;

const faqs: Array<{ question: string; answer: ReactNode }> = [
  {
    question: "Where can our projects be hosted?",
    answer: (
      <p>
        The infrastructure is fully adaptable. Projects can be deployed on cloud platforms, dedicated servers, the
        client&apos;s own infrastructure, or another environment required by the project.
      </p>
    ),
  },
  {
    question: "What does your delivery include?",
    answer: (
      <p>
        Our work can cover the entire process, from the initial idea to development, deployment, and ongoing
        maintenance. We can also adapt the delivery model to the client&apos;s specific structure and requirements.
      </p>
    ),
  },
  {
    question: "How does the development process work?",
    answer: (
      <>
        <p>The process is divided into three simple stages:</p>
        <ol>
          <li>The client completes an initial briefing with our AI agent.</li>
          <li>We schedule a call to align requirements, details, scope, and budget.</li>
          <li>We develop, deliver, and deploy the solution.</li>
        </ol>
      </>
    ),
  },
  {
    question: "Can you integrate the project with our existing systems?",
    answer: (
      <p>
        Yes. We can integrate solutions through APIs, MCP, webhooks, databases, third-party platforms, or other formats
        required by the client&apos;s infrastructure.
      </p>
    ),
  },
  {
    question: "How does communication work across different time zones?",
    answer: (
      <p>
        We are fully aligned with American time zones and friendly to European schedules. We normally recommend meetings
        during the European afternoon, but extended or 24-hour availability can be discussed for specific projects.
      </p>
    ),
  },
  {
    question: "Do you provide support after delivery?",
    answer: (
      <p>
        Yes. Support requirements are defined according to each project&apos;s complexity and operational needs. Regular
        support can be provided through a monthly maintenance plan.
      </p>
    ),
  },
  {
    question: "How do you ensure application security?",
    answer: (
      <p>
        Projects go through technical testing and specialized security reviews, following established market practices
        for architecture, access control, credentials, integrations, dependencies, and data protection.
      </p>
    ),
  },
  {
    question: "Why hire your agency instead of a European agency?",
    answer: (
      <p>
        We combine quality, efficient delivery, integrated services, and a more accessible operational structure. This
        allows us to deliver high-value solutions with a favorable balance between expertise, quality, and cost,
        supported by the multidisciplinary experience of our founder.
      </p>
    ),
  },
  {
    question: "Does a more competitive price mean lower quality?",
    answer: (
      <p>
        No. Quality, engineering, and security come first. Our pricing is more competitive because we use AI efficiently
        to optimize research, development, testing, and documentation while preserving human oversight, functionality,
        and professional standards.
      </p>
    ),
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
    acquisition: (
      <>
        <path d="M4 18V6" />
        <path d="M4 18h16" />
        <path d="m7 15 4-4 3 3 5-7" />
        <path d="M15 7h4v4" />
      </>
    ),
    support: (
      <>
        <path d="M5 12a7 7 0 0 1 14 0v3a3 3 0 0 1-3 3h-2" />
        <path d="M5 12v3a2 2 0 0 0 2 2h1v-6H7a2 2 0 0 0-2 1Z" />
        <path d="M19 12v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 1Z" />
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
    software: (
      <>
        <path d="m8 9-4 3 4 3" />
        <path d="m16 9 4 3-4 3" />
        <path d="m14 5-4 14" />
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

export default function ServicesPage() {
  return (
    <main className="services-page" id="top">
      <SiteHeader brand={<Brand />} page="services" />

      <section className="services-page-hero" aria-labelledby="services-page-title">
        <div className="site-container services-page-hero-grid">
          <div>
            <p className="eyebrow">What we build</p>
            <h1 id="services-page-title">
              AI services for products, operations, and growth.
            </h1>
            <p>
              A unified service portfolio connecting refined product design, custom software, enterprise knowledge,
              AI agents, automation, and customer-facing AI experiences.
            </p>
          </div>
          <div className="services-page-hero-visual" aria-hidden="true">
            <img
              src="/criativai_ai_services.png"
              alt=""
              className="services-page-hero-image"
            />
          </div>
        </div>
      </section>

      <section className="section services-page-list" aria-labelledby="services-list-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Services</p>
              <h2 id="services-list-title">A single AI delivery stack</h2>
            </div>
            <p className="section-intro">
              Each service can stand alone, but the strongest projects combine strategy, interface quality,
              automation, and grounded intelligence into one coherent system.
            </p>
          </div>

          <div className="services-page-grid">
            {services.map((service) => (
              <article className="services-page-card" key={service.title}>
                <div className="services-page-card-body">
                  <div className="services-page-title-row">
                    <ServiceIcon type={service.icon} />
                    <h3 className={service.title === "Enterprise Knowledge Systems" ? "services-page-title--compact" : undefined}>{service.title}</h3>
                  </div>
                  <p>{service.text}</p>
                </div>
                <div className="services-page-card-actions">
                  <button type="button" onClick={openAssistantChat}>Ask AI</button>
                  <button type="button" onClick={openAssistantChat}>I want It</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section services-process-section" aria-labelledby="services-process-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">From idea to delivery</p>
              <h2 id="services-process-title">Three practical steps</h2>
            </div>
            <p className="section-intro">
              A lean process to move from initial idea to a scoped, reviewable, and deliverable project.
            </p>
          </div>

          <div className="services-process-grid">
            {steps.map((step) => (
              <article className="services-process-card" key={step.title}>
                <span>{step.index}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section services-faq-section" aria-labelledby="services-faq-title">
        <div className="site-container services-faq-inner">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 id="services-faq-title">Frequently Asked Questions</h2>
            </div>
          </div>

          <div className="services-faq-list">
            {faqs.map((faq, index) => (
              <details className="services-faq-item" key={faq.question} name="services-faq">
                <summary>
                  <h4>{faq.question}</h4>
                  <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
                </summary>
                <div className="services-faq-answer">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta services-page-cta" aria-labelledby="services-cta-title">
        <div className="cta-orbit cta-orbit--one" aria-hidden="true" />
        <div className="cta-orbit cta-orbit--two" aria-hidden="true" />
        <div className="site-container final-cta-inner">
          <p className="eyebrow">Start building</p>
          <h2 id="services-cta-title">
            <span className="services-cta-title-strong">What idea do you want</span>
            <span className="services-cta-title-accent">to bring to life?</span>
            <span className="services-cta-title-strong">Let&apos;s make it real.</span>
          </h2>
          <p>
            Bring the rough idea, the messy process, or the opportunity you keep postponing. We turn it into a scoped
            plan, a buildable system, and a real delivery path.
          </p>
          <button className="button button--accent" type="button" onClick={openAssistantChat}>
            Start the Project Conversation <span aria-hidden="true">-&gt;</span>
          </button>
        </div>
      </section>
    </main>
  );
}
