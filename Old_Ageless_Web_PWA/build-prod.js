/**
 * build-prod.js
 * Lightweight production build script (optional) for the Fitness Tracker.
 * Current frontend is plain static assets in /web. This script can:
 *  1. Copy /web to /dist/web
 *  2. Append a content hash to core JS/CSS filenames for cache busting
 *  3. Replace references inside HTML accordingly
 *  4. Emit a manifest (asset-manifest.json)
 *
 * NOTE: This is a scaffold; hashing logic is intentionally minimal and can
 * be replaced later by Vite / Rollup / esbuild if complexity grows.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const srcDir = path.resolve('web');
const outDir = path.resolve('dist/web');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

/** Recursively copy non-hashed assets */
function copyRecursive(src, dest){
	const stat = fs.statSync(src);
	if(stat.isDirectory()){
		fs.mkdirSync(dest, { recursive: true });
		for(const entry of fs.readdirSync(src)){
			copyRecursive(path.join(src, entry), path.join(dest, entry));
		}
	} else {
		fs.copyFileSync(src, dest);
	}
}

copyRecursive(srcDir, outDir);

// Files to hash (extend as needed)
const toHashGlobs = [/app\.js$/, /service-worker\.js$/];
const manifest = {};

function hashFile(filePath){
	const data = fs.readFileSync(filePath);
	const hash = crypto.createHash('sha256').update(data).digest('hex').slice(0,8);
	const dir = path.dirname(filePath);
	const base = path.basename(filePath);
	const newName = base.replace(/(\.\w+)$/, `.${hash}$1`);
	fs.renameSync(filePath, path.join(dir, newName));
	manifest[base] = newName;
}

function walkForHash(dir){
	for(const entry of fs.readdirSync(dir)){
		const full = path.join(dir, entry);
		const stat = fs.statSync(full);
		if(stat.isDirectory()) walkForHash(full);
		else if(toHashGlobs.some(r=>r.test(entry))) hashFile(full);
	}
}
walkForHash(outDir);

// Rewrite HTML references
function rewriteHtml(dir){
	for(const entry of fs.readdirSync(dir)){
		const full = path.join(dir, entry);
		const stat = fs.statSync(full);
		if(stat.isDirectory()) rewriteHtml(full);
		else if(/\.html?$/.test(entry)){
			let html = fs.readFileSync(full, 'utf8');
			for(const [orig, hashed] of Object.entries(manifest)){
				html = html.replace(new RegExp(orig, 'g'), hashed);
			}
			fs.writeFileSync(full, html);
		}
	}
}
rewriteHtml(outDir);

fs.writeFileSync(path.join(outDir, 'asset-manifest.json'), JSON.stringify(manifest, null, 2));
console.log('[build] Completed. Manifest:', manifest);
