/*
  Warnings:

  - You are about to drop the column `padel_court_id` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the `padel_courts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tournaments" DROP CONSTRAINT "tournaments_padel_court_id_fkey";

-- AlterTable
ALTER TABLE "tournaments" DROP COLUMN "padel_court_id";

-- DropTable
DROP TABLE "padel_courts";
