import { SiteHeader } from "../components/SiteHeader";
import { useTranslation } from "react-i18next";

function Brand() { return <span className="brand-lockup" aria-label="CriativAI"><img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" /></span>; }

type Build = {
  image: string;
  title: string;
  description: string;
  stack: string[];
  repo?: string;
};

const builds: Build[] = [
  {
    image: "criativai_skill_full_deploy_bruno_cesar_context_prompt_engineer.jpg",
    title: "Skill Full Deploy",
    description: "A portable skill for automating application deployments across static sites and multi-dependency projects through a deterministic, validated release flow.",
    stack: ["Docker", "Traefik", "Candidate validation", "Health checks", "Rollback flow"],
    repo: "https://github.com/brunoces11/Full-Deploy",
  },
  {
    image: "criativai_skill_target_mode_bruno_cesar_context_prompt_engineer.jpg",
    title: "Skill Target Mode",
    description: "A precision editing workflow that lets users point directly at interface elements so agentic systems can apply changes to the intended targets.",
    stack: ["IDE-compatible skill", "Single selection", "Multi-selection", "Clipboard capture", "Precise target data"],
    repo: "https://github.com/brunoces11/Target-Mode",
  },
  {
    image: "criativai_pffset_print_ai__bruno_cesar_context_prompt_engineer.jpg",
    title: "Offset Print AI",
    description: "An AI-assisted graphics platform for creating editable, print-ready assets with precise physical dimensions and PDF export.",
    stack: ["Next.js", "React", "TypeScript", "OpenAI API", "SQLite", "Playwright", "Vitest"],
    repo: "https://github.com/brunoces11/print_ai/tree/master",
  },
  {
    image: "criativai_tldraw_turbo_bruno_cesar_context_prompt_engineer.jpg",
    title: "TLDraw Turbo",
    description: "A customized drawing and presentation environment built on TLDraw, with richer presentation control, multi-page management, and advanced styling.",
    stack: ["TLDraw foundation", "Presentation mode", "Multi-page management", "Text and line styling", "Custom UI/UX"],
    repo: "https://github.com/brunoces11/tldraw-turbo",
  },
  {
    image: "criativai_social_media_viral_videos_scraper_bruno_cesar_context_prompt_engineer.jpg",
    title: "Viral Video Scraper",
    description: "An AI-powered content intelligence pipeline for social data extraction, video processing, transcription, script generation, and TTS automation.",
    stack: ["Next.js"],
    repo: "https://github.com/brunoces11/social_scraper",
  },
  {
    image: "criativai_batch_AI_video_generator_bruno_cesar_context_prompt_engineer.jpg",
    title: "Batch Ai Video Generator",
    description: "A controlled video production workflow that turns prompts and optional reference images into sequential, scalable video generations.",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Supabase", "Gemini / Veo API"],
    repo: "https://github.com/brunoces11/batch_video_generator",
  },
  {
    image: "criativai_AI_NEWS_REPLICATOR__bruno_cesar_context_prompt_engineer.jpg",
    title: "News AI Replicator",
    description: "An automation system that receives selected news through RSS and repurposes it into posts following a personalized writing style.",
    stack: [],
  },
  {
    image: "criativai_weavy_photo_studio_bruno_cesar_context_prompt_engineer.jpg",
    title: "Weavy Photo Studio",
    description: "An AI photographic studio for precise character creation, with granular control over the image in one click.",
    stack: [],
  },
  {
    image: "criativai_robloger_from_idea_to_post_in_one_click_bruno_cesar_context_prompt_engineer.jpg",
    title: "Roblogger",
    description: "Roblogger turns a simple idea into a complete blog post in one click, generating the copy and supporting images before publishing it automatically to a blog or website.",
    stack: [],
  },
  {
    image: "criativai_metagraph_chunking_bruno_cesar_context_prompt_engineer.jpg",
    title: "MetaGraph Chunking",
    description: "A structured semantic preprocessing technique that creates coherent, enriched, hierarchy-aware chunks for more precise RAG retrieval.",
    stack: ["Ontology-based structuring", "GraphRAG-inspired relations", "Semantic enrichment", "Zero-overlap chunking", "Multi-provider LLM support"],
    repo: "https://github.com/brunoces11/MetaGraph",
  },
] as const;

export default function LabPage() {
  const { t } = useTranslation();
  return (
    <main className="lab-page" id="top">
      <SiteHeader brand={<Brand />} page="lab" />
      <header className="lab-hero">
        <div className="site-container">
          <p className="eyebrow">LAB</p>
          <h1 className="lab-hero__title">LAB | Builds</h1>
          <h2 className="lab-content__title">{t("lab.subtitle")}</h2>
        </div>
      </header>
      <article className="lab-content site-container">
        <div className="lab-grid">
          {builds.map(({ image, title, description, stack, repo }) => (
            <article className="lab-card" key={title}>
              <img src={`/${image}`} alt="" loading="lazy" />
              <h3>{title}</h3>
              <p>{description}</p>
              {stack.length > 0 && (
                <ul className="lab-card__stack" aria-label={`${title} technology stack`}>
                  {stack.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {repo && <a className="lab-card__repo" href={repo} target="_blank" rel="noreferrer noopener">View repository <span aria-hidden="true">↗</span></a>}
            </article>
          ))}
        </div>
        <div className="lab-contact">
          <a className="button button--accent" href="/contact">{t("lab.contact")}</a>
        </div>
      </article>
    </main>
  );
}
