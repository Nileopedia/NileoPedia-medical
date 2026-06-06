-- AlterTable
ALTER TABLE "AIResponse" ADD COLUMN     "keyFindings" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "MedicalDocument" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "isSaved" BOOLEAN NOT NULL DEFAULT false;
