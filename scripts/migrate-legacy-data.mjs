#!/usr/bin/env node
// One-time migration: legacy flat-file subscribers + Firestore
// `subscribers`/`event_registrations` collections -> Postgres, via
// @nb-church/db's Prisma client. Run manually once:
//
//   node scripts/migrate-legacy-data.mjs
//
// Defensive by design (this touches real production data, once): every
// record is handled in its own try/catch so one bad row never aborts the
// run, and anything that can't be resolved (e.g. an event registration that
// doesn't match any known Announcement) is logged rather than dropped
// silently. Prints a summary count at the end.
//
// After this has been run and verified, the FIREBASE_* lines in the
// repo-root .env can be deleted and the key rotated in the Firebase console
// (see HANDOFF.md action items) — this script is the last thing that needs
// them.

import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { PrismaClient } from "../packages/db/generated/client/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");

loadEnv({ path: path.join(REPO_ROOT, ".env") });

const SUBSCRIBERS_JSON_PATH = path.join(
  REPO_ROOT,
  "_legacy-static-site/server/data/subscribers.json"
);

const summary = {
  subscribers: { seen: 0, created: 0, alreadyExisted: 0, failed: 0 },
  registrations: { seen: 0, created: 0, alreadyExisted: 0, unmatched: 0, failed: 0 },
};

async function readLocalSubscribers() {
  try {
    const raw = await readFile(SUBSCRIBERS_JSON_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn(`[migrate] ${SUBSCRIBERS_JSON_PATH} did not contain an array, skipping`);
      return [];
    }
    return parsed;
  } catch (err) {
    console.warn(`[migrate] could not read local subscribers file: ${err.message}`);
    return [];
  }
}

function initFirestore() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "[migrate] FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not set — " +
        "skipping Firestore export, only migrating the local subscribers.json file."
    );
    return null;
  }

  const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return getFirestore(app);
}

async function fetchFirestoreCollection(db, name) {
  if (!db) return [];
  try {
    const snapshot = await db.collection(name).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error(`[migrate] failed to read Firestore collection "${name}":`, err.message);
    return [];
  }
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : null;
}

async function migrateSubscribers(prisma, localSubscribers, firestoreSubscribers) {
  const byEmail = new Map();

  for (const raw of localSubscribers) {
    const email = normalizeEmail(raw.email ?? raw.to);
    if (!email) continue;
    byEmail.set(email, { email, name: raw.name ?? null, source: "legacy-json" });
  }
  for (const raw of firestoreSubscribers) {
    const email = normalizeEmail(raw.email ?? raw.id);
    if (!email) continue;
    if (!byEmail.has(email)) {
      byEmail.set(email, { email, name: raw.name ?? null, source: "legacy-firestore" });
    }
  }

  for (const subscriber of byEmail.values()) {
    summary.subscribers.seen += 1;
    try {
      const existing = await prisma.newsletterSubscriber.findUnique({
        where: { email: subscriber.email },
      });
      if (existing) {
        summary.subscribers.alreadyExisted += 1;
        continue;
      }
      await prisma.newsletterSubscriber.create({
        data: {
          email: subscriber.email,
          name: subscriber.name ?? undefined,
          status: "ACTIVE",
          source: subscriber.source,
        },
      });
      summary.subscribers.created += 1;
    } catch (err) {
      summary.subscribers.failed += 1;
      console.error(`[migrate] failed to migrate subscriber ${subscriber.email}:`, err.message);
    }
  }
}

function normalizeTitle(title) {
  return typeof title === "string" ? title.trim().toLowerCase() : "";
}

async function migrateEventRegistrations(prisma, firestoreRegistrations) {
  if (firestoreRegistrations.length === 0) return;

  const announcements = await prisma.announcement.findMany({
    select: { id: true, title: true },
  });
  const announcementByTitle = new Map(
    announcements.map((a) => [normalizeTitle(a.title), a.id])
  );

  for (const raw of firestoreRegistrations) {
    summary.registrations.seen += 1;
    const email = normalizeEmail(raw.email);
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const eventName = typeof raw.eventName === "string" ? raw.eventName.trim() : "";

    if (!email || !name) {
      summary.registrations.unmatched += 1;
      console.warn(
        `[migrate] skipping Firestore registration doc "${raw.id}" — missing name/email`
      );
      continue;
    }

    const announcementId = announcementByTitle.get(normalizeTitle(eventName));
    if (!announcementId) {
      summary.registrations.unmatched += 1;
      console.warn(
        `[migrate] no matching Announcement for legacy event "${eventName}" ` +
          `(registration doc "${raw.id}", ${email}) — leaving unmigrated, review manually`
      );
      continue;
    }

    try {
      const existing = await prisma.eventRegistration.findUnique({
        where: { announcementId_email: { announcementId, email } },
      });
      if (existing) {
        summary.registrations.alreadyExisted += 1;
        continue;
      }
      await prisma.eventRegistration.create({
        data: { announcementId, name, email, guestsCount: 1 },
      });
      summary.registrations.created += 1;
    } catch (err) {
      summary.registrations.failed += 1;
      console.error(
        `[migrate] failed to migrate registration for ${email} / "${eventName}":`,
        err.message
      );
    }
  }
}

async function main() {
  const prisma = new PrismaClient();
  const firestore = initFirestore();

  try {
    const [localSubscribers, firestoreSubscribers, firestoreRegistrations] = await Promise.all([
      readLocalSubscribers(),
      fetchFirestoreCollection(firestore, "subscribers"),
      fetchFirestoreCollection(firestore, "event_registrations"),
    ]);

    console.log(
      `[migrate] found ${localSubscribers.length} local subscriber(s), ` +
        `${firestoreSubscribers.length} Firestore subscriber(s), ` +
        `${firestoreRegistrations.length} Firestore event registration(s)`
    );

    await migrateSubscribers(prisma, localSubscribers, firestoreSubscribers);
    await migrateEventRegistrations(prisma, firestoreRegistrations);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n[migrate] Summary:");
  console.log(
    `  Subscribers   — seen: ${summary.subscribers.seen}, created: ${summary.subscribers.created}, ` +
      `already existed: ${summary.subscribers.alreadyExisted}, failed: ${summary.subscribers.failed}`
  );
  console.log(
    `  Registrations — seen: ${summary.registrations.seen}, created: ${summary.registrations.created}, ` +
      `already existed: ${summary.registrations.alreadyExisted}, ` +
      `unmatched: ${summary.registrations.unmatched}, failed: ${summary.registrations.failed}`
  );
}

main().catch((err) => {
  console.error("[migrate] fatal error:", err);
  process.exit(1);
});
