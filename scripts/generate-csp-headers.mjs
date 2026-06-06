/**
 * Cloudflare Workers static assets read CSP from _headers, not HTML meta tags.
 * Astro emits CSP as <meta http-equiv="content-security-policy"> when the
 * Cloudflare adapter lacks staticHeaders. This script copies each page's CSP
 * into dist/client/_headers so scanners and curl see Content-Security-Policy.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT_DIR = 'dist/client';
const BASELINE_HEADERS = readFileSync('public/_headers', 'utf8').trim();
const CSP_META_RE =
	/<meta\s+http-equiv="content-security-policy"\s+content="([^"]*)"\s*\/?>/i;

function walkHtmlFiles(dir, files = []) {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) {
			walkHtmlFiles(path, files);
		} else if (name.endsWith('.html')) {
			files.push(path);
		}
	}
	return files;
}

/** @param {string} file */
function toRoutePath(file) {
	const rel = relative(OUT_DIR, file).replace(/\\/g, '/');
	if (rel === 'index.html') return '/';
	return `/${rel.replace(/\/index\.html$/, '')}`;
}

const routes = [];

for (const file of walkHtmlFiles(OUT_DIR)) {
	const html = readFileSync(file, 'utf8');
	const match = html.match(CSP_META_RE);
	if (!match) continue;

	const path = toRoutePath(file);
	routes.push({ path, csp: match[1] });
}

if (routes.length === 0) {
	console.warn('[generate-csp-headers] No CSP meta tags found in HTML output.');
	process.exit(0);
}

routes.sort((a, b) => b.path.length - a.path.length);

const lines = [BASELINE_HEADERS, ''];

for (const { path, csp } of routes) {
	lines.push(path, `  Content-Security-Policy: ${csp}`, '');
}

writeFileSync(join(OUT_DIR, '_headers'), `${lines.join('\n').trim()}\n`);
console.log(`[generate-csp-headers] Wrote CSP for ${routes.length} HTML route(s) to dist/client/_headers`);
