-- CreateEnum
CREATE TYPE "AIMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT,
    "title" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AIMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT,
    "conversationId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIConversation_userId_idx" ON "AIConversation"("userId");

-- CreateIndex
CREATE INDEX "AIConversation_schoolId_idx" ON "AIConversation"("schoolId");

-- CreateIndex
CREATE INDEX "AIMessage_conversationId_createdAt_idx" ON "AIMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "AIUsage_userId_createdAt_idx" ON "AIUsage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AIUsage_schoolId_createdAt_idx" ON "AIUsage"("schoolId", "createdAt");

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
