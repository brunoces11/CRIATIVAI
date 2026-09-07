import { SiteHeader } from "../components/SiteHeader";

function Brand() {
  return <span className="brand-lockup" aria-label="CriativAI"><img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" /></span>;
}

const images = [
  ["https://pmt.criativai.site/wp-content/uploads/2024/03/CTP_DIAGRAMS_UX_v6a.jpg", "UX Prompt Design requirements diagram"],
  ["https://pmt.criativai.site/wp-content/uploads/2024/03/CPT_PRINT_MINECRAFT_v2a.jpg", "Minecraft Mashup built-in ChatGPT game"],
  ["https://pmt.criativai.site/wp-content/uploads/2024/03/CPT_PRINT_SHERLOCK_v2a.jpg", "Sherlock Hoax prompt"],
  ["https://pmt.criativai.site/wp-content/uploads/2024/03/CPT_PRINT_TIME_v2a.jpg", "Track to the Future 28 game"],
  ["https://pmt.criativai.site/wp-content/uploads/2024/03/CPT_PRINT_GPTINDER_v2a.jpg", "GPTinder dating advisor"],
] as const;

function ArticleImage({ image }: { image: readonly [string, string] }) {
  return <figure className="cpt-figure"><img src={image[0]} alt={image[1]} loading="lazy" /><figcaption>{image[1]}</figcaption></figure>;
}

export default function UxPromptDesignPage() {
  return (
    <main className="cpt-page" id="top">
      <SiteHeader brand={<Brand />} />
      <article className="cpt-article site-container">
        <header className="cpt-article__header"><p className="eyebrow">Prompt Engineering | Creative Research</p><h1>UX Prompt Design</h1></header>
        <p>Get ready to take ChatGPT interactions to the next level! Go beyond the boring text-only chat interface. Now, by using advanced markdown and precise output instructions, you can create captivating ChatGPT user experiences. Designers and developers can unleash their creativity, adding headers, footers, images, links, and more to offer users an immersive journey. Check out these exciting examples below:</p>

        <section><h2>Applicable requirements</h2><p>Due to ChatGPT's characteristic of generating varied responses for the same input, <strong>achieving precise control over its outputs is challenging</strong>. To achieve this, three requirements must be present: <strong>Full prompt state</strong> + <strong>Precise output instructions</strong> + <strong>Advanced Markdown</strong>. See diagram:</p><ArticleImage image={images[0]} /></section>
        <section><h2>Prompt Examples</h2><p>When your prompts meet all three requirements mentioned above (<strong>Full prompt state + Advanced Markdown + Precise output instructions</strong>), it allows for precise control over the output format of ChatGPT responses. <strong>Adding UI Design</strong> into the mix can transform a simple ChatGPT text-based chat interaction into a richer and more complete user experience, <strong>similar to a website or application</strong> (prompt app). See examples below:</p></section>
        <Example title="🕹️ Minecraft Mashup | Innovative Built-in ChatGPT Game" href="https://flowgpt.com/p/minecraft-mashup-beyond-the-end-1" image={images[1]} />
        <Example title="🕹️ Sherlock Hoax 2025 | Jailbreak-themed prompt" href="https://flowgpt.com/p/sherlock-hoax-game" image={images[2]} />
        <Example title="🕹️ Track to the Future 28 | Innovative Built-in ChatGPT Game" href="https://flowgpt.com/p/track-to-the-future-game-1" image={images[3]} />
        <Example title="🕹️ GPTinder | Your Turbocharged Dating Advisor" href="https://flowgpt.com/p/gptinder-your-turbocharged-dating-advisor-16" image={images[4]} />
        <section><h2>In conclusion</h2><p>The concept of UX Prompt Design aims above all to extract the best possible user experience in interactions with ChatGPT.</p></section>
        <section><h2>Need support with your prompts?</h2><p>So, get in touch with me, because I can help...</p><a className="button button--accent" href="/contact">Contact me</a></section>
      </article>
    </main>
  );
}

function Example({ title, href, image }: { title: string; href: string; image: readonly [string, string] }) {
  return <section><h2>{title}</h2><p>To access this prompt <a href={href} target="_blank" rel="noreferrer">click here</a>.</p><ArticleImage image={image} /></section>;
}
