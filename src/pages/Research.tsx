import { SiteHeader } from "../components/SiteHeader";
import { useState } from "react";

const topics = [
  ["⚙️ [CPT] Concatenated Prompt Technique ⚙️", "It is a new and promising prompt engineering technique with the groundbreaking capability to enable ChatGPT to handle and process multiple prompts with different instructions simultaneously, in a single prompt input. The Concatenated Prompt Technique (CPT) streamlines interaction with AI by merging complex commands, enhancing efficiency, reducing API calls, and cutting down on development costs."],
  ["🎯 UX Prompt Design", "This concept leverages ChatGPT from a simple and limited text environment into a richer, more immersive experience. Advanced markdown with precise output instructions enables creative professionals to craft refined chat experiences."],
  ["▶️ PromptApp Concept", "A \"PromptApp\" is a new class of applications created solely through prompts to run within the ChatGPT environment, treating ChatGPT as both the platform and interpreter for these apps."],
  ["🧩 Metagraph Chunk", "Metagraph Chunk is a semantic enrichment method designed to make each chunk more meaningful before it reaches the retrieval stage. During preprocessing, the source content is analyzed to identify relevant structural and contextual information, such as hierarchy, entity relationships, related concepts, scope, and agent instructions, and this information is embedded directly into the chunk metadata. In this way, the chunk no longer carries only the original text. It also carries the context needed to understand where that information belongs and how it relates to the rest of the knowledge base, turning each chunk into a self-contained knowledge unit. This enriched structure gives the chunk greater semantic value during retrieval and provides the AI with more complete context when the information is returned. Instead of forcing the model to reconstruct hierarchy, relationships, and applicability from disconnected pieces at inference time, those elements are already available within the retrieved unit. The result is an implicit semantic graph around the original content, reducing contextual reconstruction and improving retrieval precision, grounding, and response accuracy."],
  ["🧠 Self-Contained Knowledge Unit", "A Self-Contained Knowledge Unit is a chunk enriched with the contextual information an AI system needs to correctly interpret and use it without reconstructing essential meaning from multiple disconnected retrievals. Instead of requiring the model to assemble a puzzle after retrieval, relevant context such as hierarchy, scope, dependencies, applicability, and semantic relationships is embedded directly into the chunk metadata. This transforms what would normally be just one isolated piece of information into a self-contained knowledge unit that already carries the context required for accurate interpretation. In Dante IA, for example, retrieving the text of a Brazilian legal provision alone was insufficient. The system also needed to understand where that provision belonged within the legal hierarchy and the context governing its application. By incorporating this information into each unit, an isolated legal chunk became self-contained knowledge. The principle is simple: move essential contextual reasoning from inference time to preprocessing time, reducing the model’s cognitive burden while making retrieval and responses more precise, efficient, and reliable."],
  ["🔋 Full Prompt Concept", "A \"Full Prompt\" describes the optimal state of a prompt, where it is complete and filled with all the information needed by the AI to address the request precisely, including detailed output format instructions."],
] as const;

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

export default function ResearchPage() {
  return (
    <main className="research-page" id="top">
      <SiteHeader brand={<Brand />} page="research" />

      <article className="research-article site-container">
        <header className="research-article__header">
          <p className="eyebrow">Research</p>
          <h1 id="prompt-engineering-creative-research-heading">
            <span className="research-title-line">Prompt Engineering</span>
            <span className="research-title-line research-title-line--accent">Creative Research</span>
          </h1>
          <p className="research-article__dek">It is all about Creative thinking,<br />a lot of experimentation,<br />and Great discoveries...</p>
        </header>

        <div className="research-article__body">
          <p>With the goal of delving as deeply as possible and uncovering the most advanced potential and features of ChatGPT, I embarked on my own creative ChatGPT research. Utilizing a design thinking approach and armed with my creative skills and full of questions, I dove into this process of a lot of testing and interesting experimentation. I had the opportunity to discover new concepts, interesting insights, and even developed a new promising prompt engineering technique with great potential for optimizing the development process and reducing development costs. Below, I will share about these new concepts and techniques.</p>

          <div className="research-topics">
            {topics.map(([title, text], index) => (
              title.includes("Metagraph Chunk") ? <MetagraphTopic key={title} title={title} /> : title.includes("Self-Contained") ? <SelfContainedTopic key={title} title={title} /> : (
                <section className="research-topic" key={title}>
                  <h2>{title}</h2>
                  <p>{text}</p>
                  <a className="research-topic__details" href={title.includes("CPT") ? "/contatenated-prompt-techique" : title.includes("UX Prompt") ? "/ux-prompt-design" : title.includes("PromptApp") ? "/prompt-app" : "#top"} onClick={title.includes("CPT") || title.includes("UX Prompt") || title.includes("PromptApp") ? undefined : (event) => event.preventDefault()}>See details page <span aria-hidden="true">→</span></a>
                </section>
              )
            ))}
          </div>

        </div>
      </article>
    </main>
  );
}

function MetagraphTopic({ title }: { title: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className={`research-topic research-topic--accordion${expanded ? " is-expanded" : ""}`}>
      <h2>{title}</h2>
      <p>Metagraph Chunk is a semantic enrichment method designed to make each chunk more meaningful before it reaches the retrieval stage. During preprocessing, the source content is analyzed to identify relevant structural and contextual information, such as hierarchy, entity relationships, related concepts, scope, and agent instructions, and this information is embedded directly into the chunk metadata.</p>
      <div className="research-topic__accordion-content" hidden={!expanded}>
        <p>In this way, the chunk no longer carries only the original text. It also carries the context needed to understand where that information belongs and how it relates to the rest of the knowledge base, turning each chunk into a self-contained knowledge unit.</p>
        <p>This enriched structure gives the chunk greater semantic value during retrieval and provides the AI with more complete context when the information is returned. Instead of forcing the model to reconstruct hierarchy, relationships, and applicability from disconnected pieces at inference time, those elements are already available within the retrieved unit. The result is an implicit semantic graph around the original content, reducing contextual reconstruction and improving retrieval precision, grounding, and response accuracy.</p>
      </div>
      <a className="research-topic__details" href="#metagraph-details" role="button" aria-expanded={expanded} onClick={(event) => { event.preventDefault(); setExpanded((value) => !value); }}>See details <span aria-hidden="true">{expanded ? "↑" : "→"}</span></a>
    </section>
  );
}

function SelfContainedTopic({ title }: { title: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className={`research-topic research-topic--accordion${expanded ? " is-expanded" : ""}`}>
      <h2>{title}</h2>
      <p>A Self-Contained Knowledge Unit is a chunk enriched with all the relevant contextual information an AI system needs to correctly interpret and use it without reconstructing essential meaning from multiple disconnected retrievals. Instead of requiring the model to assemble a puzzle after retrieval, relevant context such as hierarchy, scope, dependencies, applicability, and semantic relationships is embedded directly into the chunk metadata.</p>
      <p><strong>This transforms what would normally be just one isolated piece of information into a self-contained knowledge unit that already carries the context required for accurate interpretation.</strong></p>
      <div className="research-topic__accordion-content" hidden={!expanded}>
        <p>In Dante IA, for example, retrieving the text of a Brazilian legal provision alone was insufficient. The system also needed to understand where that provision belonged within the legal hierarchy and the context governing its application.</p>
        <p>By incorporating this information into each unit, an isolated legal chunk became self-contained knowledge. The principle is simple: move essential contextual reasoning from inference time to preprocessing time, reducing the model’s cognitive burden while making retrieval and responses more precise, efficient, and reliable.</p>
      </div>
      <a className="research-topic__details" href="#self-contained-details" role="button" aria-expanded={expanded} onClick={(event) => { event.preventDefault(); setExpanded((value) => !value); }}>See details <span aria-hidden="true">{expanded ? "↑" : "→"}</span></a>
    </section>
  );
}
