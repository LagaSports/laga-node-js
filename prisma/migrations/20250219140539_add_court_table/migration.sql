-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "court_id" INTEGER;

-- CreateTable
CREATE TABLE "courts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "courts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courts_name_idx" ON "courts"("name");

-- CreateIndex
CREATE INDEX "courts_created_at_idx" ON "courts"("created_at");

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
