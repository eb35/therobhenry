/**
 * Generate public/_redirects for legacy WordPress URLs on therobhenry.com.
 *
 * Fetches posts and pages from wordpress.therobhenry.com and writes 301 redirects
 * to the same path on the WordPress subdomain. Astro-owned paths are skipped.
 *
 * Usage: node scripts/generate-wp-redirects.mjs
 *        WORDPRESS_ORIGIN=https://wordpress.example.com node scripts/generate-wp-redirects.mjs
 */

import { writeFileSync } from 'node:fs';

const WORDPRESS_ORIGIN = (process.env.WORDPRESS_ORIGIN ?? 'https://wordpress.therobhenry.com').replace(
	/\/$/,
	'',
);
const WORDPRESS_HOST = new URL(WORDPRESS_ORIGIN).host;

/** Paths served by the Astro site — do not redirect to WordPress. */
const ASTRO_RESERVED = new Set([
	'/',
	'/about',
	'/about/',
	'/blog',
	'/blog/',
	'/rss.xml',
	'/sitemap-index.xml',
	'/sitemap-0.xml',
]);

const DYNAMIC_RULES = [
	['/category/*', `${WORDPRESS_ORIGIN}/category/:splat`],
	['/tag/*', `${WORDPRESS_ORIGIN}/tag/:splat`],
	['/author/*', `${WORDPRESS_ORIGIN}/author/:splat`],
	['/wp-content/*', `${WORDPRESS_ORIGIN}/wp-content/:splat`],
	['/wp-includes/*', `${WORDPRESS_ORIGIN}/wp-includes/:splat`],
	['/wp-admin/*', `${WORDPRESS_ORIGIN}/wp-admin/:splat`],
	['/wp-json/*', `${WORDPRESS_ORIGIN}/wp-json/:splat`],
];

const STATIC_RULES = [
	['/feed', `${WORDPRESS_ORIGIN}/feed`],
	['/feed/', `${WORDPRESS_ORIGIN}/feed/`],
	['/comments/feed', `${WORDPRESS_ORIGIN}/comments/feed`],
	['/comments/feed/', `${WORDPRESS_ORIGIN}/comments/feed/`],
	['/xmlrpc.php', `${WORDPRESS_ORIGIN}/xmlrpc.php`],
];

async function fetchAll(endpoint) {
	const items = [];
	let page = 1;

	while (true) {
		const url = new URL(endpoint, WORDPRESS_ORIGIN);
		url.searchParams.set('per_page', '100');
		url.searchParams.set('page', String(page));

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
		}

		const batch = await response.json();
		if (!Array.isArray(batch) || batch.length === 0) break;

		items.push(...batch);
		const totalPages = Number(response.headers.get('x-wp-totalpages') ?? '1');
		if (page >= totalPages) break;
		page += 1;
	}

	return items;
}

function pathFromLink(link) {
	const { pathname } = new URL(link);
	return pathname.endsWith('/') && pathname !== '/' ? pathname : `${pathname}/`;
}

function withoutTrailingSlash(path) {
	return path === '/' ? path : path.replace(/\/$/, '');
}

function addStaticRedirect(redirects, sourcePath) {
	if (ASTRO_RESERVED.has(sourcePath) || ASTRO_RESERVED.has(withoutTrailingSlash(sourcePath))) {
		return;
	}

	const withSlash = sourcePath.endsWith('/') ? sourcePath : `${sourcePath}/`;
	const withoutSlash = withoutTrailingSlash(withSlash);
	const destination = `${WORDPRESS_ORIGIN}${withSlash}`;

	for (const source of new Set([withSlash, withoutSlash])) {
		if (source === '/') continue;
		redirects.set(source, destination);
	}
}

async function main() {
	const [posts, pages] = await Promise.all([
		fetchAll('/wp-json/wp/v2/posts'),
		fetchAll('/wp-json/wp/v2/pages'),
	]);

	const staticRedirects = new Map();

	for (const item of [...posts, ...pages]) {
		addStaticRedirect(staticRedirects, pathFromLink(item.link));
	}

	for (const [source, destination] of STATIC_RULES) {
		staticRedirects.set(source, destination);
	}

	const lines = [
		'# Legacy WordPress URLs on therobhenry.com → wordpress subdomain.',
		'# Regenerate: npm run generate-redirects',
		`# Source: ${WORDPRESS_ORIGIN}`,
		'',
		'# Static redirects (posts, pages, feeds) — must appear before splat rules.',
	];

	for (const [source, destination] of [...staticRedirects.entries()].sort(([a], [b]) => a.localeCompare(b))) {
		lines.push(`${source} ${destination} 301`);
	}

	lines.push('', '# WordPress path prefixes (categories, tags, uploads, admin, API).');

	for (const [source, destination] of DYNAMIC_RULES) {
		lines.push(`${source} ${destination} 301`);
	}

	const output = `${lines.join('\n').trim()}\n`;
	writeFileSync('public/_redirects', output);

	console.log(
		`[generate-wp-redirects] Wrote ${staticRedirects.size} static + ${DYNAMIC_RULES.length} dynamic redirect(s) to public/_redirects (${WORDPRESS_HOST}).`,
	);
}

main().catch((error) => {
	console.error('[generate-wp-redirects] Failed:', error.message);
	process.exit(1);
});
