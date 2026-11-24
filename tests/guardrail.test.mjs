import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');

test('production dist/index.html passes SEO, AEO JSON-LD, OpenGraph, and tag integrity guardrails', () => {
  const htmlPath = path.join(DIST, 'index.html');
  assert.ok(fs.existsSync(htmlPath), 'Run npm run build before guardrail tests');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1\.0"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /name="twitter:site" content="@1nc0gn30"/);
  assert.match(html, /name="twitter:creator" content="@1nc0gn30"/);

  // Extract JSON-LD
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ldMatch, 'JSON-LD script block must exist');
  const jsonLd = JSON.parse(ldMatch[1]);
  assert.ok(Array.isArray(jsonLd['@graph']), 'JSON-LD must declare @graph');
  const types = jsonLd['@graph'].map((n) => n['@type']);
  assert.ok(types.includes('WebApplication'), 'JSON-LD @graph must include WebApplication');
  assert.ok(types.includes('FAQPage'), 'JSON-LD @graph must include FAQPage');

  // Tag closure sanity
  assert.ok(html.includes('</head>') && html.includes('</body>') && html.includes('</html>'));
});

test('robots.txt, sitemap.xml, and netlify.toml meet production deployment guardrails', () => {
  const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
  for (const bot of ['User-agent: *', 'Googlebot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Applebot']) {
    assert.ok(robots.includes(bot), `robots.txt missing ${bot}`);
  }
  assert.match(robots, /Sitemap: https:\/\/cisa-grc-study-portal\.nealfrazier\.tech\/sitemap\.xml/);

  const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, /<loc>https:\/\/cisa-grc-study-portal\.nealfrazier\.tech\/<\/loc>/);
  assert.match(sitemap, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);

  const netlify = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
  assert.match(netlify, /publish = "dist"/);
  assert.match(netlify, /X-Frame-Options = "SAMEORIGIN"/);
  assert.match(netlify, /X-Content-Type-Options = "nosniff"/);
  assert.match(netlify, /from = "\/\*"/);
});

test('source enforces 100% open-access invariant (zero paywalls/DePay, Stripe coffee + Solana tip present)', () => {
  const appSource = fs.readFileSync(path.join(ROOT, 'src', 'App.tsx'), 'utf8');
  assert.ok(appSource.includes('https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X'), 'Missing Stripe Buy Us a Coffee link');
  assert.ok(appSource.includes('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK'), 'Missing Solana tip address');
  assert.doesNotMatch(appSource, /depay\.com|Founding Lifetime|Free Citizen Tier/i, 'Found forbidden paywall/DePay copy');
});
