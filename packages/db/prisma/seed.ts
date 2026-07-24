import crypto from "node:crypto";
import argon2 from "argon2";
import { prisma } from "../index";

// Real production content ported from the legacy static site
// (_legacy-static-site/client/index.html, about.html, donate.html) — not
// placeholder data. See HANDOFF.md for what still needs church review.

async function main() {
  await prisma.churchSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      orgName: "The New Breed Church",
      tagline: "A place to grow in faith, hope, and love",
      missionStatement:
        "To raise a generation of believers who are rooted in the Word, alive in worship, and committed to serving God and their community.",
      visionStatement:
        "A New Breed of believers walking in the fullness of God's purpose for their lives.",
      streetAddress: "8th Floor Trinity Towers, Chief Yesufu Abiodun Way",
      addressLocality: "Victoria Island",
      addressRegion: "Lagos",
      addressCountry: "Nigeria",
      phone: "+234 916 150 9000",
      email: "admin@thenewbreedchurch.org",
      instagramUrl:
        "https://www.instagram.com/the_newbreedchurch?igsh=MXAxeHV6eHFuOW5yOA==",
      youtubeUrl: "https://www.youtube.com/@the_newbreedchurch",
      livestreamUrl: "https://www.youtube.com/@the_newbreedchurch/live",
      memberRegistrationUrl:
        "https://apps.thenewbreedchurch.org/mebership-form",
      onlineMeetingUrl: "https://meet.google.com/zkb-qrmi-ooy",
    },
  });

  const serviceTimes: Array<Parameters<typeof prisma.serviceTime.create>[0]["data"]> = [
    {
      dayOfWeek: "SUN",
      label: "Sunday School",
      startTime: "08:00",
      endTime: "09:00",
      sortOrder: 0,
    },
    {
      dayOfWeek: "SUN",
      label: "Sunday Service",
      startTime: "09:00",
      endTime: "11:00",
      sortOrder: 1,
    },
    {
      dayOfWeek: "WED",
      label: "Bible Study",
      startTime: "20:00",
      endTime: "21:00",
      isOnline: true,
      onlineUrl: "https://meet.google.com/zkb-qrmi-ooy",
      sortOrder: 2,
    },
    {
      dayOfWeek: "MON",
      label: "Morning Prayers",
      startTime: "07:00",
      endTime: "07:15",
      isOnline: true,
      onlineUrl: "https://meet.google.com/zkb-qrmi-ooy",
      sortOrder: 3,
    },
    {
      dayOfWeek: "MON",
      label: "Night Prayers",
      startTime: "21:00",
      endTime: "21:30",
      isOnline: true,
      onlineUrl: "https://meet.google.com/zkb-qrmi-ooy",
      sortOrder: 4,
    },
  ];

  // Morning/Night prayers run Mon-Sat; expand the MON template across TUE-SAT
  // rather than repeating the literal object six times.
  const dailyPrayerDays: Array<(typeof serviceTimes)[number]["dayOfWeek"]> = [
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
  ];
  for (const day of dailyPrayerDays) {
    const morning = serviceTimes.find(
      (s) => s.dayOfWeek === "MON" && s.label === "Morning Prayers"
    )!;
    const night = serviceTimes.find(
      (s) => s.dayOfWeek === "MON" && s.label === "Night Prayers"
    )!;
    serviceTimes.push({ ...morning, dayOfWeek: day }, { ...night, dayOfWeek: day });
  }

  for (const st of serviceTimes) {
    const existing = await prisma.serviceTime.findFirst({
      where: { dayOfWeek: st.dayOfWeek, label: st.label },
    });
    if (!existing) {
      await prisma.serviceTime.create({ data: st });
    }
  }

  // Monthly recurring evangelism ("last Saturday monthly" in the legacy footer)
  // modeled as an Announcement with an RRULE rather than a ServiceTime, since
  // it's occasional/outreach rather than the fixed weekly rhythm.
  await prisma.announcement.upsert({
    where: { slug: "monthly-evangelism" },
    update: {},
    create: {
      slug: "monthly-evangelism",
      title: "Evangelism Outreach",
      description:
        "Join us as we go out into the community to share the gospel and serve our neighbors.",
      category: "OUTREACH",
      startDateTime: nextLastSaturdayOfMonth(),
      recurrenceRule: "FREQ=MONTHLY;BYDAY=-1SA",
      status: "PUBLISHED",
      registrationRequired: true,
    },
  });

  const givingAccounts: Array<Parameters<typeof prisma.givingAccount.create>[0]["data"]> = [
    {
      fundName: "Offerings & Tithe",
      currency: "NGN",
      bankName: "Zenith Bank",
      accountNumber: "1224393356",
      accountName: "R.C.C.G The New Breed Church",
      sortOrder: 0,
    },
    {
      fundName: "Offerings & Tithe",
      currency: "USD",
      bankName: "Zenith Bank",
      accountNumber: "5075240416",
      accountName: "RCCG COD NEW BREED",
      sortOrder: 1,
    },
    {
      fundName: "Favoured Fund",
      currency: "NGN",
      bankName: "Globus Bank",
      accountNumber: "1000059065",
      accountName: "RCCG CITY OF DAVID",
      sortOrder: 2,
    },
    {
      fundName: "Favoured Fund",
      currency: "USD",
      bankName: "Zenith Bank",
      accountNumber: "5075240416",
      accountName: "RCCG COD NEW BREED",
      sortOrder: 3,
    },
  ];

  for (const acct of givingAccounts) {
    const existing = await prisma.givingAccount.findFirst({
      where: {
        fundName: acct.fundName,
        currency: acct.currency,
        accountNumber: acct.accountNumber,
      },
    });
    if (!existing) {
      await prisma.givingAccount.create({ data: acct });
    }
  }

  // Real sermons ported verbatim from the legacy homepage's "Latest Sermons"
  // cards (_legacy-static-site/client/index.html) — title/speaker/date/
  // scripture/YouTube link are all real, not invented. Thumbnails use the
  // curated sermons/ fallback photos from Phase F since the legacy site's own
  // sermon-thumbnail CSS rules never had real backing image files (confirmed
  // dead by that phase's grep sweep). Homepage teaser queries this table live
  // (orderBy publishedAt desc, take 3) rather than hardcoding these cards.
  const sermons: Array<Parameters<typeof prisma.sermon.create>[0]["data"]> = [
    {
      slug: "kingdom-excellence-part-2",
      title: "Kingdom Excellence - Part 2",
      speaker: "Min. Michael Ilegar",
      scripture: "1 Corinthians 11:1, Romans 14:14-18",
      videoUrl: "https://youtu.be/emUxxdXcWJw?si=s_vm_Pc5rvLsPZbv",
      thumbnailUrl: "/images/sermons/sermons-preaching-1.jpg",
      publishedAt: new Date("2025-09-14"),
    },
    {
      slug: "kingdom-excellence-part-1",
      title: "Kingdom Excellence - Part 1",
      speaker: "Min. Michael Ilegar",
      scripture: "Daniel 6:3",
      videoUrl: "https://youtu.be/hbL6nvJ29Sc?si=PkAuYN_RL6mQ-DLZ",
      thumbnailUrl: "/images/sermons/sermons-preaching-2.jpg",
      publishedAt: new Date("2025-09-07"),
    },
    {
      slug: "the-power-of-small",
      title: "The Power of Small",
      speaker: "Min. Segun Ogbeyemi",
      scripture: "Luke 18:1",
      videoUrl: "https://youtu.be/JM5no3uAmRI?si=KVkoWs5hi83g6qUk",
      thumbnailUrl: "/images/sermons/sermons-preaching-3.jpg",
      publishedAt: new Date("2025-08-10"),
    },
  ];
  for (const sermon of sermons) {
    await prisma.sermon.upsert({
      where: { slug: sermon.slug! },
      update: {},
      create: sermon,
    });
  }

  // Real testimonies, used verbatim from the legacy homepage's "Testimonies"
  // section — these are real congregants' own words and must never be
  // rewritten/paraphrased. No photos exist for these authors in the legacy
  // site, so authorPhotoUrl is left null rather than substituting a stock
  // photo. publishedAt dates are approximate (the legacy site didn't record
  // exact submission dates) and only exist to give deterministic ordering.
  const testimonies: Array<Parameters<typeof prisma.testimony.create>[0]["data"]> = [
    {
      authorName: "Tomiyetan",
      body:
        "I thank God for the salvation of my soul, journey mercies for my recent exam trip, and for turning a negative work restructuring into something positive. God truly answers prayers!",
      isApproved: true,
      isFeatured: true,
      publishedAt: new Date("2025-09-21"),
    },
    {
      authorName: "Mary O.",
      body:
        "I'm so thankful to God. I completed both my ICAN and CIS exams in the past year and I'm now chartered! I also just got promoted at work. God has been faithful through it all.",
      isApproved: true,
      isFeatured: true,
      publishedAt: new Date("2025-09-14"),
    },
    {
      authorName: "Timilehin T.",
      body:
        "Three Sundays ago, I missed church because my ceiling POP came crashing down in the middle of the night. It was terrifying, but I thank God no one was harmed. I could've been walking there at that moment. Thank God for divine protection.",
      isApproved: true,
      isFeatured: true,
      publishedAt: new Date("2025-09-07"),
    },
  ];
  for (const testimony of testimonies) {
    const existing = await prisma.testimony.findFirst({
      where: { authorName: testimony.authorName, body: testimony.body },
    });
    if (!existing) {
      await prisma.testimony.create({ data: testimony });
    }
  }

  // Leadership named in the legacy about.html — confirm spelling/titles with
  // the church before publishing photos (see HANDOFF.md open items).
  // Pastor Idowu Iluyomade is no longer with the church (removed per the
  // church's explicit request) — not seeded here, and the pre-existing DB
  // row was deleted directly.
  const staff: Array<Parameters<typeof prisma.staffMember.create>[0]["data"]> = [
    { name: "Pastor Gbenga Olaniyan", role: "Pastor", sortOrder: 0 },
  ];
  for (const member of staff) {
    const existing = await prisma.staffMember.findFirst({
      where: { name: member.name },
    });
    if (!existing) {
      await prisma.staffMember.create({ data: member });
    }
  }

  // Next-step content for the First Timers and New Converts pages. Draft
  // pastoral copy — flagged in HANDOFF.md as pending review by a church
  // leader before launch, per the project's explicit requirement not to
  // present invented pastoral/theological language as final.
  const nextSteps: Array<Parameters<typeof prisma.nextStep.create>[0]["data"]> = [
    {
      page: "FIRST_TIMER",
      title: "Say Hello",
      body: "Look out for a member of our welcome team when you arrive — introduce yourself, we'd love to meet you and help you find your way around.",
      ctaLabel: "Message us before you come",
      ctaUrl: "/contact",
      sortOrder: 0,
    },
    {
      page: "FIRST_TIMER",
      title: "Register as a First Timer",
      body: "Fill out a short form so we can follow up, answer any questions, and keep you in the loop on what's happening at New Breed.",
      ctaLabel: "Register now",
      ctaUrl: "https://apps.thenewbreedchurch.org/mebership-form",
      sortOrder: 1,
    },
    {
      page: "FIRST_TIMER",
      title: "Join Us Again",
      body: "Come back for a Sunday Service, or join us online for Wednesday Bible Study — either way, we'd love to keep worshipping alongside you.",
      ctaLabel: "See this week's activities",
      ctaUrl: "/announcements",
      sortOrder: 2,
    },
    {
      page: "NEW_CONVERT",
      title: "Get Baptized",
      body: "Baptism is a public declaration of your new life in Christ. Find the leader who oversees baptism and reach out to learn about our next class.",
      ctaLabel: "Find a leader",
      ctaUrl: "/leadership",
      sortOrder: 0,
    },
    {
      page: "NEW_CONVERT",
      title: "Join Bible Study",
      body: "Our Wednesday Bible Study is a low-pressure place to ask questions and grow in the Word alongside others who are on the same journey.",
      ctaLabel: "Join online, Wednesdays 8-9PM",
      ctaUrl: "https://meet.google.com/zkb-qrmi-ooy",
      sortOrder: 1,
    },
    {
      page: "NEW_CONVERT",
      title: "Meet a Leader",
      body: "You don't have to figure this out alone. Browse our leadership team and reach out to whoever's the right fit for you.",
      ctaLabel: "See our leaders",
      ctaUrl: "/leadership",
      sortOrder: 2,
    },
    {
      page: "NEW_CONVERT",
      title: "Find a Place to Serve",
      body: "Serving is one of the fastest ways to grow and belong. From welcoming guests to worship, there's a place for you on a team.",
      ctaLabel: "Ask how to get involved",
      ctaUrl: "/contact",
      sortOrder: 3,
    },
    {
      page: "NEW_CONVERT",
      title: "Keep Showing Up",
      body: "Consistency matters more than perfection. Join us for Sunday Service and let this become a rhythm in your life.",
      ctaLabel: "Plan your next visit",
      ctaUrl: "/announcements",
      sortOrder: 4,
    },
  ];
  for (const step of nextSteps) {
    const existing = await prisma.nextStep.findFirst({
      where: { page: step.page, title: step.title },
    });
    if (!existing) {
      await prisma.nextStep.create({ data: step });
    }
  }

  // Bootstrap admin accounts for every allowlisted email. If ADMIN_FIXED_PASSWORD
  // is set (this church's small, closed admin list uses a known shared password
  // by deliberate choice — see HANDOFF.md — rather than the per-account random
  // flow below), every allowlisted email is kept in sync with it on every seed
  // run: existing rows get their password updated too, not just newly-created
  // ones, so rotating the env var and reseeding is enough to change it — no
  // code edit required. mustChangePassword is left off in this mode since the
  // real credential IS the deliberately-chosen one, not a placeholder.
  //
  // Without ADMIN_FIXED_PASSWORD set, falls back to the original flow: each
  // NEW allowlisted email gets a random one-time password (never reused,
  // never logged anywhere but this local console), marked mustChangePassword
  // so the real credential is chosen by the person logging in. Existing
  // accounts are left untouched in this mode.
  const adminEmails = (process.env.ADMIN_ALLOWLIST_EMAILS ?? "churchnewbreed@gmail.com")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const fixedPassword = process.env.ADMIN_FIXED_PASSWORD;

  if (fixedPassword) {
    const passwordHash = await argon2.hash(fixedPassword, { type: argon2.argon2id });
    for (const email of adminEmails) {
      await prisma.adminUser.upsert({
        where: { email },
        create: { email, passwordHash, mustChangePassword: false, emailVerifiedAt: new Date() },
        update: {
          passwordHash,
          mustChangePassword: false,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
      console.log(`[seed] Synced admin account for ${email} to ADMIN_FIXED_PASSWORD`);
    }
  } else {
    for (const email of adminEmails) {
      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing) continue;

      const tempPassword = crypto.randomBytes(18).toString("base64url");
      const passwordHash = await argon2.hash(tempPassword, { type: argon2.argon2id });

      await prisma.adminUser.create({
        data: { email, passwordHash, mustChangePassword: true },
      });

      console.log(
        `\n[seed] Created admin account for ${email}\n` +
          `[seed] One-time temporary password: ${tempPassword}\n` +
          `[seed] This is shown ONCE and not stored anywhere in plaintext — ` +
          `save it now. You will be required to set a new password on first login.\n`
      );
    }
  }

  console.log("Seed complete.");
}

function nextLastSaturdayOfMonth(from = new Date()): Date {
  const year = from.getFullYear();
  const month = from.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  const offset = (lastDay.getDay() - 6 + 7) % 7;
  const lastSaturday = new Date(year, month, lastDay.getDate() - offset);
  lastSaturday.setHours(10, 0, 0, 0);
  if (lastSaturday < from) {
    return nextLastSaturdayOfMonth(new Date(year, month + 1, 1));
  }
  return lastSaturday;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
