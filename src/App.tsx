import "./App.css";

const NAV = [
  { label: "See my work", href: "#projects", icon: "▶" },
  { label: "My stack", href: "#stack", icon: "◆" },
  { label: "Hire me", href: "#contact", icon: "✓" },
];

const TOOLS = [
  { name: "Playwright", short: "Pw" },
  { name: "TypeScript", short: "Ts" },
  { name: "Selenium", short: "Se" },
  { name: "Java Spring", short: "Jv" },
  { name: "Postman", short: "Pm" },
  { name: "Jira", short: "Ji" },
  { name: "Git", short: "Git" },
  { name: "n8n", short: "n8n" },
];

const CLIENTS = [
  "Opswat",
  "Rovi",
  "Claude SDK",
  "Jira MCP",
  "Confluence",
  "n8n",
  "GitLab",
  "Bitbucket",
];

const SERVICES = [
  {
    title: "TEST AUTOMATION FRAMEWORK",
    desc: "Playwright + TypeScript — UI, API & backend",
    tag: "01",
  },
  {
    title: "AI-AUGMENTED QA PIPELINE",
    desc: "Claude Agent SDK · Jira MCP · n8n",
    tag: "02",
  },
  {
    title: "API & BACKEND TESTING",
    desc: "REST validation, Spring Boot, JUnit",
    tag: "03",
  },
  {
    title: "REGRESSION & SMOKE SUITES",
    desc: "Scalable test design, 40% manual effort cut",
    tag: "04",
  },
  {
    title: "TEST STRATEGY & PLANNING",
    desc: "EP · BVA · Decision Tables · State Transition",
    tag: "05",
  },
  {
    title: "CI/CD QUALITY GATES",
    desc: "Git, branch automation, PR & Jira sync",
    tag: "06",
  },
];

const SOCIALS = [
  {
    label: "Email",
    href: "mailto:sonbuithanh306@gmail.com",
    glyph: "✉",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sontbui2783/",
    glyph: "in",
  },
  {
    label: "GitHub",
    href: "https://github.com/sontbui",
    glyph: "GH",
  },
  {
    label: "Phone",
    href: "tel:+84363079576",
    glyph: "☎",
  },
  {
    label: "Portfolio",
    href: "#top",
    glyph: "◆",
  },
];

function App() {
  return (
    <main id="top" className="page">
      {/* Top floating nav */}
      <nav className="top-nav" aria-label="Primary">
        {NAV.map((item) => (
          <a key={item.label} href={item.href} className="pill">
            <span className="pill-dot">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-left">
          <div className="rule" />
          <h2 className="hero-role">
            Software Development
            <br />
            Engineer in Test
          </h2>
        </div>

        <div className="hero-center">
          <div className="hero-mark">
            <span className="hero-bracket">{"{"}</span>
            <div className="hero-name-block">
              <div className="hero-name">
                <span className="name-accent">son.</span>
                <span className="name-rest">bui</span>
              </div>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                SDET · Quality Engineer
              </div>
            </div>
            <span className="hero-bracket">{"}"}</span>
          </div>
        </div>

        <div className="hero-right">
          <p className="hero-bio">
            Hi, I&apos;m Son — an SDET passionate about building scalable
            automation frameworks, AI-augmented QA pipelines, and shipping
            products that don&apos;t break in production.
          </p>
        </div>
      </section>

      {/* Tools row */}
      <section id="stack" className="tools-row" aria-label="Tools">
        {TOOLS.map((t) => (
          <div key={t.name} className="tool-chip" title={t.name}>
            <span className="tool-glyph">{t.short}</span>
            <span className="tool-name">{t.name}</span>
          </div>
        ))}
      </section>

      {/* Tagline */}
      <section className="tagline">
        <div className="rule" />
        <h1 className="tagline-title">
          Crafting reliable, automated, AI-augmented test suites,
          <br />
          quality pipelines and many more&hellip;
        </h1>
        <p className="tagline-sub">
          Testing is not just about clicking buttons or finding bugs — it&apos;s
          a way of guaranteeing trust, hardening release cycles, and giving
          engineers confidence to ship fast. Designing scalable QA systems and
          AI-driven test workflows is what I do very well&hellip;
        </p>
      </section>

      {/* Client / tech band */}
      <section className="clients" aria-label="Worked with">
        {CLIENTS.map((c) => (
          <span key={c} className="client">
            {c}
          </span>
        ))}
      </section>

      {/* what I do */}
      <section id="projects" className="services">
        <div className="rule" />
        <h2 className="services-title">what I do</h2>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <a key={s.tag} href="#contact" className="service-card">
              <div className="service-thumb">
                <span className="service-tag">{s.tag}</span>
              </div>
              <div className="service-body">
                <div className="service-title">{s.title}</div>
                <div className="service-desc">{s.desc}</div>
              </div>
              <span className="service-cta" aria-hidden="true">
                ▶
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="highlights">
        <div className="highlight">
          <div className="highlight-num">40%</div>
          <div className="highlight-label">manual testing reduced</div>
        </div>
        <div className="highlight">
          <div className="highlight-num">4</div>
          <div className="highlight-label">AI sub-agents in QA pipeline</div>
        </div>
        <div className="highlight">
          <div className="highlight-num">2025</div>
          <div className="highlight-label">Best Employee of the Year</div>
        </div>
        <div className="highlight">
          <div className="highlight-num">Q2&apos;25</div>
          <div className="highlight-label">Best Employee of the Quarter</div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="contact">
        <h2 className="contact-title">Contact me</h2>
        <div className="contact-pill">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="contact-icon"
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={s.href.startsWith("http") ? "noreferrer" : undefined}
              aria-label={s.label}
            >
              <span className="contact-glyph">{s.glyph}</span>
              <span className="contact-label">{s.label}</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Bui Thanh Son · SDET</span>
        <span className="footer-dot">·</span>
        <span>Ho Chi Minh City, Vietnam</span>
      </footer>
    </main>
  );
}

export default App;
