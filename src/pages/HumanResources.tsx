import { SiteHeader } from "../components/SiteHeader";

const pillars = [
  {
    id: "recruitment-intelligence",
    number: "01",
    title: "Recruitment Intelligence",
    intro:
      "Turn hours of manual research into a recruitment process shaped around your own methodology, criteria, and critical roles.",
    items: [
      "Search for professionals across multiple public and specialized sources.",
      "Pre-qualify and rank professionals by level of fit.",
      "Create evidence-based shortlists ready for recruiter review.",
      "Build custom qualification tests for specific roles and skills.",
      "Run standardized assessments at scale using your own evaluation criteria.",
      "Create personalized outreach messages and screening questions.",
    ],
  },
  {
    id: "digital-operations",
    number: "02",
    title: "Digital Operations",
    intro:
      "Replace fragmented tools and repetitive workflows with systems designed around your operation.",
    items: [
      "Automate repetitive administrative and operational processes.",
      "Deploy AI agents to support recruiters, clients, and candidates.",
      "Build custom management systems for your workflows and business rules.",
      "Create dashboards to monitor roles, talent, teams, and performance.",
      "Develop custom tools for specific operational challenges.",
      "Integrate ATS, CRM, spreadsheets, forms, and calendars.",
    ],
  },
  {
    id: "business-discovery",
    number: "03",
    title: "Business Discovery & Outbound",
    intro:
      "Find the right companies, reach the right people, and turn market research into new business opportunities.",
    items: [
      "Discover and qualify companies by market, industry, and potential.",
      "Identify relevant decision-makers and professional contacts.",
      "Enrich leads with verified data, context, and sources.",
      "Create personalized messages based on real business evidence.",
      "Automate campaigns, follow-ups, and sales tracking.",
      "Deploy AI SDR agents to engage and qualify leads.",
      "Integrate calendars for direct meeting scheduling.",
    ],
  },
] as const;

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <span className="brand-monogram" aria-hidden="true">CA</span>
      <span className="brand-name">CRIATIV<span className="brand-name-accent">AI</span></span>
    </span>
  );
}

function HrFooter() {
  return (
    <footer className="footer" id="footer">
      <div className="site-container footer-grid">
        <div className="footer-brand">
          <a href="#top" aria-label="CriativAI Human Resources home"><Brand /></a>
          <p>AI systems for recruitment companies that want more precision, more capacity, and more control.</p>
          <span className="copyright">Â© {new Date().getFullYear()} CriativAI. All rights reserved.</span>
        </div>
        <div className="footer-links-grid">
          <div>
            <p className="micro-label">Navigation</p>
            <a href="#overview">Overview</a>
            <a href="#recruitment-intelligence">Recruitment intelligence</a>
            <a href="#digital-operations">Digital operations</a>
            <a href="#business-discovery">Business discovery</a>
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
      <div className="site-container footer-bottom"><span>Recruitment intelligence, with human control.</span><a className="footer-legal-link" href="/privacy">Privacy &amp; Terms</a><a href="#top">Back to top â†‘</a></div>
    </footer>
  );
}

export default function HumanResourcesPage() {
  return (
    <main className="hr-page" id="top">
      <SiteHeader brand={<Brand />} page="human-resources" />

      <section className="hr-hero" aria-labelledby="hr-hero-title">
        <div className="hr-hero-glow" aria-hidden="true" />
        <div className="site-container hr-hero-grid">
          <div className="hr-hero-copy">
            <p className="eyebrow"><span /> AI for recruitment companies</p>
            <h1 id="hr-hero-title">
              Find talent, streamline operations, and win new clients with AI
              <span> built around your company.</span>
            </h1>
            <p className="hr-hero-lead">
              Your methods. Your criteria. Your tools.
            </p>
            <p className="hr-hero-detail">
              We design AI workflows, assessments, dashboards, and management systems around the way your recruitment company already works.
            </p>
            <div className="hero-actions">
              <a className="button button--accent" href="mailto:hello@criativai.com?subject=Request%20a%20Recruitment%20Demo">
                Request a Demo <span aria-hidden="true">â†—</span>
              </a>
              <a className="hr-text-link" href="#overview">
                Explore the overview <span aria-hidden="true">â†“</span>
              </a>
            </div>
          </div>

          <div className="hr-console" aria-label="Illustration of AI opportunities for recruitment companies">
            <div className="hr-console-head"><span>AI / RECRUITMENT</span><i>CUSTOM</i></div>
            <div className="hr-console-criteria"><span>Three strategic areas</span><strong>Talent · Operations · Business growth</strong></div>
            {[
              { name: "Recruitment Intelligence", note: "Search, qualify, shortlist" },
              { name: "Digital Operations", note: "Systems, dashboards, agents" },
              { name: "Business Discovery", note: "Leads, outreach, meetings" },
            ].map((item) => (
              <div className="hr-candidate" key={item.name}>
                <span className="hr-avatar" />
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.note}</small>
                </div>
                <b>AI</b>
              </div>
            ))}
            <div className="hr-console-footer"><span>MACRO VIEW</span><strong>Adapted to your process</strong></div>
          </div>
        </div>
      </section>

      <section className="section hr-value-section" id="overview" aria-labelledby="value-title">
        <div className="site-container hr-value-grid">
          <div>
            <p className="eyebrow">The era of hyper-personalization</p>
            <h2 id="value-title">
              AI now enables recruitment companies to design fully customized workflows,
              <span> assessments, dashboards, and management systems.</span>
            </h2>
          </div>
          <div className="hr-value-copy">
            <p>
              This is no longer about a one-size-fits-all tool. It is about building precise systems around your methodology,
              business rules, and operating reality.
            </p>
            <strong>What matters is not generic automation. What matters is a stack that fits your company.</strong>
          </div>
        </div>
      </section>

      {pillars.map((pillar) => (
        <section className="section hr-workflow-section" id={pillar.id} aria-labelledby={`${pillar.id}-title`} key={pillar.id}>
          <div className="site-container">
            <div className="hr-section-head">
              <p className="eyebrow">{pillar.number}</p>
              <h2 id={`${pillar.id}-title`}>{pillar.title}</h2>
              <p className="section-intro">{pillar.intro}</p>
            </div>
            <div className="hr-benefits-grid">
              {pillar.items.map((item) => (
                <article key={item}>
                  <i aria-hidden="true" />
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="final-cta hr-final-cta" aria-labelledby="demo-title">
        <div className="cta-orbit cta-orbit--one" aria-hidden="true" />
        <div className="cta-orbit cta-orbit--two" aria-hidden="true" />
        <div className="site-container final-cta-inner">
          <p className="eyebrow">A broader, more strategic view</p>
          <h2 id="demo-title">
            Build the recruitment company <span>you want to run.</span>
          </h2>
          <p>
            From talent intelligence to operations and outbound growth, we can shape AI around the way your team actually works.
          </p>
          <div className="hero-actions">
            <a className="button button--accent" href="mailto:hello@criativai.com?subject=Request%20a%20Recruitment%20Demo">
              Request a Demo <span aria-hidden="true">â†—</span>
            </a>
            <a className="hr-text-link" href="mailto:hello@criativai.com?subject=Talk%20about%20AI%20for%20Recruitment">
              Talk about your use case <span aria-hidden="true">â†—</span>
            </a>
          </div>
        </div>
      </section>

      <HrFooter />
    </main>
  );
}
