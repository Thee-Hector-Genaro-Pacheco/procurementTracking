-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ORDERED', 'RECEIVED', 'CLOSED');

-- CreateTable
CREATE TABLE "ProcurementRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "neededByDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcurementRequest_pkey" PRIMARY KEY ("id")
);
