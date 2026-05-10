/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('MANUFACTURER', 'DISTRIBUTOR', 'SERVICE_PROVIDER', 'CALIBRATION_LAB', 'CONTRACTOR', 'OEM', 'OTHER');

-- CreateEnum
CREATE TYPE "VendorQualificationStatus" AS ENUM ('UNREVIEWED', 'APPROVED', 'PREFERRED', 'RESTRICTED', 'INACTIVE');

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "industries" TEXT[],
ADD COLUMN     "isPreferred" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "qualificationStatus" "VendorQualificationStatus" NOT NULL DEFAULT 'UNREVIEWED',
ADD COLUMN     "specialties" TEXT[],
ADD COLUMN     "vendorType" "VendorType" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_key" ON "Vendor"("name");
