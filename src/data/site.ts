import type { LogoId } from "./logos";

export const LOCALES = ["pt", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const hasLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

/** Dados pessoais — edite aqui. `github: null` esconde o link até você ter um. */
export const PROFILE = {
  name: "Luiz Guilherme",
  email: "lguimellosantos@gmail.com",
  phoneDisplay: "+55 (75) 98231-5488",
  whatsapp: "https://wa.me/5575982315488",
  linkedin: "https://www.linkedin.com/in/luiz-guilherme-melo-96189a425/",
  github: null as string | null,
  location: "Feira de Santana – BA, Brasil",
};

type L = Record<Locale, string>;

export type CategoryId = "data" | "infra" | "automation" | "fullstack" | "tools";

export const CATEGORIES: Record<CategoryId, L> = {
  data: { pt: "Banco de dados", en: "Databases" },
  infra: { pt: "Infra, DevOps & redes", en: "Infra, DevOps & networking" },
  automation: { pt: "Automação, IA & integrações", en: "Automation, AI & integrations" },
  fullstack: { pt: "Full-stack & mobile", en: "Full-stack & mobile" },
  tools: { pt: "Ferramentas", en: "Tooling" },
};

export type Skill = { id: string; logo: LogoId; name: string; category: CategoryId; desc: L };

/** Ordem = ordem das teclas no teclado. */
export const SKILLS: Skill[] = [
  { id: "postgresql", logo: "postgresql", name: "PostgreSQL", category: "data", desc: {
    pt: "Administração, otimização de queries e modelagem relacional — incluindo arquiteturas multi-tenant e CRMs.",
    en: "Administration, query optimization and relational modeling — including multi-tenant architectures and CRMs." } },
  { id: "docker", logo: "docker", name: "Docker & Compose", category: "infra", desc: {
    pt: "Containerização e isolamento de serviços, do ambiente local ao servidor em produção.",
    en: "Containerization and service isolation, from local setups to production servers." } },
  { id: "linux", logo: "linux", name: "Linux", category: "infra", desc: {
    pt: "Administração de servidores e ambientes locais, onde roda a maior parte do que eu entrego.",
    en: "Server and local environment administration — where most of what I ship runs." } },
  { id: "windows", logo: "windows", name: "Windows Server", category: "infra", desc: {
    pt: "Administração de servidores, redes e estações Windows em ambientes corporativos.",
    en: "Administration of Windows servers, networks and workstations in business environments." } },
  { id: "npm", logo: "npm", name: "Nginx Proxy Manager", category: "infra", desc: {
    pt: "Proxy reverso, certificados SSL e roteamento de tráfego para serviços auto-hospedados.",
    en: "Reverse proxy, SSL certificates and traffic routing for self-hosted services." } },
  { id: "cloudflare", logo: "cloudflare", name: "Cloudflare Tunnels", category: "infra", desc: {
    pt: "Exposição segura de serviços sem abrir portas, com DNS e proteção na borda.",
    en: "Secure service exposure without opening ports, with DNS and edge protection." } },

  { id: "n8n", logo: "n8n", name: "n8n", category: "automation", desc: {
    pt: "Orquestração de workflows e automações complexas entre sistemas, APIs e pessoas.",
    en: "Orchestrating workflows and complex automations across systems, APIs and people." } },
  { id: "evolution", logo: "whatsapp", name: "Evolution API", category: "automation", desc: {
    pt: "Integrações avançadas e atendimento automatizado via WhatsApp.",
    en: "Advanced integrations and automated customer service over WhatsApp." } },
  { id: "gemini", logo: "gemini", name: "Google Gemini API", category: "automation", desc: {
    pt: "Agentes inteligentes e consultores de vendas automatizados com IA.",
    en: "Intelligent agents and AI-powered automated sales assistants." } },
  { id: "puppeteer", logo: "puppeteer", name: "Puppeteer & Apify", category: "automation", desc: {
    pt: "Web scraping, extração de dados e automação de catálogos.",
    en: "Web scraping, data extraction and catalog automation." } },
  { id: "python", logo: "python", name: "Python", category: "fullstack", desc: {
    pt: "APIs, microsserviços e scripts de dados.",
    en: "APIs, microservices and data scripts." } },
  { id: "node", logo: "node", name: "Node.js", category: "fullstack", desc: {
    pt: "APIs, microsserviços e back-ends robustos — minha base há mais de 4 anos.",
    en: "APIs, microservices and robust back-ends — my foundation for 4+ years." } },

  { id: "next", logo: "next", name: "Next.js", category: "fullstack", desc: {
    pt: "Aplicações web modernas e performáticas com SSR. Este site é feito com ele.",
    en: "Modern, fast web apps with SSR. This site is built with it." } },
  { id: "react", logo: "react", name: "React & React Native", category: "fullstack", desc: {
    pt: "Interfaces web e apps mobile multiplataforma com a mesma base de código.",
    en: "Web interfaces and cross-platform mobile apps from one codebase." } },
  { id: "typescript", logo: "typescript", name: "TypeScript", category: "fullstack", desc: {
    pt: "Lógica full-stack tipada, do banco de dados até a interface.",
    en: "Typed full-stack logic, from the database to the interface." } },
  { id: "javascript", logo: "javascript", name: "JavaScript", category: "fullstack", desc: {
    pt: "A linguagem por trás de quase tudo que escrevo, no navegador e no servidor.",
    en: "The language behind almost everything I write, in the browser and on the server." } },
  { id: "tailwind", logo: "tailwind", name: "Tailwind & NativeWind", category: "fullstack", desc: {
    pt: "Estilização consistente na web e no mobile com o mesmo vocabulário.",
    en: "Consistent styling on web and mobile with the same vocabulary." } },
  { id: "git", logo: "git", name: "Git", category: "tools", desc: {
    pt: "Versionamento e fluxo de trabalho em equipes distribuídas.",
    en: "Version control and workflows for distributed teams." } },
  { id: "github", logo: "github", name: "GitHub", category: "tools", desc: {
    pt: "Repositórios, revisão de código e colaboração remota.",
    en: "Repositories, code review and remote collaboration." } },
];

export const EXPERIENCE: {
  role: L; company: string; url?: string; place?: L; period: L; bullets: Record<Locale, string[]>;
}[] = [
  {
    role: { pt: "Analista de Sistemas", en: "Systems Analyst" },
    company: "WG Automações",
    url: "https://wgautomacoes.online/",
    place: { pt: "Feira de Santana – BA", en: "Feira de Santana, Brazil" },
    period: { pt: "03/2024 — atual", en: "03/2024 — present" },
    bullets: {
      pt: [
        "Desenvolvo, mantenho e dou suporte a sistemas de gestão para postos de combustível, garantindo a continuidade da operação dos clientes.",
        "Reduzo inconsistências de dados com lógica de sistemas e rotinas de validação, aumentando a precisão das informações financeiras e operacionais.",
        "Modelo e administro bancos PostgreSQL com foco em performance e integridade.",
        "Integro sistemas diferentes, eliminando retrabalho manual no controle de estoque e nos registros financeiros.",
      ],
      en: [
        "Build, maintain and support management systems for fuel stations, keeping client operations running.",
        "Reduce data inconsistencies through system logic and validation routines, improving financial and operational accuracy.",
        "Model and administer PostgreSQL databases with a focus on performance and integrity.",
        "Integrate disparate systems, removing manual rework from inventory control and financial records.",
      ],
    },
  },
  {
    role: { pt: "Desenvolvedor", en: "Developer" },
    company: "TicTacNews",
    url: "https://tictacnews.org/",
    place: { pt: "Remoto · Internacional", en: "Remote · International" },
    period: { pt: "01/2024 — 12/2025", en: "01/2024 — 12/2025" },
    bullets: {
      pt: [
        "Desenvolvimento e manutenção de soluções web com JavaScript, Node.js, HTML e CSS.",
        "Colaboração com equipes distribuídas, cumprindo prazos com comunicação clara.",
        "Melhoria contínua do produto: identificando falhas e propondo soluções.",
      ],
      en: [
        "Built and maintained web solutions with JavaScript, Node.js, HTML and CSS.",
        "Worked with distributed teams, meeting deadlines with clear communication.",
        "Drove continuous product improvement by spotting failures and proposing fixes.",
      ],
    },
  },
  {
    role: { pt: "Analista de Risco e Moderação de Conteúdo", en: "Risk & Content Moderation Analyst" },
    company: "Accenture",
    place: { pt: "Remoto", en: "Remote" },
    period: { pt: "04/2023 — 10/2023", en: "04/2023 — 10/2023" },
    bullets: {
      pt: [
        "Análise de risco, moderação de transações e avaliação de conformidade de contas no Facebook Marketplace.",
        "Investigação de tickets e casos suspeitos de fraude para proteger usuários e a integridade da plataforma.",
        "Aplicação de diretrizes de segurança, políticas de privacidade e padrões da comunidade em alto volume.",
        "Resolução de disputas complexas e mitigação de riscos de transações fraudulentas.",
      ],
      en: [
        "Risk analysis, transaction moderation and account compliance reviews on Facebook Marketplace.",
        "Investigated tickets and suspected fraud cases to protect users and platform integrity.",
        "Applied safety guidelines, privacy policies and community standards at high volume.",
        "Resolved complex disputes and mitigated fraudulent transaction risk.",
      ],
    },
  },
  {
    role: { pt: "DevOps Service Business Associate", en: "DevOps Service Business Associate" },
    company: "IBM",
    place: { pt: "Remoto · Internacional", en: "Remote · International" },
    period: { pt: "10/2021 — 05/2023", en: "10/2021 — 05/2023" },
    bullets: {
      pt: [
        "Execução de processos de negócio e transações técnicas com foco em eficiência e qualidade.",
        "Desenvolvimento e suporte a sistemas, com autonomia crescente dentro da equipe.",
        "Base sólida em práticas DevOps e automação de rotinas em ambiente internacional.",
      ],
      en: [
        "Ran business processes and technical transactions focused on efficiency and quality.",
        "Developed and supported systems, with growing autonomy within the team.",
        "Built a solid foundation in DevOps practices and routine automation in an international setting.",
      ],
    },
  },
];

export const PROJECTS: { name: string; tags: string[]; desc: L; href: string | null; soon: boolean }[] = [
  {
    name: "Veltora TI",
    tags: ["Sites", "Sistemas sob medida", "Automação", "Vercel"],
    desc: {
      pt: "Minha empresa de tecnologia: criação de sites, sistemas sob medida (como CRMs multi-tenant com Kanban), automação e suporte de TI para empresas de todo o Brasil.",
      en: "My tech company: websites, custom systems (such as multi-tenant CRMs with Kanban boards), automation and IT support for businesses across Brazil.",
    },
    href: "https://veltorati.vercel.app/",
    soon: false,
  },
  {
    name: "TicTacNews",
    tags: ["WordPress", "Elementor", "JavaScript", "Remoto"],
    desc: {
      pt: "Portal de notícias internacional em inglês e português — destaques, esportes, entretenimento e newsletter. Atuei no desenvolvimento e na manutenção.",
      en: "International news portal in English and Portuguese — top stories, sports, entertainment and a newsletter. I worked on its development and maintenance.",
    },
    href: "https://tictacnews.org/",
    soon: false,
  },
  {
    name: "WG Automações",
    tags: ["Postos de combustível", "Banco de dados", "NFC-e / NF-e", "Suporte"],
    desc: {
      pt: "Empresa de suporte e tecnologia para postos de combustível: sistemas de gestão, banco de dados, documentos fiscais e suporte remoto.",
      en: "Support and technology company for fuel stations: management systems, databases, tax documents and remote support.",
    },
    href: "https://wgautomacoes.online/",
    soon: false,
  },
  { name: "Próximo projeto", tags: ["n8n", "Gemini", "React Native"], desc: { pt: "Em finalização. Volte em breve.", en: "Wrapping up. Check back soon." }, href: null, soon: true },
];

export const DICT = {
  pt: {
    meta: {
      title: "Luiz Guilherme — Desenvolvedor de Software",
      description: "Desenvolvedor full-stack com foco em back-end, PostgreSQL, automações com n8n e IA, e SaaS multi-tenant. Feira de Santana – BA.",
    },
    nav: { about: "sobre", experience: "experiência", projects: "projetos", contact: "contato", skip: "Pular para o conteúdo" },
    hero: {
      eyebrow: "Desenvolvedor de software · back-end & dados",
      titleA: "construo",
      titleB: "SISTEMAS",
      titleC: "que não",
      titleD: "DESMORONAM.",
      lead: "…bem, exceto este teclado.",
      ctaProjects: "Ver projetos",
      ctaContact: "Falar comigo",
    },
    keyboard: {
      label: "Teclado de skills. Cada tecla é uma ferramenta que eu uso.",
      hint: "Clique em qualquer tecla",
      hintTitleTouch: "Toque em qualquer tecla",
      hintSub: "Ela vira areia e, em 5 segundos, se reconstrói. Passe o mouse na areia para empurrá-la.",
      hintTouch: "Ela vira areia e, em 5 segundos, se reconstrói sozinha.",
      rebuilding: "Reconstruindo em",
      space: "Barra de espaço",
      spaceDesc: "Desmancha o teclado inteiro. Em 5 segundos, tudo volta ao lugar — como um bom deploy com rollback.",
      spaceCat: "Easter egg",
      keyAria: "Mostrar detalhes de",
    },
    marquee: ["back-end", "PostgreSQL", "automações", "IA aplicada", "multi-tenant", "Node.js", "Docker", "n8n"],
    about: {
      kicker: "sobre",
      title: "Lógica de sistemas, dados confiáveis e automação que poupa trabalho de verdade.",
      p1: "Sou desenvolvedor há mais de 4 anos, com experiência em desenvolvimento, integração e manutenção de sistemas — de sistemas de gestão para postos de combustível a projetos remotos internacionais.",
      p2: "Meu foco é reduzir inconsistências de dados, automatizar processos e entregar software que não quebra quando o negócio cresce. Hoje construo SaaS multi-tenant, agentes de IA e automações com n8n e WhatsApp.",
      stackTitle: "stack completa",
    },
    experience: { kicker: "experiência", title: "Onde participei", education: "formação", degree: "Tecnólogo em Análise e Desenvolvimento de Sistemas", school: "UNIFAN", degreeStatus: "em andamento" },
    projects: { kicker: "projetos", title: "Trabalhos selecionados", soon: "em breve", visit: "Ver projeto", private: "link em breve" },
    contact: { kicker: "contato", titleA: "vamos", titleB: "CONSTRUIR", titleC: "algo", titleD: "JUNTOS?", sub: "Aberto a vagas de desenvolvedor de software e analista de sistemas — presencial, híbrido ou remoto.", copy: "copiar e-mail", copied: "copiado!" },
    footer: "Feito com Next.js e alguns milhares de grãos de areia.",
  },
  en: {
    meta: {
      title: "Luiz Guilherme — Software Developer",
      description: "Full-stack developer focused on back-end, PostgreSQL, n8n and AI automations, and multi-tenant SaaS. Based in Brazil, working remotely.",
    },
    nav: { about: "about", experience: "experience", projects: "work", contact: "contact", skip: "Skip to content" },
    hero: {
      eyebrow: "Software developer · back-end & data",
      titleA: "I build",
      titleB: "SYSTEMS",
      titleC: "that don’t",
      titleD: "FALL APART.",
      lead: "…well, except this keyboard.",
      ctaProjects: "See work",
      ctaContact: "Get in touch",
    },
    keyboard: {
      label: "Skills keyboard. Each key is a tool I use.",
      hint: "Click any key",
      hintTitleTouch: "Tap any key",
      hintSub: "It turns into sand and rebuilds itself in 5 seconds. Move your mouse over the sand to push it around.",
      hintTouch: "It turns into sand and rebuilds itself in 5 seconds.",
      rebuilding: "Rebuilding in",
      space: "Space bar",
      spaceDesc: "Crumbles the whole keyboard. In 5 seconds everything is back in place — like a good deploy with rollback.",
      spaceCat: "Easter egg",
      keyAria: "Show details for",
    },
    marquee: ["back-end", "PostgreSQL", "automation", "applied AI", "multi-tenant", "Node.js", "Docker", "n8n"],
    about: {
      kicker: "about",
      title: "System logic, reliable data and automation that actually saves work.",
      p1: "I’ve been a developer for 4+ years, building, integrating and maintaining systems — from fuel station management software to remote international projects.",
      p2: "I focus on removing data inconsistencies, automating processes and shipping software that doesn’t break as the business grows. Today I build multi-tenant SaaS, AI agents and automations with n8n and WhatsApp.",
      stackTitle: "full stack",
    },
    experience: { kicker: "experience", title: "Where I’ve worked", education: "education", degree: "Associate Degree in Systems Analysis and Development", school: "UNIFAN", degreeStatus: "in progress" },
    projects: { kicker: "work", title: "Selected work", soon: "soon", visit: "View project", private: "link soon" },
    contact: { kicker: "contact", titleA: "let’s", titleB: "BUILD", titleC: "something", titleD: "TOGETHER?", sub: "Open to software developer and systems analyst roles — on-site, hybrid or remote.", copy: "copy email", copied: "copied!" },
    footer: "Built with Next.js and a few thousand grains of sand.",
  },
} satisfies Record<Locale, unknown>;

export type Dict = (typeof DICT)["pt"];
