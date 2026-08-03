import { type ReactNode } from "react";

import { openAssistantChat } from "../lib/chatContext";
import type { ServiceCatalogItem } from "../data/serviceCatalog";

function openServiceCardChat(service: ServiceCatalogItem, buttonKey: "ask-my-ai-assistant" | "i-want-it") {
  openAssistantChat({ welcomeKey: `services/service-catalog/${service.id}/${buttonKey}` });
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

export function ServiceCatalogCard({ service }: { service: ServiceCatalogItem }) {
  return (
    <article className="services-page-card service-catalog-card" tabIndex={0}>
      <div className="services-page-card-body">
        <span className="services-page-card-index">{service.index}</span>
        <div className="services-page-title-row">
          <ServiceIcon type={service.icon} />
          <h3 className={service.title === "Enterprise Knowledge Systems" ? "services-page-title--compact" : undefined}>{service.title}</h3>
        </div>
        <p>{service.text}</p>
      </div>
      <div className="services-page-card-actions">
        <button type="button" onClick={() => openServiceCardChat(service, "ask-my-ai-assistant")}>Ask my Ai Assistant</button>
        <button type="button" onClick={() => openServiceCardChat(service, "i-want-it")}>I want It</button>
      </div>
    </article>
  );
}
