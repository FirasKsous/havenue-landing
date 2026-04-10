/**
 * Visual validation script — takes screenshots of key sections
 * at 1440px viewport to verify animations, layout, and image sizing.
 *
 * Usage: npx puppeteer browsers install chrome && node screenshot-test.mjs
 */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const VIEWPORT = { width: 1440, height: 900 };
const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:5173';
const OUTPUT_DIR = './screenshots';

// Sections to capture with their scroll targets
const SECTIONS = [
  { name: '01-hero', selector: '#hero', waitMs: 500 },
  { name: '02-feature-ocr', selector: '#features', waitMs: 1500 },
  { name: '03-menu-builder', selector: '#menu-builder', waitMs: 1500 },
  { name: '04-safety-engine', selector: '#safety-engine', waitMs: 1500 },
  { name: '05-testimonials', selector: '#testimonials', waitMs: 1500 },
  { name: '06-pricing', selector: '#pricing', waitMs: 1500 },
  { name: '07-full-page', selector: null, waitMs: 500 },
];

async function run() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  console.log(`Navigating to ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for initial render and fonts
  await new Promise(r => setTimeout(r, 2000));

  for (const section of SECTIONS) {
    if (section.name === '07-full-page') {
      // Full page screenshot
      console.log(`Capturing full page...`);
      await page.screenshot({
        path: `${OUTPUT_DIR}/${section.name}.png`,
        fullPage: true,
      });
      console.log(`  -> saved ${section.name}.png`);
      continue;
    }

    console.log(`Scrolling to ${section.name} (${section.selector})...`);

    // Scroll to section
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }, section.selector);

    // Wait for scroll and animations to complete
    await new Promise(r => setTimeout(r, section.waitMs));

    // Take screenshot of visible viewport
    await page.screenshot({
      path: `${OUTPUT_DIR}/${section.name}.png`,
    });
    console.log(`  -> saved ${section.name}.png`);

    // Also capture element-specific screenshot for detail
    try {
      const element = await page.$(section.selector);
      if (element) {
        await element.screenshot({
          path: `${OUTPUT_DIR}/${section.name}-element.png`,
        });
        console.log(`  -> saved ${section.name}-element.png`);
      }
    } catch (e) {
      console.log(`  -> element screenshot skipped: ${e.message}`);
    }
  }

  // Additional: capture animation states by scrolling slowly
  console.log('\nCapturing animation mid-states...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));

  // Scroll to just before FeatureOCR to catch animation start
  const ocrSection = await page.$('#features');
  if (ocrSection) {
    const box = await ocrSection.boundingBox();
    if (box) {
      // Scroll to 200px above the section to trigger the observer
      await page.evaluate((y) => window.scrollTo(0, y - 200), box.y);
      await new Promise(r => setTimeout(r, 100)); // Catch mid-animation
      await page.screenshot({ path: `${OUTPUT_DIR}/ocr-animation-start.png` });
      console.log('  -> saved ocr-animation-start.png');

      await new Promise(r => setTimeout(r, 400)); // Mid animation
      await page.screenshot({ path: `${OUTPUT_DIR}/ocr-animation-mid.png` });
      console.log('  -> saved ocr-animation-mid.png');

      await new Promise(r => setTimeout(r, 500)); // After animation
      await page.screenshot({ path: `${OUTPUT_DIR}/ocr-animation-end.png` });
      console.log('  -> saved ocr-animation-end.png');
    }
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to ./screenshots/');
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err.message);
  process.exit(1);
});
