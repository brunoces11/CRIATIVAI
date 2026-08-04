import { SiteHeader } from "../components/SiteHeader";
import { type ReactNode } from "react";

import { ServiceCatalogCard } from "../components/ServiceCatalogCard";
import { serviceCatalog } from "../data/serviceCatalog";
import { openAssistantChat } from "../lib/chatContext";

const steps = [
  {
    welcomeKey: "services/process/initial-ai-briefing/start-ai-briefing-now",
    index: "01",
    title: "Initial AI Briefing",
    text: "With our AI assistant, you describe the initial scope of your idea so we can collect the first briefing and understand the business context.",
    ctaLabel: "Start Ai Briefing Now",
    compactTitle: false,
  },
  {
    welcomeKey: "services/process/planning-call/book-a-call",
    index: "02",
    title: "Planning Call",
    text: "You schedule a call with our AI-assisted process so we can refine the plan, discuss ideas, define priorities, and shape the budget.",
    ctaLabel: "Book a call",
    compactTitle: false,
  },
  {
    welcomeKey: "services/process/design-and-delivery/ask-my-agent",
    index: "03",
    title: "Design & Delivery",
    text: "We start development with key stages shared for your review, including follow-up meetings and iteration rounds until delivery.",
    ctaLabel: "Ask my Agent",
    compactTitle: true,
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

type Step = (typeof steps)[number];

function openProcessCardChat(step: Step) {
  openAssistantChat({ welcomeKey: step.welcomeKey });
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
            {serviceCatalog.map((service) => (
              <ServiceCatalogCard key={service.id} service={service} />
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
                <h3 className={step.compactTitle ? "services-process-card__title--compact" : undefined}>{step.title}</h3>
                <p>{step.text}</p>
                <button className="button services-process-card__cta" type="button" onClick={() => openProcessCardChat(step)}>{step.ctaLabel}</button>
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
            <span className="services-cta-title-strong">
              <span>What idea</span>
              <span className="services-cta-title-strong-line2">do you want</span>
            </span>
            <span className="services-cta-title-accent">to bring to life?</span>
            <span className="services-cta-title-strong">Let&apos;s make it real.</span>
          </h2>
          <p>
            Bring the rough idea, the messy process, or the opportunity you keep postponing. We turn it into a scoped
            plan, a buildable system, and a real delivery path.
          </p>
          <button className="button button--accent" type="button" onClick={() => openAssistantChat({ welcomeKey: "services/global/project-conversation/start-project-conversation" })}>
            Start the Project Conversation <span aria-hidden="true">-&gt;</span>
          </button>
        </div>
      </section>
    </main>
  );
}
