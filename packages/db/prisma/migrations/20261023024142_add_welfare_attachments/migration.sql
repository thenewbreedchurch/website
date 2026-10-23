-- CreateTable
CREATE TABLE "WelfareAttachment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WelfareAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WelfareAttachment_requestId_idx" ON "WelfareAttachment"("requestId");

-- AddForeignKey
ALTER TABLE "WelfareAttachment" ADD CONSTRAINT "WelfareAttachment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "WelfareRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
