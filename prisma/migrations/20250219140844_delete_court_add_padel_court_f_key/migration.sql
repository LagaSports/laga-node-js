/*
  Warnings:

  - You are about to drop the column `court_id` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the `courts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tournaments" DROP CONSTRAINT "tournaments_court_id_fkey";

-- AlterTable
ALTER TABLE "tournaments" DROP COLUMN "court_id",
ADD COLUMN     "padel_court_id" INTEGER;

-- DropTable
DROP TABLE "courts";

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_padel_court_id_fkey" FOREIGN KEY ("padel_court_id") REFERENCES "padel_courts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
