import puppeteer from 'puppeteer-core';
import { mkdirSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), 'temporary screenshots');
mkdirSync(DIR, { recursive: true });

const url   = process.argv[2] ?? 'http://localhost:3000';
const label = process.argv[3] ?? '';

const existing = readdirSync(DIR).filter(f => f.endsWith('.png'));
const n = existing.length + 1;
const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const outPath  = join(DIR, filename);

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
// Wait for reveal fallback (1500ms) + loremflickr images + 3D init
await new Promise(r => setTimeout(r, 3500));
const fullPage = process.env.FULL !== '0';
await page.screenshot({ path: outPath, fullPage });
await browser.close();
console.log(`Saved: ${outPath}`);
