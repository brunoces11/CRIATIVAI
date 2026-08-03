export const serviceCatalog = [
  {
    id: "product-design",
    index: "01",
    title: "Product Design",
    text: "Human-centered digital product and UI/UX design focused on usability, accessibility, conversion, and exceptional user experiences.",
    icon: "product",
  },
  {
    id: "refined-websites",
    index: "02",
    title: "Refined Websites",
    text: "Fast, accessible, refined websites for large-scale corporate platforms or simple landing pages built to convert, with clean infrastructure, continuous deployment, and code your team can own.",
    icon: "websites",
  },
  {
    id: "custom-software",
    index: "03",
    title: "Custom Software",
    text: "Purpose-built software shaped around your workflows, users, data, and operational constraints, combining AI-assisted architecture, development, testing, deployment, and optimized delivery across the full build process.",
    icon: "software",
  },
  {
    id: "ai-client-acquisition",
    index: "04",
    title: "AI Client Acquisition",
    text: "AI-assisted acquisition flows that qualify leads, capture context, personalize follow-ups, and help turn visitor intent into real commercial opportunities.",
    icon: "acquisition",
  },
  {
    id: "ai-customer-service",
    index: "05",
    title: "AI Customer Service",
    text: "AI customer service agents that respond instantly, assemble requests inside the conversation, route orders or tickets to operations, and keep customers updated automatically.",
    icon: "support",
  },
  {
    id: "ai-automations",
    index: "06",
    title: "AI Automations",
    text: "AI-powered business process automation that eliminates repetitive tasks, connects tools and approvals, and increases operational efficiency.",
    icon: "automation",
  },
  {
    id: "smart-ai-agents",
    index: "07",
    title: "Smart AI Agents",
    text: "Custom AI agents capable of reasoning, using multiple tools, retrieving knowledge, and executing complex business processes autonomously.",
    icon: "agents",
  },
  {
    id: "enterprise-knowledge-systems",
    index: "08",
    title: "Enterprise Knowledge Systems",
    text: "Enterprise knowledge architecture that gives AI agents a single source of truth through knowledge lakes, custom RAG setups, GraphRAG, process context, and traceable business data relationships.",
    icon: "knowledge",
  },
  {
    id: "enterprise-consulting",
    index: "09",
    title: "Enterprise Consulting",
    text: "Specialized AI consulting to identify opportunities, define implementation paths, and bring practical AI capabilities into the organization.",
    icon: "consulting",
  },
  {
    id: "ai-training",
    index: "10",
    title: "AI Training",
    text: "Tailored AI training programs designed around your team's tools, workflows, maturity level, and business priorities.",
    icon: "training",
  },
] as const;

export type ServiceCatalogItem = (typeof serviceCatalog)[number];
