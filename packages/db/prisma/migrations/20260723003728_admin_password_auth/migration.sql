/*
  Warnings:

  - You are about to drop the column `lastLogin` on the `AdminUser` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `AdminUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AdminUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "lastLogin",
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminVerificationToken" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminPasswordResetToken" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_sessionToken_key" ON "AdminSession"("sessionToken");

-- CreateIndex
CREATE INDEX "AdminSession_adminUserId_idx" ON "AdminSession"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminVerificationToken_tokenHash_key" ON "AdminVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminVerificationToken_adminUserId_expiresAt_idx" ON "AdminVerificationToken"("adminUserId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminPasswordResetToken_tokenHash_key" ON "AdminPasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminPasswordResetToken_adminUserId_expiresAt_idx" ON "AdminPasswordResetToken"("adminUserId", "expiresAt");

-- CreateIndex
CREATE INDEX "AdminUser_email_lockedUntil_idx" ON "AdminUser"("email", "lockedUntil");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminVerificationToken" ADD CONSTRAINT "AdminVerificationToken_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminPasswordResetToken" ADD CONSTRAINT "AdminPasswordResetToken_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
