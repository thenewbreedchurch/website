#!/usr/bin/env node
/**
 * prepare-images.mjs
 *
 * Resizes, recompresses, and strips metadata from a curated set of legacy
 * congregation photos (originally raw ~6000x4000 Sony camera JPEGs, 9-20MB
 * each) into the clean, web-ready source images that live under
 * `apps/web/public/images/{section}/`. `next/image` generates responsive
 * AVIF/WebP variants from these at request time -- this script's only job
 * is to produce good, reasonably-sized, well-named SOURCE files.
 *
 * Curation was done visually (contact-sheet review of all 55 congregation
 * photos in `_legacy-static-site/client/images/`) -- see HANDOFF.md for the
 * full section-by-section rationale and file mapping.
 *
 * Usage:
 *   node scripts/prepare-images.mjs
 *
 * Idempotent: re-running skips any output file that's already newer than
 * its source (compare mtimes). Pass --force to reprocess everything.
 */

import sharp from 'sharp';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const SRC_DIR = path.join(REPO_ROOT, '_legacy-static-site/client/images');
const OUT_DIR = path.join(REPO_ROOT, 'apps/web/public/images');

const FORCE = process.argv.includes('--force');

// JPEG output quality (mozjpeg) by intended use.
const QUALITY = {
  hero: 80,
  section: 80, // about / first-timers / new-converts / announcements banners
  card: 78, // sermons / announcement card thumbnails
  general: 78,
  graphic: 90, // flat design graphics with text (e.g. connect.jpg) -- avoid JPEG artifacting on edges
};

/**
 * Curated source -> destination manifest.
 *
 * maxWidth follows the brief's guidance:
 *   2400px hero/full-bleed, 1600px section images, 800-1200px card/thumbnail images.
 *
 * A few standout "branded" shots (venue signage visible, or an
 * establishing wide shot of the sanctuary) are deliberately reused across
 * more than one section at different sizes -- that's intentional curation,
 * not an oversight.
 */
const MANIFEST = [
  // ---------------------------------------------------------------------
  // HERO -- homepage carousel / parallax, full-bleed. High-energy worship
  // and preaching shots.
  // ---------------------------------------------------------------------
  { source: 'DSC01008.jpg', dest: 'hero/hero-pulpit-lights.jpg', maxWidth: 2400, quality: QUALITY.hero },
  { source: 'DSC09454.jpg', dest: 'hero/hero-congregation-worship.jpg', maxWidth: 2400, quality: QUALITY.hero },
  { source: 'DSC09849.jpg', dest: 'hero/hero-sanctuary-wide.jpg', maxWidth: 2400, quality: QUALITY.hero },
  { source: 'DSC02683.jpg', dest: 'hero/hero-community-embrace.jpg', maxWidth: 2400, quality: QUALITY.hero },
  { source: 'DSC01799.jpg', dest: 'hero/hero-worship-vocals.jpg', maxWidth: 2400, quality: QUALITY.hero },
  { source: 'DSC09444.jpg', dest: 'hero/hero-preaching-purple.jpg', maxWidth: 2400, quality: QUALITY.hero },

  // ---------------------------------------------------------------------
  // ABOUT -- building/leadership/story feel.
  // ---------------------------------------------------------------------
  { source: 'DSC00357.jpg', dest: 'about/about-mission-worship.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 't-5.jpg', dest: 'about/about-vision-hall.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 'DSC00763.jpg', dest: 'about/about-livestream-audience.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 'DSC09849.jpg', dest: 'about/about-sanctuary-interior.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 'DSC02514.jpg', dest: 'about/about-scripture-hands.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 'DSC01115.jpg', dest: 'about/about-congregation-attentive.jpg', maxWidth: 1600, quality: QUALITY.section },

  // ---------------------------------------------------------------------
  // FIRST-TIMERS -- warm welcome / greeting / smiling / community feel.
  // ---------------------------------------------------------------------
  { source: 'DSC02404.jpg', dest: 'first-timers/first-timers-welcome-smiles.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 'DSC09417.jpg', dest: 'first-timers/first-timers-warm-embrace.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 'DSC00784.jpg', dest: 'first-timers/first-timers-joyful-celebration.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 'DSC00022.jpg', dest: 'first-timers/first-timers-community-moment.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 'DSC09939.jpg', dest: 'first-timers/first-timers-arrival.jpg', maxWidth: 1600, quality: QUALITY.section },

  // ---------------------------------------------------------------------
  // NEW-CONVERTS -- prayer / decision / altar-response feel.
  // ---------------------------------------------------------------------
  { source: 'DSC07307.jpg', dest: 'new-converts/new-converts-prayer-1.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 'DSC09486.jpg', dest: 'new-converts/new-converts-prayer-2.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 'DSC01000.jpg', dest: 'new-converts/new-converts-altar-prayer.jpg', maxWidth: 1600, quality: QUALITY.section },
  { source: 'DSC09491.jpg', dest: 'new-converts/new-converts-congregation-prayer.jpg', maxWidth: 1600, quality: QUALITY.section },

  // ---------------------------------------------------------------------
  // SERMONS -- preaching/pulpit shots, fallback thumbnails only (real
  // sermon thumbnails come from YouTube once that's wired up).
  // ---------------------------------------------------------------------
  { source: 'DSC00972.jpg', dest: 'sermons/sermons-preaching-1.jpg', maxWidth: 800, quality: QUALITY.card },
  { source: 'DSC09616.jpg', dest: 'sermons/sermons-preaching-2.jpg', maxWidth: 800, quality: QUALITY.card },
  { source: 'DSC01008.jpg', dest: 'sermons/sermons-preaching-3.jpg', maxWidth: 800, quality: QUALITY.card },

  // ---------------------------------------------------------------------
  // ANNOUNCEMENTS -- community events, sports days, outreach, gatherings.
  // ---------------------------------------------------------------------
  { source: 'DSC00905.jpg', dest: 'announcements/announcements-community-sports-1.jpg', maxWidth: 1200, quality: QUALITY.card },
  { source: 'DSC00942.jpg', dest: 'announcements/announcements-community-sports-2.jpg', maxWidth: 1200, quality: QUALITY.card },
  { source: 'DSC00553.jpg', dest: 'announcements/announcements-cultural-event.jpg', maxWidth: 1200, quality: QUALITY.card },
  { source: 'DSC09555.jpg', dest: 'announcements/announcements-cultural-gathering.jpg', maxWidth: 1200, quality: QUALITY.card },
  { source: 'DSC00808.jpg', dest: 'announcements/announcements-outdoor-fellowship.jpg', maxWidth: 1200, quality: QUALITY.card },
  { source: 'ubuntu2.jpg', dest: 'announcements/announcements-community-unity.jpg', maxWidth: 1200, quality: QUALITY.card },

  // ---------------------------------------------------------------------
  // GENERAL -- fallback/misc worship pool, usable across pages. Doesn't
  // force a section fit; just good, varied congregation/worship-team shots.
  // ---------------------------------------------------------------------
  { source: 'DSC00001.jpg', dest: 'general/general-worship-band-1.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC00045.jpg', dest: 'general/general-worship-band-2.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC00006.jpg', dest: 'general/general-worship-vocals-1.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC00278.jpg', dest: 'general/general-congregation-worship-1.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC00418.jpg', dest: 'general/general-worship-portrait.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC00609.jpg', dest: 'general/general-congregation-seated.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC01014.jpg', dest: 'general/general-audience-silhouette.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC01390.jpg', dest: 'general/general-worship-vocals-2.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC01796.jpg', dest: 'general/general-worship-vocals-branded.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC02318.jpg', dest: 'general/general-worship-silhouette.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC02445.jpg', dest: 'general/general-worship-vocals-branded-2.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC09452.jpg', dest: 'general/general-congregation-worship-2.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC09483.jpg', dest: 'general/general-worship-band-sax.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC09751.jpg', dest: 'general/general-worship-team.jpg', maxWidth: 1600, quality: QUALITY.general },
  { source: 'DSC09786.jpg', dest: 'general/general-worship-band-drummer.jpg', maxWidth: 1600, quality: QUALITY.general },
  // Not a congregation photo -- a designed social/CTA graphic ("Connect
  // With Us" + socials), confirmed used on the legacy linktree page.
  // Kept at higher quality/width so on-image text stays crisp.
  { source: 'connect.jpg', dest: 'general/general-connect-with-us.jpg', maxWidth: 1200, quality: QUALITY.graphic },
];

async function processOne({ source, dest, maxWidth, quality }) {
  const srcPath = path.join(SRC_DIR, source);
  const destPath = path.join(OUT_DIR, dest);

  if (!existsSync(srcPath)) {
    console.error(`  MISSING SOURCE: ${source} (skipping ${dest})`);
    return { status: 'missing' };
  }

  if (!FORCE && existsSync(destPath)) {
    const srcStat = statSync(srcPath);
    const destStat = statSync(destPath);
    if (destStat.mtimeMs >= srcStat.mtimeMs) {
      return { status: 'skipped' };
    }
  }

  mkdirSync(path.dirname(destPath), { recursive: true });

  await sharp(srcPath)
    .rotate() // auto-orient from EXIF before we strip it
    .resize({ width: maxWidth, withoutEnlargement: true })
    // .withMetadata() is intentionally never called: sharp strips all
    // EXIF/IPTC/XMP (including GPS) from the output by default. These are
    // real photos of real people/events -- stripping location metadata is
    // a privacy requirement, not just file-size hygiene.
    .jpeg({ quality, mozjpeg: true })
    .toFile(destPath);

  const { size } = statSync(destPath);
  return { status: 'written', size };
}

async function main() {
  console.log(`Preparing ${MANIFEST.length} images -> ${path.relative(REPO_ROOT, OUT_DIR)}${FORCE ? ' (--force)' : ''}\n`);

  let written = 0;
  let skipped = 0;
  let missing = 0;
  let totalBytes = 0;

  for (const entry of MANIFEST) {
    const result = await processOne(entry);
    if (result.status === 'written') {
      written++;
      totalBytes += result.size;
      console.log(`  wrote  ${entry.dest}  (${(result.size / 1024).toFixed(0)} KB)`);
    } else if (result.status === 'skipped') {
      skipped++;
      console.log(`  skip   ${entry.dest}  (up to date)`);
    } else {
      missing++;
    }
  }

  console.log(`\nDone. ${written} written, ${skipped} skipped, ${missing} missing.`);
  if (written > 0) {
    console.log(`New output this run: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  }
  if (missing > 0) {
    console.error(`\n${missing} manifest entr${missing === 1 ? 'y' : 'ies'} referenced a source file that doesn't exist -- check MANIFEST.`);
    process.exitCode = 1;
  }
}

main();
