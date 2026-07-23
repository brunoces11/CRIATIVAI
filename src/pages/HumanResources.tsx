import { SiteHeader } from "../components/SiteHeader";

const workflow = [
  ["01", "Job Requirement Structuring", "We translate each brief into mandatory requirements, preferred qualifications, exclusion criteria, and priority competencies."],
  ["02", "Search Strategy", "Equivalent titles, relevant keywords, target companies, related competencies, and candidate sources are mapped before the search begins."],
  ["03", "Multi-Source Research", "Profiles are identified across authorized public sources, consolidated, and organized in one research environment."],
  ["04", "Candidate Fit Analysis", "Every profile receives an explainable assessment of strengths, gaps, unconfirmed information, and supporting evidence."],
  ["05", "Shortlist and Reports", "Recruiters receive a prioritized shortlist with individual reports, validation questions, and personalized outreach messages."],
];

const included = [
  "Structured job-requirement intake form", "Role requirement interpretation and organization", "Automated search strategy generation", "Research across authorized public sources", "Profile consolidation and duplicate removal", "Candidate classification by level of fit", "Supporting evidence for every classification", "Gaps and missing-information identification", "Prioritized shortlist for human review", "Individual candidate reports", "Personalized outreach messages", "Recommended interview questions", "Structured spreadsheet and executive report delivery",
];

const benefits = [
  ["Time savings", "Automate research, information organization, initial analysis, and report production."],
  ["Greater speed", "Respond to new assignments faster and present qualified candidates before competitors."],
  ["Improved accuracy", "Compare every professional against predefined criteria supported by verifiable evidence."],
  ["More capacity", "Allow every recruiter to manage more assignments without growing the team proportionally."],
  ["Consistent process", "Apply the same research, evaluation, and documentation standard to every assignment."],
  ["Human control", "No candidate is automatically approved or rejected. Your team makes every final decision."],
];

const audiences = ["Executive search firms", "Specialized recruitment consultancies", "Independent headhunters", "Boutique recruitment agencies", "Technology and AI talent specialists", "C-level and strategic role recruiters", "International talent research teams"];

const customizations = ["Integrate with your ATS, CRM, or talent database", "Monitor candidate movements and enrich existing profiles", "Generate reports in your company standard", "Create personalized messages in multiple languages", "Update clients on the progress of each search", "Prepare materials for meetings and interviews", "Organize recruiter and hiring-manager feedback", "Automate recurring administrative tasks", "Create workflows by industry, position, or country"];

function Brand() {
  return <span className="brand-lockup" aria-label="CriativAI"><span className="brand-monogram" aria-hidden="true">CA</span><span className="brand-name">CRIATIVAI</span></span>;
}

function HrFooter() {
  return (
    <footer className="footer" id="footer">
      <div className="site-container footer-grid">
        <div className="footer-brand">
          <a href="#top" aria-label="CriativAI Human Resources home"><Brand /></a>
          <p>Intelligent systems for research, organization, and more reliable recruiting decisions.</p>
          <span className="copyright">© {new Date().getFullYear()} CriativAI. All rights reserved.</span>
        </div>
        <div className="footer-links-grid">
          <div>
            <p className="micro-label">Navigation</p>
            <a href="#how-it-works">How it works</a><a href="#included">What&apos;s included</a><a href="#custom">Custom automations</a><a href="/contact">Contact</a>
          </div>
          <div>
            <p className="micro-label">Social Media</p>
            <span className="footer-social-link"><span className="footer-social-icon" aria-hidden="true">▶</span>YouTube</span>
            <span className="footer-social-link"><span className="footer-social-icon" aria-hidden="true">in</span>LinkedIn</span>
            <span className="footer-social-link"><span className="footer-social-icon" aria-hidden="true">Bē</span>Behance</span>
            <span className="footer-social-link"><span className="footer-social-icon" aria-hidden="true">GH</span>GitHub</span>
          </div>
        </div>
      </div>
      <div className="site-container footer-bottom"><span>Recruitment intelligence, with human control.</span><a href="#top">Back to top ↑</a></div>
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
            <p className="eyebrow"><span /> Executive search intelligence</p>
            <h1 id="hr-hero-title">Find the right professionals <span>faster.</span></h1>
            <p className="hr-hero-lead">Intelligent automation for executive recruitment firms specializing in leaders, executives, and Artificial Intelligence professionals.</p>
            <p className="hr-hero-detail">Transform job requirements into a structured search, identify candidates across multiple sources, and deliver a documented shortlist ready for recruiter validation and outreach.</p>
            <div className="hero-actions">
              <a className="button button--accent" href="mailto:hello@criativai.com?subject=Request%20a%20Recruitment%20Demo">Request a Demo <span aria-hidden="true">↗</span></a>
              <a className="hr-text-link" href="#how-it-works">See How It Works <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="hr-console" aria-label="Illustration of a recruiter-approved candidate shortlist">
            <div className="hr-console-head"><span>SEARCH / VP AI PRODUCT</span><i>LIVE</i></div>
            <div className="hr-console-criteria"><span>Required criteria</span><strong>Leadership · AI Strategy · Product</strong></div>
            {[{ name: "Avery S.", score: "94", note: "Strong match" }, { name: "Jordan M.", score: "87", note: "Review source" }, { name: "Morgan K.", score: "82", note: "Validate scope" }].map((candidate) => (
              <div className="hr-candidate" key={candidate.name}><span className="hr-avatar" /><div><strong>{candidate.name}</strong><small>{candidate.note}</small></div><b>{candidate.score}</b></div>
            ))}
            <div className="hr-console-footer"><span>SHORTLIST READY</span><strong>Recruiter review required</strong></div>
          </div>
        </div>
      </section>

      <section className="section hr-value-section" aria-labelledby="value-title">
        <div className="site-container hr-value-grid">
          <div><p className="eyebrow">The advantage</p><h2 id="value-title">More efficient research. <span>More confidence in every decision.</span></h2></div>
          <div className="hr-value-copy"><p>Finding executives and highly specialized professionals requires extensive research, careful analysis, and many hours of manual work.</p><p>Our system automates the most repetitive stages, so your team can focus on relationships with candidates, clients, and decision-makers.</p><strong>AI researches, organizes, and recommends. Recruiters review, validate, and decide.</strong></div>
        </div>
      </section>

      <section className="section hr-workflow-section" id="how-it-works" aria-labelledby="workflow-title">
        <div className="site-container"><div className="hr-section-head"><p className="eyebrow">How it works</p><h2 id="workflow-title">From a job brief to a <span>qualified shortlist.</span></h2></div><div className="hr-workflow-grid">{workflow.map(([number, title, text]) => <article className="hr-workflow-card" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div>
      </section>

      <section className="section hr-included-section" id="included" aria-labelledby="included-title">
        <div className="site-container hr-included-grid"><div className="hr-included-copy"><p className="eyebrow">What&apos;s included</p><h2 id="included-title">A streamlined package, designed to create results <span>quickly.</span></h2><p>Everything needed to turn a complex executive search into a documented, review-ready process.</p></div><ol className="hr-included-list">{included.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol></div>
      </section>

      <section className="section hr-benefits-section" aria-labelledby="benefits-title"><div className="site-container"><div className="hr-section-head"><p className="eyebrow">Benefits &amp; ROI</p><h2 id="benefits-title">Reduce operational work without <span>compromising quality.</span></h2></div><div className="hr-benefits-grid">{benefits.map(([title, text]) => <article key={title}><i aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section className="section hr-reliability-section" aria-labelledby="reliability-title"><div className="site-container hr-reliability-grid"><div><p className="eyebrow">Transparency &amp; reliability</p><h2 id="reliability-title">Artificial Intelligence with <span>human oversight.</span></h2><p>The system delivers more than a generic candidate score. Each recommendation can be reviewed before it ever reaches a client or candidate.</p></div><div className="hr-evidence-panel"><p className="micro-label">Every recommendation includes</p>{["Criteria used in the assessment", "Evidence supporting the recommendation", "Sources consulted", "Areas of strong alignment", "Potential limitations", "Information that requires confirmation"].map((item) => <div key={item}><span>✓</span>{item}</div>)}<strong>Explainable by default</strong></div></div></section>

      <section className="section hr-audience-section" aria-labelledby="audience-title"><div className="site-container hr-audience-grid"><div><p className="eyebrow">Designed for specialized recruitment</p><h2 id="audience-title">Built for teams that place <span>high-impact talent.</span></h2></div><ul>{audiences.map((audience) => <li key={audience}>{audience}<span aria-hidden="true">↗</span></li>)}</ul></div></section>

      <section className="section hr-custom-section" id="custom" aria-labelledby="custom-title"><div className="site-container hr-custom-grid"><div className="hr-custom-copy"><p className="eyebrow">Custom agent automations</p><h2 id="custom-title">Your recruitment process stays <span>yours.</span></h2><p>Beyond the entry package, we build agents and automations around your company&apos;s processes and operational needs.</p><a className="button button--light" href="mailto:hello@criativai.com?subject=Custom%20Recruitment%20Automation">Discuss a Custom Automation <span aria-hidden="true">↗</span></a></div><ul>{customizations.map((item) => <li key={item}>{item}</li>)}</ul></div></section>

      <section className="section hr-implementation-section" aria-labelledby="implementation-title"><div className="site-container"><div className="hr-section-head"><p className="eyebrow">Implementation</p><h2 id="implementation-title">Start simple. Expand with <span>evidence.</span></h2></div><ol className="hr-implementation-list">{["Analyze your current recruitment workflow", "Configure criteria and delivery formats", "Run a pilot assignment", "Validate the results with your team", "Refine the process and expand gradually"].map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol><p className="hr-implementation-note">There is no need to replace your current tools or rebuild your entire operation at once.</p></div></section>

      <section className="final-cta hr-final-cta" id="demo" aria-labelledby="demo-title"><div className="cta-orbit cta-orbit--one" aria-hidden="true" /><div className="cta-orbit cta-orbit--two" aria-hidden="true" /><div className="site-container final-cta-inner"><p className="eyebrow">Executive search, accelerated</p><h2 id="demo-title">Less time researching. <span>More time recruiting.</span></h2><p>Accelerate the identification of executives and AI specialists, increase operational capacity, and deliver more consistent shortlists to clients.</p><div className="hero-actions"><a className="button button--accent" href="mailto:hello@criativai.com?subject=Request%20a%20Recruitment%20Demo">Request a Demo <span aria-hidden="true">↗</span></a><a className="hr-text-link" href="mailto:hello@criativai.com?subject=Pilot%20Assignment">Start a Pilot Assignment <span aria-hidden="true">↗</span></a></div></div></section>
      <HrFooter />
    </main>
  );
}
