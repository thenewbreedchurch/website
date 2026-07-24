-- CreateEnum
CREATE TYPE "ContactCategory" AS ENUM ('GENERAL', 'PRAYER', 'MEMBERSHIP', 'WELFARE');

-- CreateEnum
CREATE TYPE "NewConvertInterest" AS ENUM ('BAPTISM', 'BIBLE_STUDY', 'MEET_LEADER', 'SERVING', 'OTHER');

-- AlterTable
ALTER TABLE "ChurchSettings" ALTER COLUMN "email" SET DEFAULT 'admin@thenewbreedchurch.org',
ALTER COLUMN "livestreamUrl" SET DEFAULT 'https://www.youtube.com/@the_newbreedchurch/live',
ALTER COLUMN "memberRegistrationUrl" SET DEFAULT 'https://apps.thenewbreedchurch.org/mebership-form';

-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "category" "ContactCategory" NOT NULL DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "StaffMember" ADD COLUMN     "department" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "NewConvertInquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "interests" "NewConvertInterest"[],
    "message" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewConvertInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewConvertInquiry_status_createdAt_idx" ON "NewConvertInquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_category_createdAt_idx" ON "ContactMessage"("category", "createdAt");
