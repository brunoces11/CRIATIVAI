import { SiteHeader } from "../components/SiteHeader";

function Brand() {
  return <span className="brand-lockup" aria-label="CriativAI"><img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" /></span>;
}

const images = [
  ["https://pmt.criativai.site/wp-content/uploads/2024/04/prompt-app-concept-prompt-master-creative-chatgpt-research-bruno-cesar-prompt-engneer.jpg", "PromptApp concept diagram"],
  ["https://pmt.criativai.site/wp-content/uploads/2024/04/prompt-app-concept-creative-chatgpt-research-bruno-cesar-prompt-engeneering-prompt-master.jpg", "PromptApp future of prompt engineering diagram"],
] as const;

function ArticleImage({ image }: { image: readonly [string, string] }) {
  return <figure className="cpt-figure"><img src={image[0]} alt={image[1]} loading="lazy" /><figcaption>{image[1]}</figcaption></figure>;
}

export default function PromptAppPage() {
  return (
    <main className="cpt-page" id="top">
      <SiteHeader brand={<Brand />} />
      <article className="cpt-article site-container">
        <header className="cpt-article__header"><p className="eyebrow">Prompt Engineering | Creative Research</p><h1>PromptApp Concept</h1></header>
        <p>In my exploration of ChatGPT's capabilities, I discovered some new cool concepts. However, things got really interesting when I started combining them. By merging ChatGPT's ability to handle multiple functions simultaneously using <a href="/contatenated-prompt-techique" title="CPT | Concatenated Prompt Technique">Concatenated Prompt Technique (CPT)</a> with enhanced control over ChatGPT outputs through <a href="/ux-prompt-design" title="UX Prompt Design concept">UX Prompt Design</a>, an intriguing type of application emerged. It acts like an app, but it operates from a single text document—the prompt—without any need for development environments, programming languages, compilers, or other tools. An entire application “coded” into a single prompt, using only structured natural language texts and executed entirely directly by ChatGPT, also featuring precisely formatted content for a much better user experience. See below for more details...</p>
        <ArticleImage image={images[0]} />

        <section><h2>Why PromptApp?</h2><p>Prompt apps represent a new application concept that sits between a traditional app and a simple prompt. They are more robust than a simple prompt, offering a wider range of out-of-the-box functionalities, yet simpler and cheaper to create compared to traditional apps requiring programming skills.</p></section>
        <section><h2>PromptApps and the future of Prompt Engineering</h2><p>I see that prompt apps offer a simpler, faster, and more cost-effective alternative for developing AI-based solutions that will prove highly useful for creating a wide range of applications in the near future. As language models advance in computational power, prompts will handle more instructions, especially with the addition of <strong>Concatenated Prompt Technique (CPT)</strong>, enabling them to execute countless instructions simultaneously and instantly. Due to its simplicity and promising future, I see that “prompt apps” will play a significant role in this new era of AI-driven applications. See the image diagram below:</p><ArticleImage image={images[1]} /></section>

        <section><h2>PromptApp Advantages</h2><p>Prompt Apps represent a groundbreaking shift in the way applications are developed and interacted with, leveraging advanced AI models like ChatGPT. By moving towards natural language as a programming tool, these applications open up a new realm of possibilities for creators and users alike.</p><ol><li><strong>Accessibility:</strong> They lower the barrier to entry for application development.</li><li><strong>Rapid Development:</strong> They can be developed, tested, and deployed much quicker than traditional applications.</li><li><strong>Cost Reduction in Development:</strong> Simplifying development significantly reduces costs.</li><li><strong>Cost Efficiency in Maintenance:</strong> Ongoing maintenance costs are considerably lower.</li><li><strong>Flexibility:</strong> Features can quickly adapt based on user feedback.</li><li><strong>Scalability:</strong> Scaling does not require traditional backend infrastructure expansion.</li><li><strong>Engagement:</strong> Conversational AI provides a more engaging and personalized user experience.</li></ol><h3>PromptApp represents a new type of applications running inside ChatGPT based solely on prompts with structured and logical natural language code.</h3></section>

        <section><h2>Need support with your prompts?</h2><p>So, get in touch with me, and let's make it happen! I'm currently seeking interesting AI projects and promising prompt challenges.</p><a className="button button--accent" href="/contact">Contact me</a></section>
      </article>
    </main>
  );
}
