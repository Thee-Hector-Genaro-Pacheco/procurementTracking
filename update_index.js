const fs = require('fs');
let code = fs.readFileSync('server/src/index.ts', 'utf-8');

// Update createPurchaseOrder status
code = code.replace("status: 'DRAFT',", "status: 'PENDING_APPROVAL',");

// Add mutations after createPurchaseOrder block
const newMutations = `
    approvePurchaseOrder: async (_: any, { id, approverId }: { id: string, approverId: string }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'APPROVER']);
      const approver = await prisma.user.findUnique({ where: { id: approverId } });
      if (!approver || (approver.role !== 'ADMIN' && approver.role !== 'APPROVER')) {
        throw new Error("Invalid approver");
      }
      
      const po = await prisma.purchaseOrder.findUnique({ where: { id } });
      if (!po) throw new Error("Purchase Order not found");
      
      const finalPo = await prisma.purchaseOrder.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedById: approverId,
          approvedAt: new Date(),
          denialReason: null
        },
        include: { 
          procurementRequest: { include: { requestedBy: true, approvedBy: true } }, 
          vendor: true, 
          approvedBy: true,
          items: { include: { receipts: true } },
          receipts: true
        }
      });
      
      return {
        ...finalPo,
        createdAt: finalPo.createdAt.toISOString(),
        updatedAt: finalPo.updatedAt.toISOString(),
        orderDate: finalPo.orderDate ? finalPo.orderDate.toISOString() : null,
        expectedDeliveryDate: finalPo.expectedDeliveryDate ? finalPo.expectedDeliveryDate.toISOString() : null,
        approvedAt: finalPo.approvedAt ? finalPo.approvedAt.toISOString() : null,
        procurementRequest: {
          ...finalPo.procurementRequest,
          createdAt: finalPo.procurementRequest.createdAt.toISOString(),
          updatedAt: finalPo.procurementRequest.updatedAt.toISOString(),
          neededByDate: finalPo.procurementRequest.neededByDate ? finalPo.procurementRequest.neededByDate.toISOString() : null,
          approvedAt: finalPo.procurementRequest.approvedAt ? finalPo.procurementRequest.approvedAt.toISOString() : null,
          requestedBy: finalPo.procurementRequest.requestedBy ? { ...finalPo.procurementRequest.requestedBy, createdAt: finalPo.procurementRequest.requestedBy.createdAt.toISOString(), updatedAt: finalPo.procurementRequest.requestedBy.updatedAt.toISOString() } : null,
          approvedBy: finalPo.procurementRequest.approvedBy ? { ...finalPo.procurementRequest.approvedBy, createdAt: finalPo.procurementRequest.approvedBy.createdAt.toISOString(), updatedAt: finalPo.procurementRequest.approvedBy.updatedAt.toISOString() } : null,
        },
        vendor: { ...finalPo.vendor, createdAt: finalPo.vendor.createdAt.toISOString(), updatedAt: finalPo.vendor.updatedAt.toISOString() },
        approvedBy: finalPo.approvedBy ? { ...finalPo.approvedBy, createdAt: finalPo.approvedBy.createdAt.toISOString(), updatedAt: finalPo.approvedBy.updatedAt.toISOString() } : null,
        items: finalPo.items.map((i: any) => {
          const qtyRec = i.receipts ? i.receipts.reduce((sum: number, r: any) => sum + r.quantityReceived, 0) : 0;
          return {
            ...i,
            quantityReceived: qtyRec,
            isFullyReceived: qtyRec >= i.quantity,
            quantityRemaining: Math.max(0, i.quantity - qtyRec),
            receipts: i.receipts ? i.receipts.map((r: any) => ({
              ...r,
              receivedDate: r.receivedDate.toISOString(),
              createdAt: r.createdAt.toISOString(),
              updatedAt: r.updatedAt.toISOString()
            })) : [],
            createdAt: i.createdAt.toISOString(),
            updatedAt: i.updatedAt.toISOString()
          };
        }),
        receipts: finalPo.receipts ? finalPo.receipts.map((r: any) => ({
          ...r,
          receivedDate: r.receivedDate.toISOString(),
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString()
        })) : []
      };
    },
    denyPurchaseOrder: async (_: any, { id, approverId, reason }: { id: string, approverId: string, reason: string }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'APPROVER']);
      const approver = await prisma.user.findUnique({ where: { id: approverId } });
      if (!approver || (approver.role !== 'ADMIN' && approver.role !== 'APPROVER')) {
        throw new Error("Invalid approver");
      }
      
      const po = await prisma.purchaseOrder.findUnique({ where: { id } });
      if (!po) throw new Error("Purchase Order not found");
      
      const finalPo = await prisma.purchaseOrder.update({
        where: { id },
        data: {
          status: 'DENIED',
          approvedById: approverId,
          approvedAt: new Date(),
          denialReason: reason
        },
        include: { 
          procurementRequest: { include: { requestedBy: true, approvedBy: true } }, 
          vendor: true, 
          approvedBy: true,
          items: { include: { receipts: true } },
          receipts: true
        }
      });
      
      return {
        ...finalPo,
        createdAt: finalPo.createdAt.toISOString(),
        updatedAt: finalPo.updatedAt.toISOString(),
        orderDate: finalPo.orderDate ? finalPo.orderDate.toISOString() : null,
        expectedDeliveryDate: finalPo.expectedDeliveryDate ? finalPo.expectedDeliveryDate.toISOString() : null,
        approvedAt: finalPo.approvedAt ? finalPo.approvedAt.toISOString() : null,
        procurementRequest: {
          ...finalPo.procurementRequest,
          createdAt: finalPo.procurementRequest.createdAt.toISOString(),
          updatedAt: finalPo.procurementRequest.updatedAt.toISOString(),
          neededByDate: finalPo.procurementRequest.neededByDate ? finalPo.procurementRequest.neededByDate.toISOString() : null,
          approvedAt: finalPo.procurementRequest.approvedAt ? finalPo.procurementRequest.approvedAt.toISOString() : null,
          requestedBy: finalPo.procurementRequest.requestedBy ? { ...finalPo.procurementRequest.requestedBy, createdAt: finalPo.procurementRequest.requestedBy.createdAt.toISOString(), updatedAt: finalPo.procurementRequest.requestedBy.updatedAt.toISOString() } : null,
          approvedBy: finalPo.procurementRequest.approvedBy ? { ...finalPo.procurementRequest.approvedBy, createdAt: finalPo.procurementRequest.approvedBy.createdAt.toISOString(), updatedAt: finalPo.procurementRequest.approvedBy.updatedAt.toISOString() } : null,
        },
        vendor: { ...finalPo.vendor, createdAt: finalPo.vendor.createdAt.toISOString(), updatedAt: finalPo.vendor.updatedAt.toISOString() },
        approvedBy: finalPo.approvedBy ? { ...finalPo.approvedBy, createdAt: finalPo.approvedBy.createdAt.toISOString(), updatedAt: finalPo.approvedBy.updatedAt.toISOString() } : null,
        items: finalPo.items.map((i: any) => {
          const qtyRec = i.receipts ? i.receipts.reduce((sum: number, r: any) => sum + r.quantityReceived, 0) : 0;
          return {
            ...i,
            quantityReceived: qtyRec,
            isFullyReceived: qtyRec >= i.quantity,
            quantityRemaining: Math.max(0, i.quantity - qtyRec),
            receipts: i.receipts ? i.receipts.map((r: any) => ({
              ...r,
              receivedDate: r.receivedDate.toISOString(),
              createdAt: r.createdAt.toISOString(),
              updatedAt: r.updatedAt.toISOString()
            })) : [],
            createdAt: i.createdAt.toISOString(),
            updatedAt: i.updatedAt.toISOString()
          };
        }),
        receipts: finalPo.receipts ? finalPo.receipts.map((r: any) => ({
          ...r,
          receivedDate: r.receivedDate.toISOString(),
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString()
        })) : []
      };
    },
    updatePurchaseOrderStatus: async (_: any,`;

code = code.replace("updatePurchaseOrderStatus: async (_: any,", newMutations);

fs.writeFileSync('server/src/index.ts', code);
