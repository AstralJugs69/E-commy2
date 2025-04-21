-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "assignedPhoneNumberId" INTEGER;

-- CreateIndex
CREATE INDEX "Order_assignedPhoneNumberId_idx" ON "Order"("assignedPhoneNumberId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_assignedPhoneNumberId_fkey" FOREIGN KEY ("assignedPhoneNumberId") REFERENCES "PhoneNumber"("id") ON DELETE SET NULL ON UPDATE CASCADE;
