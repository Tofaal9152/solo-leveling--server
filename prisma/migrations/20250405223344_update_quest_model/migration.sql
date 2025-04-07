-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "health" INTEGER NOT NULL DEFAULT 100,
    "levelUpHealth" INTEGER NOT NULL DEFAULT 100,
    "level" INTEGER NOT NULL DEFAULT 0,
    "levelUpXp" INTEGER NOT NULL DEFAULT 100,
    "totalStatePoints" INTEGER NOT NULL DEFAULT 0,
    "statStrength" INTEGER NOT NULL DEFAULT 0,
    "statIntelligence" INTEGER NOT NULL DEFAULT 0,
    "statDiscipline" INTEGER NOT NULL DEFAULT 0,
    "statCharisma" INTEGER NOT NULL DEFAULT 0,
    "statWillpower" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "statPoints" INTEGER NOT NULL,
    "healthPoints" INTEGER NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
