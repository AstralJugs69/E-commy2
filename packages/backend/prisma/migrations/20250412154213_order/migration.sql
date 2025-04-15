/*
  Warnings:

  - Made the column `shippingDetails` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalAmount` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "shippingDetails" SET NOT NULL,
ALTER COLUMN "totalAmount" SET NOT NULL;
