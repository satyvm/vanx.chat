-- CreateTable
CREATE TABLE "chat" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "messages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_title_key" ON "chat"("title");
