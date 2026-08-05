import { SiteHeader } from "../components/SiteHeader";
import { EditableCta } from "../components/CtaEditorButton";
import { openAssistantChat } from "../lib/chatContext";

const positions = [
  {
    welcomeKey: "hire-me/open-positions/full-time/hire-me-full-time",
    eyebrow: "Employment",
    title: "FULL TIME",
    status: "Negociavel",
    statusTone: "neutral",
    action: "Hire me full time",
    text:
      "For companies that want Bruno fully embedded in the team, leading AI architecture, product thinking, design, and delivery with long-term commitment.",
    detail:
      "Available for fully remote, hybrid, or on-site work anywhere in the world, depending on the scope, seniority, compensation, and strategic fit.",
  },
  {
    welcomeKey: "hire-me/open-positions/dedicated-part-time/reserve-part-time-capacity",
    eyebrow: "Dedicated capacity",
    title: "Dedicated Part Time",
    status: "Open positions 1/3",
    statusTone: "open",
    action: "Reserve part-time capacity",
    text:
      "The strongest cost-benefit model for serious execution: high-quality delivery, dedicated focus, predictable progress, and flexible commitment.",
    detail:
      "Ideal for businesses that need senior AI, product, and engineering capability without the cost of a full-time executive or internal team.",
  },
  {
    welcomeKey: "hire-me/open-positions/project-design/start-a-custom-build",
    eyebrow: "Custom build",
    title: "Project Design",
    status: "Scoped by project",
    statusTone: "neutral",
    action: "Start a custom build",
    text:
      "Hire Bruno on demand for a specific project, with budget, planning, and development organized as a clear custom-build engagement.",
    detail:
      "Best for intelligence hubs, internal platforms, AI agents, CRMs, operational tools, and product experiences that need focused delivery.",
  },
  {
    welcomeKey: "hire-me/open-positions/discovery-consultant-sessions/book-discovery-session",
    eyebrow: "Strategic session",
    title: "Discovery Consultant Sessions",
    status: "Available",
    statusTone: "open",
    action: "Book discovery session",
    text:
      "A focused consulting model for teams that want to define a topic, share the intended scope, and receive a practical AI adoption or build strategy.",
    detail:
      "Bruno researches the path to the target and presents a sharp 1h30 call with strategic direction, practical evaluation, and next-step recommendations.",
  },
  {
    welcomeKey: "hire-me/open-positions/specialized-training/plan-training",
    eyebrow: "Training",
    title: "Specialized Training",
    status: "For teams or individuals",
    statusTone: "neutral",
    action: "Plan training",
    text:
      "Specialized AI, product, prompt engineering, and workflow training for individuals, teams, or companies that want practical capability fast.",
    detail:
      "Sessions can be shaped around your tools, maturity level, business goals, and the exact AI systems or practices your team needs to adopt.",
  },
] as const;

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

export default function HireMePage() {
  return (
    <main className="hire-page" id="top">
      <SiteHeader brand={<Brand />} page="hire-me" />

      <section className="hire-hero" aria-labelledby="hire-title">
        <div className="site-container hire-hero-grid">
          <div>
            <p className="eyebrow">Hire Bruno</p>
            <h1 id="hire-title">Open positions, choose the best for you.</h1>
          </div>
          <p>
            Flexible hiring formats for companies and founders who need senior AI architecture, product design,
            implementation strategy, and hands-on delivery without forcing the work into a generic engagement model.
          </p>
        </div>
      </section>

      <section className="section hire-positions-section" aria-labelledby="hire-positions-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Open positions</p>
              <h2 id="hire-positions-title">Choose the right working model</h2>
            </div>
            <p className="section-intro">
              Each option is designed around a different level of commitment, from full-time leadership to strategic
              consulting, training, and focused custom builds.
            </p>
          </div>

          <div className="hire-position-grid">
            {positions.map((position) => (
              <article className="hire-position-card" key={position.title}>
                <div className="hire-position-topline">
                  <span className="micro-label">{position.eyebrow}</span>
                  <span className={`hire-status hire-status--${position.statusTone}`}>
                    <i aria-hidden="true" />
                    {position.status}
                  </span>
                </div>
                <h3>{position.title}</h3>
                <p>{position.text}</p>
                <p>{position.detail}</p>
                <EditableCta welcomeKey={position.welcomeKey}>
                  <button className="button button--accent" type="button" onClick={() => openAssistantChat({ welcomeKey: position.welcomeKey })}>
                    {position.action} <span aria-hidden="true">-&gt;</span>
                  </button>
                </EditableCta>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
