export const serviceCatalog = [
  {
    id: "product-design",
    index: "01",
    icon: "product",
  },
  {
    id: "refined-websites",
    index: "02",
    icon: "websites",
  },
  {
    id: "custom-software",
    index: "03",
    icon: "software",
  },
  {
    id: "ai-client-acquisition",
    index: "04",
    icon: "acquisition",
  },
  {
    id: "ai-customer-service",
    index: "05",
    icon: "support",
  },
  {
    id: "ai-automations",
    index: "06",
    icon: "automation",
  },
  {
    id: "smart-ai-agents",
    index: "07",
    icon: "agents",
  },
  {
    id: "enterprise-knowledge-systems",
    index: "08",
    icon: "knowledge",
  },
  {
    id: "enterprise-consulting",
    index: "09",
    icon: "consulting",
  },
  {
    id: "ai-training",
    index: "10",
    icon: "training",
  },
] as const;

export type ServiceCatalogItem = (typeof serviceCatalog)[number];
