-- DropIndex
DROP INDEX "Student_email_key";

-- DropIndex
DROP INDEX "Teacher_email_key";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ALTER COLUMN "email" DROP NOT NULL;
