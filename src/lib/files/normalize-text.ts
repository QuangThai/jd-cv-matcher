// Skill alias normalization map
// Maps common variations to canonical names for better matching
const SKILL_ALIASES: Record<string, string> = {
  // Frontend frameworks
  "react.js": "React",
  "reactjs": "React",
  "react js": "React",
  "vue.js": "Vue.js",
  "vuejs": "Vue.js",
  "angularjs": "Angular",
  "angular.js": "Angular",
  "sveltejs": "Svelte",
  "next.js": "Next.js",
  "nextjs": "Next.js",
  "nuxt.js": "Nuxt.js",
  "nuxtjs": "Nuxt.js",
  "gatsbyjs": "Gatsby",
  "remix.run": "Remix",

  // Runtime / backend
  "node.js": "Node.js",
  "nodejs": "Node.js",
  "node js": "Node.js",
  "denojs": "Deno",
  "express.js": "Express.js",
  "expressjs": "Express.js",
  "nestjs": "NestJS",
  "nest.js": "NestJS",

  // Styling
  "tailwindcss": "Tailwind CSS",
  "tail wind css": "Tailwind CSS",
  "sass/scss": "Sass/SCSS",
  "scss": "Sass/SCSS",
  "styled components": "styled-components",
  "styled-components": "styled-components",
  "css modules": "CSS Modules",

  // Databases
  "postgres": "PostgreSQL",
  "postgresql": "PostgreSQL",
  "psql": "PostgreSQL",
  "pg": "PostgreSQL",
  "mysql": "MySQL",
  "mssql": "SQL Server",
  "sql server": "SQL Server",
  "mongodb": "MongoDB",
  "mongo": "MongoDB",
  "redis": "Redis",
  "elasticsearch": "Elasticsearch",
  "es": "Elasticsearch",
  "dynamodb": "DynamoDB",
  "firestore": "Firestore",
  "sqlite": "SQLite",

  // Cloud providers
  "aws": "Amazon Web Services",
  "amazon web services": "Amazon Web Services",
  "gcp": "Google Cloud Platform",
  "google cloud": "Google Cloud Platform",
  "google cloud platform": "Google Cloud Platform",
  "azure": "Microsoft Azure",
  "microsoft azure": "Microsoft Azure",
  "azure devops": "Azure DevOps",

  // DevOps / infrastructure
  "k8s": "Kubernetes",
  "kubernetes": "Kubernetes",
  "docker": "Docker",
  "terraform": "Terraform",
  "ansible": "Ansible",
  "jenkins": "Jenkins",
  "github actions": "GitHub Actions",
  "gitlab ci": "GitLab CI",
  "circleci": "CircleCI",
  "travis ci": "Travis CI",

  // Languages
  "javascript": "JavaScript",
  "js": "JavaScript",
  "typescript": "TypeScript",
  "ts": "TypeScript",
  "python": "Python",
  "py": "Python",
  "c++": "C++",
  "cpp": "C++",
  "c#": "C#",
  "csharp": "C#",
  "golang": "Go",
  "rust": "Rust",
  "ruby": "Ruby",
  "kotlin": "Kotlin",
  "swift": "Swift",
  "scala": "Scala",
  "dart": "Dart",

  // Testing
  "jest": "Jest",
  "mocha": "Mocha",
  "chai": "Chai",
  "cypress": "Cypress",
  "playwright": "Playwright",
  "selenium": "Selenium",
  "testing library": "React Testing Library",
  "rtl": "React Testing Library",
  "vitest": "Vitest",

  // State management
  "redux": "Redux",
  "redux toolkit": "Redux Toolkit",
  "rtk": "Redux Toolkit",
  "zustand": "Zustand",
  "mobx": "MobX",
  "recoil": "Recoil",
  "pinia": "Pinia",
  "vuex": "Vuex",

  // Tools
  "webpack": "Webpack",
  "vite": "Vite",
  "esbuild": "esbuild",
  "rollup": "Rollup",
  "parcel": "Parcel",
  "babel": "Babel",
  "eslint": "ESLint",
  "prettier": "Prettier",
  "git": "Git",
  "github": "GitHub",
  "gitlab": "GitLab",
  "bitbucket": "Bitbucket",
  "jira": "Jira",
  "confluence": "Confluence",
  "figma": "Figma",
  "sketch": "Sketch",
  "storybook": "Storybook",

  // Data / ML
  "tensorflow": "TensorFlow",
  "tf": "TensorFlow",
  "pytorch": "PyTorch",
  "pandas": "Pandas",
  "numpy": "NumPy",
  "spark": "Apache Spark",
  "airflow": "Apache Airflow",
  "kafka": "Apache Kafka",
  "hadoop": "Apache Hadoop",

  // APIs
  "rest": "REST APIs",
  "rest api": "REST APIs",
  "restful": "REST APIs",
  "graphql": "GraphQL",
  "grpc": "gRPC",
  "websocket": "WebSocket",
  "api": "API Integration",

  // Version control
  "version control": "Git",
  "vcs": "Git",
  "scm": "Git",
};

export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/^[•·●\-*]\s*/gm, "- ")
    .replace(/\f/g, "\n")
    .trim();
}

export function normalizeSkillName(skill: string): string {
  const key = skill.toLowerCase().trim().replace(/[.\-]/g, "");
  return SKILL_ALIASES[key] || skill;
}

// findAliasMatch is defined later with fuzzy matching support

/**
 * Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

/**
 * Compute similarity ratio (0.0 - 1.0) between two strings using Levenshtein distance.
 * 1.0 = identical, 0.0 = completely different.
 */
export function similarityRatio(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;
  const dist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return 1.0 - dist / maxLen;
}

/**
 * Fuzzy match: check if two strings are similar above a given threshold
 */
export function fuzzyMatch(a: string, b: string, threshold = 0.8): boolean {
  return similarityRatio(a.toLowerCase(), b.toLowerCase()) >= threshold;
}

/**
 * Find the best alias match for a requirement in CV text, with fuzzy fallback.
 * Returns null if nothing matches.
 */
export function findAliasMatch(
  cvText: string,
  requirement: string
): string | null {
  const cvLower = cvText.toLowerCase();
  const reqLower = requirement.toLowerCase().trim();

  // Direct match
  if (cvLower.includes(reqLower)) return `CV contains "${requirement}"`;

  // Check against normalized alias key
  const aliasKey = reqLower.replace(/[.\-]/g, "");
  const canonical = SKILL_ALIASES[aliasKey];
  if (canonical && cvLower.includes(canonical.toLowerCase())) {
    return `CV contains "${canonical}" (alias for "${requirement}")`;
  }

  // Check reverse: if the requirement is a canonical name, check its aliases in CV
  for (const [alias, canonicalName] of Object.entries(SKILL_ALIASES)) {
    if (canonicalName.toLowerCase() === reqLower) {
      const aliasNorm = alias.replace(/[.\-]/g, "");
      if (cvLower.includes(aliasNorm)) {
        return `CV contains "${alias}" (alias for "${canonicalName}")`;
      }
      const aliasKeyNorm = alias.toLowerCase().replace(/[.\-\s]/g, "");
      if (cvLower.includes(aliasKeyNorm)) {
        return `CV contains "${alias}" (alias for "${canonicalName}")`;
      }
    }
  }

  // Fuzzy match: check requirement against each word/term in CV
  const cvWords = new Set(cvLower.split(/[\s,]+/).filter(Boolean));
  for (const word of cvWords) {
    if (fuzzyMatch(word, reqLower, 0.8)) {
      return `CV contains "${word}" (fuzzy match for "${requirement}")`;
    }

    // Also fuzzy-check against alias keys
    const aliasKey2 = word.replace(/[.\-]/g, "");
    const canonicalFromWord = SKILL_ALIASES[aliasKey2];
    if (canonicalFromWord && fuzzyMatch(canonicalFromWord.toLowerCase(), reqLower, 0.75)) {
      return `CV contains "${word}" (fuzzy alias for "${requirement}" → "${canonicalFromWord}")`;
    }
  }

  return null;
}

/**
 * Calculate proportional partial score based on matched vs total items.
 * Returns 0-100 score.
 */
export function calculatePartialScore(matched: number, total: number): number {
  if (total <= 0) return 0;
  if (matched >= total) return 100;
  return Math.round((matched / total) * 100);
}

/**
 * Expand alias dictionary with domain-specific groupings
 */
export function getDomainKeywords(): Record<string, string[]> {
  return {
    frontend: ["react", "vue", "angular", "svelte", "html", "css", "javascript", "typescript", "frontend", "ui", "ux"],
    backend: ["node.js", "python", "java", "go", "rust", "ruby", "php", "c#", "backend", "server", "api", "rest"],
    cloud: ["aws", "gcp", "azure", "cloud", "serverless", "lambda", "ec2", "s3", "cloudformation"],
    devops: ["docker", "kubernetes", "k8s", "jenkins", "ci/cd", "terraform", "ansible", "github actions"],
    data: ["sql", "python", "pandas", "spark", "airflow", "etl", "data warehouse", "bigquery", "redshift"],
    mobile: ["swift", "kotlin", "react native", "flutter", "dart", "android", "ios"],
  };
}

export function getAliasMap(): Record<string, string> {
  return { ...SKILL_ALIASES };
}
