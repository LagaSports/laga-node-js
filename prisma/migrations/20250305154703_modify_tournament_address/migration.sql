/*
  Warnings:

  - You are about to drop the column `tournament_id` on the `tournament_addresses` table. All the data in the column will be lost.
  - Added the required column `google_place_id` to the `tournament_addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tournament_address_id` to the `tournaments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tournament_addresses" DROP CONSTRAINT "tournament_addresses_tournament_id_fkey";

-- DropIndex
DROP INDEX "tournament_addresses_tournament_id_idx";

-- AlterTable
ALTER TABLE "tournament_addresses" DROP COLUMN "tournament_id",
ADD COLUMN     "google_place_id" VARCHAR NOT NULL;

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "tournament_address_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "tournament_addresses_google_place_id_idx" ON "tournament_addresses"("google_place_id");

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_tournament_address_id_fkey" FOREIGN KEY ("tournament_address_id") REFERENCES "tournament_addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
