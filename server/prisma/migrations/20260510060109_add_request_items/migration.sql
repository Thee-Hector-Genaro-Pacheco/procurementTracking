-- CreateTable
CREATE TABLE "RequestItem" (
    "id" TEXT NOT NULL,
    "procurementRequestId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitOfMeasure" TEXT,
    "estimatedUnitCost" DOUBLE PRECISION,
    "partNumber" TEXT,
    "manufacturer" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_procurementRequestId_fkey" FOREIGN KEY ("procurementRequestId") REFERENCES "ProcurementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
