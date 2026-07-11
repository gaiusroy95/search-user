/**
 * Engineering stack filters for GitHub user discovery.
 * Maps product stacks → search query bias + language/bio matching.
 */

const VALID_STACKS = ['frontend', 'backend', 'fullstack', 'devops'];

/** Free-text clauses appended to the GitHub user search query (bio/login/name). */
const STACK_QUERY_TERMS = {
  frontend:
    '(frontend OR "front-end" OR react OR vue OR angular OR svelte OR nextjs OR "ui engineer")',
  backend:
    '(backend OR "back-end" OR django OR spring OR rails OR fastapi OR nestjs OR golang OR "api engineer")',
  fullstack: '("full stack" OR fullstack OR "full-stack" OR "full stack developer")',
  devops:
    '(devops OR sre OR kubernetes OR terraform OR ansible OR docker OR "platform engineer" OR "site reliability")',
};

const FRONTEND_LANGUAGES = new Set([
  'JavaScript',
  'TypeScript',
  'HTML',
  'CSS',
  'Vue',
  'Svelte',
  'Dart',
]);

const BACKEND_LANGUAGES = new Set([
  'Python',
  'Java',
  'Go',
  'Ruby',
  'Rust',
  'C#',
  'PHP',
  'Kotlin',
  'Scala',
  'C++',
  'C',
  'Elixir',
  'Clojure',
]);

const DEVOPS_LANGUAGES = new Set([
  'Shell',
  'Dockerfile',
  'HCL',
  'Python',
  'Go',
  'PowerShell',
  'Makefile',
  'Nix',
]);

const STACK_LANGUAGES = {
  frontend: FRONTEND_LANGUAGES,
  backend: BACKEND_LANGUAGES,
  fullstack: null,
  devops: DEVOPS_LANGUAGES,
};

const STACK_BIO_KEYWORDS = {
  frontend: [
    'frontend',
    'front-end',
    'front end',
    'react',
    'vue',
    'angular',
    'svelte',
    'next.js',
    'nextjs',
    'ui engineer',
    'web developer',
  ],
  backend: [
    'backend',
    'back-end',
    'back end',
    'api engineer',
    'server-side',
    'django',
    'spring',
    'rails',
    'fastapi',
    'nestjs',
    'golang',
  ],
  fullstack: ['full stack', 'fullstack', 'full-stack', 'full stack developer'],
  devops: [
    'devops',
    'dev ops',
    'sre',
    'kubernetes',
    'k8s',
    'terraform',
    'ansible',
    'docker',
    'infrastructure',
    'platform engineer',
    'site reliability',
    'ci/cd',
    'cicd',
  ],
};

function normalizeStack(value) {
  if (value == null || value === '' || value === 'any') return null;
  const stack = String(value).trim().toLowerCase().replace(/[\s_-]+/g, '');
  const aliases = {
    frontend: 'frontend',
    front: 'frontend',
    fe: 'frontend',
    backend: 'backend',
    back: 'backend',
    be: 'backend',
    fullstack: 'fullstack',
    full: 'fullstack',
    devops: 'devops',
    sre: 'devops',
  };
  const mapped = aliases[stack] || stack;
  return VALID_STACKS.includes(mapped) ? mapped : null;
}

function getStackQueryClause(stack) {
  return STACK_QUERY_TERMS[stack] || null;
}

function textMatchesKeywords(text, keywords) {
  if (!text) return false;
  const hay = text.toLowerCase();
  return keywords.some((kw) => hay.includes(kw));
}

function hasLanguageOverlap(languages, languageSet) {
  if (!languageSet || !languages?.length) return false;
  return languages.some((lang) => languageSet.has(lang));
}

/**
 * Stack filtering for search relies on the GitHub query clause only.
 * We no longer fetch repos/languages during search, so skip post-filtering.
 */
function matchesStack(_profile, stack) {
  return true;
}

module.exports = {
  VALID_STACKS,
  STACK_QUERY_TERMS,
  STACK_LANGUAGES,
  STACK_BIO_KEYWORDS,
  normalizeStack,
  getStackQueryClause,
  matchesStack,
};
