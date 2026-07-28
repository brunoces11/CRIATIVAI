import { SiteHeader } from "../components/SiteHeader";

const services = [
  {
    index: "01",
    title: "UI/UX Design",
    text: "Human-centered digital product design focused on usability, accessibility, and exceptional user experiences.",
  },
  {
    index: "02",
    title: "Enterprise Knowledge System",
    text: "Centralized enterprise knowledge architecture that gives AI agents a single source of truth, improves answer quality, reduces hallucinations, and keeps business context consistent across systems.",
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
  {
    index: "06",
    title: "AI-Powered Client Acquisition",
    text: "AI-assisted acquisition flows that qualify leads, capture context, personalize follow-ups, and help turn visitor intent into real commercial opportunities.",
  },
  {
    index: "07",
    title: "AI-Powered Customer Service",
    text: "AI customer service agents that respond instantly, assemble requests inside the conversation, route orders or tickets to operations, and keep customers updated automatically.",
  },
  {
    index: "08",
    title: "Refined Websites",
    text: "Fast, accessible, refined websites for large-scale corporate platforms or simple landing pages built to convert, with clean infrastructure, continuous deployment, and code your team can own.",
  },
  {
    index: "09",
    title: "Corporate Knowledge Systems",
    text: "AI systems grounded in verified business knowledge through knowledge lakes, custom RAG setups, GraphRAG, process context, and traceable data relationships.",
  },
  {
    index: "10",
    title: "Custom Software",
    text: "Purpose-built software shaped around your workflows, users, data, and operational constraints instead of forcing the business into generic tools.",
  },
  {
    index: "11",
    title: "Business Process Automation",
    text: "Automation for repetitive business processes, connecting tools, data, approvals, and AI decision support into reliable operational flows.",
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
          </div>
          <p>
            A unified service portfolio connecting refined product design, custom software, enterprise knowledge,
            AI agents, automation, and customer-facing AI experiences.
          </p>
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
                <span className="services-page-card-index">{service.index}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
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

      <section className="final-cta services-page-cta" aria-labelledby="services-cta-title">
        <div className="cta-orbit cta-orbit--one" aria-hidden="true" />
        <div className="cta-orbit cta-orbit--two" aria-hidden="true" />
        <div className="site-container final-cta-inner">
          <p className="eyebrow">Start the conversation</p>
          <h2 id="services-cta-title">
            <span>Talk to our AI assistant</span>
            <span>and shape your next project.</span>
          </h2>
          <p>
            Share your idea, clarify the initial scope, and schedule a call so we can define the best path forward.
          </p>
          <button className="button button--accent" type="button" onClick={openAssistantChat}>
            Start with the AI Assistant <span aria-hidden="true">-&gt;</span>
          </button>
        </div>
      </section>
    </main>
  );
}
