/**
 * Canonical GitHub language names + aliases for user search `language:` qualifiers.
 * @see https://docs.github.com/en/search-github/searching-on-github/searching-users
 */

const LANGUAGE_ALIASES = {
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  python: 'Python',
  py: 'Python',
  go: 'Go',
  golang: 'Go',
  rust: 'Rust',
  java: 'Java',
  kotlin: 'Kotlin',
  swift: 'Swift',
  ruby: 'Ruby',
  php: 'PHP',
  csharp: 'C#',
  'c#': 'C#',
  cs: 'C#',
  cpp: 'C++',
  'c++': 'C++',
  c: 'C',
  scala: 'Scala',
  elixir: 'Elixir',
  clojure: 'Clojure',
  haskell: 'Haskell',
  dart: 'Dart',
  r: 'R',
  shell: 'Shell',
  bash: 'Shell',
  powershell: 'PowerShell',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  vue: 'Vue',
  svelte: 'Svelte',
  objectivec: 'Objective-C',
  'objective-c': 'Objective-C',
  objc: 'Objective-C',
  perl: 'Perl',
  lua: 'Lua',
  zig: 'Zig',
  nim: 'Nim',
  julia: 'Julia',
  matlab: 'MATLAB',
  dockerfile: 'Dockerfile',
  hcl: 'HCL',
  terraform: 'HCL',
  nix: 'Nix',
  makefile: 'Makefile',
};

const MAX_TERM_LENGTH = 80;

/**
 * Strip characters that break GitHub search `q` syntax.
 */
function sanitizeSearchTerm(raw, maxLen = MAX_TERM_LENGTH) {
  if (raw == null) return '';
  return String(raw)
    .trim()
    .slice(0, maxLen)
    .replace(/[:"\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Quote multi-word phrases for GitHub search.
 */
function formatKeyword(term) {
  const cleaned = sanitizeSearchTerm(term);
  if (!cleaned) return null;
  if (/\s/.test(cleaned)) return `"${cleaned}"`;
  return cleaned;
}

/**
 * Map a skill/tech value to a GitHub `language:` name, or null if not a language.
 */
function resolveLanguage(raw) {
  const cleaned = sanitizeSearchTerm(raw);
  if (!cleaned) return null;

  const key = cleaned.toLowerCase().replace(/\s+/g, '');
  if (LANGUAGE_ALIASES[key]) return LANGUAGE_ALIASES[key];

  // Exact canonical match (e.g. "TypeScript")
  const canonical = Object.values(LANGUAGE_ALIASES).find(
    (name) => name.toLowerCase() === cleaned.toLowerCase()
  );
  return canonical || null;
}

/**
 * Convert skill/tech into either a language qualifier or a free-text keyword.
 * @returns {{ language: string|null, keyword: string|null }}
 */
function mapSkillOrTech(raw) {
  const cleaned = sanitizeSearchTerm(raw);
  if (!cleaned) return { language: null, keyword: null };

  const language = resolveLanguage(cleaned);
  if (language) return { language, keyword: null };

  return { language: null, keyword: formatKeyword(cleaned) };
}

module.exports = {
  LANGUAGE_ALIASES,
  MAX_TERM_LENGTH,
  sanitizeSearchTerm,
  formatKeyword,
  resolveLanguage,
  mapSkillOrTech,
};
