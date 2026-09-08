import { SiteHeader } from "../components/SiteHeader";

function Brand() {
  return <span className="brand-lockup" aria-label="CriativAI"><img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" /></span>;
}

const images = [
  { src: "https://pmt.criativai.site/wp-content/uploads/2024/03/CTP_DIAGRAM_TRADITIONAL_v9.jpg", alt: "Traditional AI system implementation diagram" },
  { src: "https://pmt.criativai.site/wp-content/uploads/2024/03/CTP_DIAGRAM_CTP_v9.jpg", alt: "Concatenated Prompt Technique diagram" },
  { src: "https://pmt.criativai.site/wp-content/uploads/2024/03/CTP_CONCATENATED_PROMPT_TECHNIQUE_DIAGRAM_v10.jpg", alt: "CPT concatenated prompt technique functional example diagram" },
];

export default function ConcatenatedPromptTechniquePage() {
  return (
    <main className="cpt-page" id="top">
      <SiteHeader brand={<Brand />} />
      <article className="cpt-article site-container">
        <header className="cpt-article__header">
          <p className="eyebrow">Prompt Engineering | Creative Research</p>
          <h1>CPT | Concatenated Prompt Technique</h1>
        </header>

        <p>It is a new and promising prompt engineering technique that I have created, enabling <strong>ChatGPT to execute multiple prompts in a single input</strong>. This has the potential to significantly simplify the development of any AI system because it enables the model to manage more complex interactions, behaving like a regular app or website functionality, <strong>all inside one single CPT prompt</strong>.</p>

        <section><h2>CPT | How it works?</h2><p>This technique is all about giving the AI one prompt that actually has several different prompts inside it, each with its own job to do. We tell the AI to look at this big prompt and see it as a collection of individual prompts, not just one. It's like saying, “Within this one big prompt, there are multiple prompts, each needing your attention.” We make it clear for the AI by using special markers (placeholders) to show where each prompt starts and ends. Take a closer look below for a real example.</p></section>

        <section><h2>CPT | Milestone</h2><p>For this presentation, I've designed the CPT Milestone, <strong>the first concatenated prompt (CPT)</strong>, to serve as an example and demonstrate the capabilities of CPT itself. So, let's imagine a scenario where we want to implement an AI system with the four main functionalities listed below:</p><ol><li><strong>Image generator prompt</strong>, called IMAGEN.</li><li><strong>Text 2 Emoji converter prompt</strong>, called Text2Emoji.</li><li><strong>Unicode Icon Discovery prompt</strong>, called ICON MACHINE (FlowGPT Hackathon winner - 3rd 🥉).</li><li><strong>Automatic Counter Answer prompt</strong>: Automatically counts all its responses to improve surveys.</li></ol></section>

        <section><h2>👇 Example of a regular AI System implementation</h2><p>In a conventional scenario, when we have an AI system with many different function requirements like these, <strong>typically each function is implemented independently</strong>. All the parts are then assembled in the system by developers. This approach makes the development more laborious, time-consuming, and costly. The more functions desired, the more code and system setup will be necessary behind the scenes to make all the parts work together. See the example diagram below:</p><CptImage image={images[0]} /></section>

        <section><h2>👇 Example of a [CPT] Concatenated Prompt Technique potential</h2><p>Due to the main characteristic of CPT, which is the ability to <strong>consolidate multiple prompts into a single text prompt input</strong>, all four functionalities listed above will be executed from a single CPT Prompt, significantly reducing the workload for the development team and <strong>making the project much more simplified and cost-effective</strong>. See diagram below:</p><CptImage image={images[1]} /></section>

        <section><h2>CPT MILESTONE | Fully Functional Example</h2><p>Also note that this <strong>CPT Prompt</strong> example features advanced content formatting, displaying precise content pages with customized design elements including header, footer, tables, hyperlinks, and images, providing a much better user experience <strong>resembling a website or a regular application built-in ChatGPT</strong> (Prompt App).</p><CptImage image={images[2]} /></section>

        <section><h2>So, how can I check it out?</h2><p>Concatenated prompt running on ChatGPT4 at FlowGPT platform:<br /><a href="https://flowgpt.com/p/cpt-concatenated-prompt-technique-4" target="_blank" rel="noreferrer">https://flowgpt.com/p/cpt-concatenated-prompt-technique-4</a></p><p>Concatenated prompt running on ChatGPT3.5 at OpenAI chat:<br /><a href="https://chat.openai.com/share/8d8e914b-1611-4c7d-aef9-aaa620d75d6f" target="_blank" rel="noreferrer">https://chat.openai.com/share/8d8e914b-1611-4c7d-aef9-aaa620d75d6f</a></p><p>Custom GPT version:<br /><span>Work in progress (Coming soon)</span></p></section>

        <section><h2>CPT | Interesting and promising use cases</h2><p><strong>Interactive Storytelling:</strong> Leveraging CPT, writers and developers can create complex, branching narratives where the AI dynamically adapts the story based on user decisions.</p><p><strong>Multi-step Data Analysis:</strong> CPT can guide AI through a series of analysis steps, from data cleaning to visualization.</p><p><strong>Automated Content Creation:</strong> Content creators can instruct AI to research, draft, and refine content in a single flow.</p><p><strong>Dynamic built-in Game Play:</strong> Game developers can transform ChatGPT into a built-in game with immersive storytelling and advanced game dynamics.</p><p><strong>Healthcare Patient Triage:</strong> CPT can empower AI systems to perform more nuanced patient triage before patients see a healthcare professional.</p><p><strong>Automated Software Testing:</strong> A single concatenated prompt can instruct AI to perform a series of test cases.</p><p><strong>Language Learning Platforms:</strong> CPT can create immersive language learning sessions with exercises, conversations, and tests.</p><p><strong>Real-time Crisis Management and Response:</strong> CPT can help AI systems understand and act on multiple pieces of information simultaneously.</p><p><strong>In-depth Market Research Analysis:</strong> CPT can parse data sources, identify trends, and generate insights through a sequence of concatenated prompts.</p></section>

        <section><h2>CPT | Concatenated Prompt Technique | Conclusion</h2><p>In conclusion, the Concatenated Prompt Technique (CPT) opens up endless possibilities for creating complex, engaging, and efficient AI-driven projects that push the boundaries of what's possible with AI, making interactions more dynamic and immersive while handling more intricate and complex tasks.</p></section>
        <section><h2>Use this technique in your AI project...</h2><p>Now I am looking forward to an opportunity to use this technique in something real. If you have an interesting or challenging AI project, just reach out to me, and let's see how it can help you achieve your goals.</p><a className="button button--accent" href="/contact">Contact me</a></section>
      </article>
    </main>
  );
}

function CptImage({ image }: { image: { src: string; alt: string } }) {
  return <figure className="cpt-figure"><img src={image.src} alt={image.alt} loading="lazy" /><figcaption>{image.alt}</figcaption></figure>;
}
