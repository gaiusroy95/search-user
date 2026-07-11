const axios = require('axios');

/**
 * Parse committer email from a GitHub commit `.patch` body.
 * Header format:
 *   From: Name <email@example.com>
 *   Date: ...
 *   Subject: [PATCH] ...
 */
function parseEmailFromPatch(patchText) {
  if (!patchText || typeof patchText !== 'string') return null;

  const match = patchText.match(/^From:\s*(?:.*?<([^>\s]+)>|(\S+@\S+))/im);
  if (!match) return null;

  const email = (match[1] || match[2] || '').trim().replace(/^<|>$/g, '');
  if (!email || !email.includes('@')) return null;
  return email;
}

function isGithubNoreply(email) {
  if (!email) return true;
  const lower = email.toLowerCase();
  return (
    lower.endsWith('@users.noreply.github.com') ||
    lower.endsWith('@noreply.github.com')
  );
}

/**
 * Prefer a real mailbox over GitHub noreply addresses.
 */
function pickBestEmail(...candidates) {
  const cleaned = candidates
    .map((e) => (typeof e === 'string' ? e.trim() : ''))
    .filter((e) => e.includes('@'));

  const real = cleaned.find((e) => !isGithubNoreply(e));
  return real || cleaned[0] || null;
}

/**
 * Fetch a public commit `.patch` file from github.com (not the REST API).
 */
async function fetchCommitPatch(patchUrl) {
  if (!patchUrl) return null;

  const url = patchUrl.endsWith('.patch') ? patchUrl : `${patchUrl}.patch`;

  const { data } = await axios.get(url, {
    headers: {
      Accept: 'text/plain',
      'User-Agent': 'github-developer-discovery-app',
    },
    timeout: 15000,
    // Patches can be large; we only need the header lines
    maxContentLength: 256 * 1024,
    maxBodyLength: 256 * 1024,
    responseType: 'text',
    transformResponse: [(body) => body],
    validateStatus: (status) => status >= 200 && status < 300,
  });

  // Only need the top of the patch for the From: header
  const head =
    typeof data === 'string' ? data.slice(0, 4096) : String(data).slice(0, 4096);
  return parseEmailFromPatch(head);
}

module.exports = {
  parseEmailFromPatch,
  isGithubNoreply,
  pickBestEmail,
  fetchCommitPatch,
};
