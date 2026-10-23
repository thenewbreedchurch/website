-- CreateEnum
CREATE TYPE "WelfareGender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "WelfareMembershipStatus" AS ENUM ('REGISTERED', 'UNREGISTERED');

-- CreateEnum
CREATE TYPE "WelfareMembershipDuration" AS ENUM ('LT_1_MONTH', 'LT_1_YEAR', 'LT_3_YEARS', 'THREE_YEARS', 'GT_3_YEARS');

-- CreateEnum
CREATE TYPE "WelfareSupportType" AS ENUM ('EMPLOYMENT', 'SCHOOL_FEES', 'FOOD', 'FINANCIAL', 'MEDICAL', 'RENT', 'OTHER');

-- CreateEnum
CREATE TYPE "WelfareStatus" AS ENUM ('NEW', 'IN_REVIEW', 'ASSISTED', 'CLOSED');

-- CreateTable
CREATE TABLE "WelfareRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "gender" "WelfareGender" NOT NULL,
    "age" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "membershipStatus" "WelfareMembershipStatus" NOT NULL,
    "membershipDuration" "WelfareMembershipDuration" NOT NULL,
    "fellowshipGroup" TEXT NOT NULL,
    "isWorker" BOOLEAN NOT NULL,
    "department" TEXT,
    "supportType" "WelfareSupportType" NOT NULL,
    "supportOther" TEXT,
    "description" TEXT NOT NULL,
    "specificRequest" TEXT NOT NULL,
    "firstTimeSupport" BOOLEAN NOT NULL,
    "lastAssistanceDate" TIMESTAMP(3),
    "lastAssistanceType" "WelfareSupportType",
    "lastAssistanceOther" TEXT,
    "triedElsewhere" TEXT NOT NULL,
    "hasDependents" BOOLEAN NOT NULL,
    "dependentsCount" INTEGER,
    "dependentsAges" TEXT,
    "homeVisitOk" BOOLEAN NOT NULL,
    "status" "WelfareStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WelfareRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WelfareRequest_status_createdAt_idx" ON "WelfareRequest"("status", "createdAt");
