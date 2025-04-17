/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `streetAddress` on the `Address` table. All the data in the column will be lost.
  - Added the required column `address` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "phoneNumber",
DROP COLUMN "postalCode",
DROP COLUMN "streetAddress",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");
