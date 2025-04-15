/*
  Warnings:

  - You are about to drop the column `addressText` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `locationCheckResult` on the `Order` table. All the data in the column will be lost.
  - Added the required column `shippingDetails` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/

-- First, add the new columns with temporary defaults
ALTER TABLE "Order" 
ADD COLUMN "shippingDetails" JSONB DEFAULT '{"fullName": "Legacy Order", "address": "Unknown", "city": "Unknown", "zipCode": "00000", "country": "Unknown", "phone": "Unknown"}',
ADD COLUMN "totalAmount" DOUBLE PRECISION DEFAULT 0;

-- Now make them required after defaults are set
ALTER TABLE "Order" 
ALTER COLUMN "shippingDetails" DROP DEFAULT,
ALTER COLUMN "totalAmount" DROP DEFAULT;

-- Now drop the old columns
ALTER TABLE "Order" 
DROP COLUMN "addressText",
DROP COLUMN "customerName",
DROP COLUMN "customerPhone",
DROP COLUMN "locationCheckResult",
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
