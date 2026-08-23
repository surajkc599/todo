-- AlterTable
ALTER TABLE "items" ADD COLUMN     "parentItemId" TEXT;

-- CreateIndex
CREATE INDEX "items_parentItemId_idx" ON "items"("parentItemId");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
