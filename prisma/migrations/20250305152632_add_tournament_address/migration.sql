-- CreateTable
CREATE TABLE "tournament_addresses" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "google_maps_link" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tournament_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tournament_addresses_tournament_id_idx" ON "tournament_addresses"("tournament_id");

-- AddForeignKey
ALTER TABLE "tournament_addresses" ADD CONSTRAINT "tournament_addresses_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
