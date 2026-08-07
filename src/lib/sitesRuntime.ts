export const isSitesFrontendOnly = import.meta.env.VITE_SITES_FRONTEND_ONLY === "1";

const FALLBACK_EMAIL = "hello@criativai.com";

type MailtoOptions = {
  subject: string;
  lines?: Array<string | null | undefined | false>;
};

function joinLines(lines: Array<string | null | undefined | false>) {
  return lines.filter((line): line is string => typeof line === "string" && line.length > 0).join("\n");
}

export function buildMailtoHref({ subject, lines = [] }: MailtoOptions) {
  const params = new URLSearchParams({ subject });
  const body = joinLines(lines);

  if (body) {
    params.set("body", body);
  }

  return `mailto:${FALLBACK_EMAIL}?${params.toString().replace(/\+/g, "%20")}`;
}

export function openMailtoFallback(options: MailtoOptions) {
  window.location.href = buildMailtoHref(options);
}

export function openAssistantFallback() {
  openMailtoFallback({
    subject: "CriativAI project inquiry",
    lines: [
      "Hi Bruno,",
      "",
      "I came from the public CriativAI test site and would like to discuss a project.",
      "",
      "Project context:",
      "-",
      "",
      "Best,",
    ],
  });
}
