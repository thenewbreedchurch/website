-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "AnnouncementCategory" AS ENUM ('SERVICE', 'OUTREACH', 'YOUTH', 'SPECIAL', 'FUNDRAISER', 'OTHER');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('ACTIVE', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'READ', 'RESPONDED');

-- CreateEnum
CREATE TYPE "NextStepPage" AS ENUM ('FIRST_TIMER', 'NEW_CONVERT');

-- CreateTable
CREATE TABLE "ChurchSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "orgName" TEXT NOT NULL DEFAULT 'The New Breed Church',
    "tagline" TEXT NOT NULL DEFAULT 'A place to grow in faith, hope, and love',
    "missionStatement" TEXT NOT NULL DEFAULT '',
    "visionStatement" TEXT NOT NULL DEFAULT '',
    "streetAddress" TEXT NOT NULL DEFAULT '8th Floor Trinity Towers, Chief Yesufu Abiodun Way',
    "addressLocality" TEXT NOT NULL DEFAULT 'Victoria Island',
    "addressRegion" TEXT NOT NULL DEFAULT 'Lagos',
    "addressCountry" TEXT NOT NULL DEFAULT 'Nigeria',
    "phone" TEXT NOT NULL DEFAULT '+234 916 150 9000',
    "email" TEXT NOT NULL DEFAULT 'churchnewbreed@gmail.com',
    "mapEmbedUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT DEFAULT 'https://www.instagram.com/the_newbreedchurch',
    "youtubeUrl" TEXT DEFAULT 'https://www.youtube.com/@the_newbreedchurch',
    "tiktokUrl" TEXT,
    "livestreamUrl" TEXT DEFAULT 'https://rccgtnbc.mixlr.com',
    "memberRegistrationUrl" TEXT DEFAULT 'https://admin.thenewbreedchurch.org/welcome/add-member',
    "onlineMeetingUrl" TEXT DEFAULT 'https://meet.google.com/zkb-qrmi-ooy',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTime" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "label" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "onlineUrl" TEXT,
    "location" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AnnouncementCategory" NOT NULL DEFAULT 'OTHER',
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3),
    "recurrenceRule" TEXT,
    "location" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "onlineUrl" TEXT,
    "heroImageUrl" TEXT,
    "registrationRequired" BOOLEAN NOT NULL DEFAULT false,
    "registrationDeadline" TIMESTAMP(3),
    "capacity" INTEGER,
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "guestsCount" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT,
    "unsubscribeToken" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sermon" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "series" TEXT,
    "scripture" TEXT,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sermon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimony" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorPhotoUrl" TEXT,
    "body" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Testimony_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "photoUrl" TEXT,
    "bio" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GivingAccount" (
    "id" TEXT NOT NULL,
    "fundName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "swiftCode" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GivingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NextStep" (
    "id" TEXT NOT NULL,
    "page" "NextStepPage" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NextStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceTime_isActive_dayOfWeek_sortOrder_idx" ON "ServiceTime"("isActive", "dayOfWeek", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Announcement_slug_key" ON "Announcement"("slug");

-- CreateIndex
CREATE INDEX "Announcement_status_startDateTime_idx" ON "Announcement"("status", "startDateTime");

-- CreateIndex
CREATE INDEX "Announcement_category_status_idx" ON "Announcement"("category", "status");

-- CreateIndex
CREATE INDEX "EventRegistration_announcementId_createdAt_idx" ON "EventRegistration"("announcementId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_announcementId_email_key" ON "EventRegistration"("announcementId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeToken_key" ON "NewsletterSubscriber"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_status_subscribedAt_idx" ON "NewsletterSubscriber"("status", "subscribedAt");

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Sermon_slug_key" ON "Sermon"("slug");

-- CreateIndex
CREATE INDEX "Sermon_publishedAt_idx" ON "Sermon"("publishedAt");

-- CreateIndex
CREATE INDEX "Testimony_isApproved_isFeatured_publishedAt_idx" ON "Testimony"("isApproved", "isFeatured", "publishedAt");

-- CreateIndex
CREATE INDEX "StaffMember_isActive_sortOrder_idx" ON "StaffMember"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "GivingAccount_isActive_sortOrder_idx" ON "GivingAccount"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "NextStep_page_isActive_sortOrder_idx" ON "NextStep"("page", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
