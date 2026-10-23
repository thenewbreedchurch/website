-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SCAM', 'INAPPROPRIATE', 'WRONG_INFO', 'CLOSED', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NEW', 'REVIEWED', 'ACTIONED');

-- CreateEnum
CREATE TYPE "VendorStatType" AS ENUM ('VIEW', 'CALL', 'WHATSAPP', 'EMAIL', 'WEBSITE', 'SOCIAL');

-- CreateTable
CREATE TABLE "DirectoryUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectorySession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectorySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectoryVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryPasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectoryPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "subcategories" TEXT[],

    CONSTRAINT "VendorCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" TEXT,
    "businessName" TEXT NOT NULL,
    "status" "VendorStatus" NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT NOT NULL,
    "subcategory" TEXT,
    "description" TEXT NOT NULL,
    "services" TEXT[],
    "location" TEXT NOT NULL,
    "serviceAreas" TEXT,
    "yearStarted" INTEGER,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "registrationNumber" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "linkedin" TEXT,
    "tiktok" TEXT,
    "businessHours" TEXT,
    "priceRange" TEXT,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "adminNotes" TEXT,
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "contactClicksCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorImage" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorReview" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorReport" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "reporterEmail" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorStatDaily" (
    "vendorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "VendorStatType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VendorStatDaily_pkey" PRIMARY KEY ("vendorId","date","type")
);

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryUser_email_key" ON "DirectoryUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DirectorySession_sessionToken_key" ON "DirectorySession"("sessionToken");

-- CreateIndex
CREATE INDEX "DirectorySession_userId_idx" ON "DirectorySession"("userId");

-- CreateIndex
CREATE INDEX "DirectorySession_expiresAt_idx" ON "DirectorySession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryVerificationToken_tokenHash_key" ON "DirectoryVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "DirectoryVerificationToken_userId_expiresAt_idx" ON "DirectoryVerificationToken"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryPasswordResetToken_tokenHash_key" ON "DirectoryPasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "DirectoryPasswordResetToken_userId_expiresAt_idx" ON "DirectoryPasswordResetToken"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "VendorCategory_name_key" ON "VendorCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VendorCategory_slug_key" ON "VendorCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_slug_key" ON "Vendor"("slug");

-- CreateIndex
CREATE INDEX "Vendor_status_isFeatured_idx" ON "Vendor"("status", "isFeatured");

-- CreateIndex
CREATE INDEX "Vendor_status_createdAt_idx" ON "Vendor"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Vendor_categoryId_status_idx" ON "Vendor"("categoryId", "status");

-- CreateIndex
CREATE INDEX "Vendor_location_idx" ON "Vendor"("location");

-- CreateIndex
CREATE INDEX "Vendor_ownerId_idx" ON "Vendor"("ownerId");

-- CreateIndex
CREATE INDEX "Vendor_email_idx" ON "Vendor"("email");

-- CreateIndex
CREATE INDEX "VendorImage_vendorId_sortOrder_idx" ON "VendorImage"("vendorId", "sortOrder");

-- CreateIndex
CREATE INDEX "VendorReview_vendorId_status_createdAt_idx" ON "VendorReview"("vendorId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "VendorReview_status_createdAt_idx" ON "VendorReview"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VendorReview_vendorId_userId_key" ON "VendorReview"("vendorId", "userId");

-- CreateIndex
CREATE INDEX "VendorReport_status_createdAt_idx" ON "VendorReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "VendorReport_vendorId_idx" ON "VendorReport"("vendorId");

-- CreateIndex
CREATE INDEX "VendorStatDaily_date_idx" ON "VendorStatDaily"("date");

-- AddForeignKey
ALTER TABLE "DirectorySession" ADD CONSTRAINT "DirectorySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DirectoryUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryVerificationToken" ADD CONSTRAINT "DirectoryVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DirectoryUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryPasswordResetToken" ADD CONSTRAINT "DirectoryPasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DirectoryUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "DirectoryUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VendorCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorImage" ADD CONSTRAINT "VendorImage_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReview" ADD CONSTRAINT "VendorReview_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReview" ADD CONSTRAINT "VendorReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DirectoryUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReport" ADD CONSTRAINT "VendorReport_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorStatDaily" ADD CONSTRAINT "VendorStatDaily_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
