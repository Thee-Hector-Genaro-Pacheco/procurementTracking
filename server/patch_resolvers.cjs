const fs = require('fs');

let content = fs.readFileSync('src/index.ts', 'utf8');

// 1. Add Query resolvers for users
content = content.replace('healthCheck: () => "Procurement Tracker API is running",', `healthCheck: () => "Procurement Tracker API is running",
    users: async () => {
      const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
      return users.map(u => ({ ...u, createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() }));
    },
    activeUsers: async () => {
      const users = await prisma.user.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
      return users.map(u => ({ ...u, createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() }));
    },
    user: async (_: any, { id }: { id: string }) => {
      const u = await prisma.user.findUnique({ where: { id } });
      if (!u) return null;
      return { ...u, createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() };
    },
    pendingApprovalRequests: async () => {
      const requests = await prisma.procurementRequest.findMany({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
        include: { items: true, requestedBy: true, approvedBy: true },
        orderBy: { createdAt: 'desc' }
      });
      return requests.map(req => ({
        ...req,
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
        neededByDate: req.neededByDate ? req.neededByDate.toISOString() : null,
        approvedAt: req.approvedAt ? req.approvedAt.toISOString() : null,
        requestedBy: req.requestedBy ? { ...req.requestedBy, createdAt: req.requestedBy.createdAt.toISOString(), updatedAt: req.requestedBy.updatedAt.toISOString() } : null,
        approvedBy: req.approvedBy ? { ...req.approvedBy, createdAt: req.approvedBy.createdAt.toISOString(), updatedAt: req.approvedBy.updatedAt.toISOString() } : null,
        items: req.items.map(item => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }))
      }));
    },`);

// 2. Add Mutation resolvers
content = content.replace('createProcurementRequest: async (_: any, { input }: { input: any }) => {', `createUser: async (_: any, { input }: { input: any }) => {
      try {
        const newUser = await prisma.user.create({
          data: {
            name: input.name,
            email: input.email,
            role: input.role,
            department: input.department,
          }
        });
        return { ...newUser, createdAt: newUser.createdAt.toISOString(), updatedAt: newUser.updatedAt.toISOString() };
      } catch (error) {
        throw new Error("Failed to create user.");
      }
    },
    reviewProcurementRequest: async (_: any, { input }: { input: any }) => {
      const req = await prisma.procurementRequest.findUnique({ where: { id: input.id } });
      if (!req) throw new Error("Request not found");
      
      const approver = await prisma.user.findUnique({ where: { id: input.approverId } });
      if (!approver) throw new Error("Approver not found");
      if (approver.role !== 'ADMIN' && approver.role !== 'APPROVER') {
        throw new Error("User does not have permission to approve requests");
      }

      let data: any = {};
      if (input.decision === 'UNDER_REVIEW') {
        data = { status: 'UNDER_REVIEW', approvedById: null, approvedAt: null, rejectionReason: null };
      } else if (input.decision === 'APPROVE') {
        data = { status: 'APPROVED', approvedById: input.approverId, approvedAt: new Date(), rejectionReason: null };
      } else if (input.decision === 'REJECT') {
        data = { status: 'REJECTED', approvedById: input.approverId, approvedAt: new Date(), rejectionReason: input.rejectionReason };
      }

      const updatedRequest = await prisma.procurementRequest.update({
        where: { id: input.id },
        data,
        include: { items: true, requestedBy: true, approvedBy: true }
      });

      return {
        ...updatedRequest,
        createdAt: updatedRequest.createdAt.toISOString(),
        updatedAt: updatedRequest.updatedAt.toISOString(),
        neededByDate: updatedRequest.neededByDate ? updatedRequest.neededByDate.toISOString() : null,
        approvedAt: updatedRequest.approvedAt ? updatedRequest.approvedAt.toISOString() : null,
        requestedBy: updatedRequest.requestedBy ? { ...updatedRequest.requestedBy, createdAt: updatedRequest.requestedBy.createdAt.toISOString(), updatedAt: updatedRequest.requestedBy.updatedAt.toISOString() } : null,
        approvedBy: updatedRequest.approvedBy ? { ...updatedRequest.approvedBy, createdAt: updatedRequest.approvedBy.createdAt.toISOString(), updatedAt: updatedRequest.approvedBy.updatedAt.toISOString() } : null,
        items: updatedRequest.items.map(item => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() }))
      };
    },
    createProcurementRequest: async (_: any, { input }: { input: any }) => {`);

// 3. Update procurementRequests include and map
content = content.replace(/include: { items: true }/g, "include: { items: true, requestedBy: true, approvedBy: true }");
content = content.replace(/neededByDate: req.neededByDate \? req.neededByDate.toISOString\(\) : null,/g, `neededByDate: req.neededByDate ? req.neededByDate.toISOString() : null,
        approvedAt: req.approvedAt ? req.approvedAt.toISOString() : null,
        requestedBy: req.requestedBy ? { ...req.requestedBy, createdAt: req.requestedBy.createdAt.toISOString(), updatedAt: req.requestedBy.updatedAt.toISOString() } : null,
        approvedBy: req.approvedBy ? { ...req.approvedBy, createdAt: req.approvedBy.createdAt.toISOString(), updatedAt: req.approvedBy.updatedAt.toISOString() } : null,`);

// 4. Update createPurchaseOrder restriction
content = content.replace(`if (req.items.length === 0) {
        throw new Error(\`ProcurementRequest must have at least one line item to generate a Purchase Order.\`);
      }`, `if (req.items.length === 0) {
        throw new Error(\`ProcurementRequest must have at least one line item to generate a Purchase Order.\`);
      }
      if (req.status !== 'APPROVED') {
        throw new Error(\`Cannot create Purchase Order: ProcurementRequest is not APPROVED.\`);
      }`);

// 5. Update purchaseOrder and purchaseOrders mapping (for nested procurementRequest)
content = content.replace(/neededByDate: po.procurementRequest.neededByDate \? po.procurementRequest.neededByDate.toISOString\(\) : null,/g, `neededByDate: po.procurementRequest.neededByDate ? po.procurementRequest.neededByDate.toISOString() : null,
            approvedAt: po.procurementRequest.approvedAt ? po.procurementRequest.approvedAt.toISOString() : null,
            requestedBy: po.procurementRequest.requestedBy ? { ...po.procurementRequest.requestedBy, createdAt: po.procurementRequest.requestedBy.createdAt.toISOString(), updatedAt: po.procurementRequest.requestedBy.updatedAt.toISOString() } : null,
            approvedBy: po.procurementRequest.approvedBy ? { ...po.procurementRequest.approvedBy, createdAt: po.procurementRequest.approvedBy.createdAt.toISOString(), updatedAt: po.procurementRequest.approvedBy.updatedAt.toISOString() } : null,`);

content = content.replace(/neededByDate: newPO.procurementRequest.neededByDate \? newPO.procurementRequest.neededByDate.toISOString\(\) : null,/g, `neededByDate: newPO.procurementRequest.neededByDate ? newPO.procurementRequest.neededByDate.toISOString() : null,
            approvedAt: newPO.procurementRequest.approvedAt ? newPO.procurementRequest.approvedAt.toISOString() : null,
            requestedBy: newPO.procurementRequest.requestedBy ? { ...newPO.procurementRequest.requestedBy, createdAt: newPO.procurementRequest.requestedBy.createdAt.toISOString(), updatedAt: newPO.procurementRequest.requestedBy.updatedAt.toISOString() } : null,
            approvedBy: newPO.procurementRequest.approvedBy ? { ...newPO.procurementRequest.approvedBy, createdAt: newPO.procurementRequest.approvedBy.createdAt.toISOString(), updatedAt: newPO.procurementRequest.approvedBy.updatedAt.toISOString() } : null,`);

// 6. Update nested include in purchaseOrder / purchaseOrders (wait, did I do it?)
content = content.replace(/procurementRequest: true,/g, "procurementRequest: { include: { requestedBy: true, approvedBy: true } },");

// 7. Update createProcurementRequest mapping and logic
content = content.replace(`status: 'SUBMITTED',`, `status: 'SUBMITTED',
            requestedById: input.requestedById || null,`);
            
content = content.replace(/neededByDate: newRequest.neededByDate \? newRequest.neededByDate.toISOString\(\) : null,/g, `neededByDate: newRequest.neededByDate ? newRequest.neededByDate.toISOString() : null,
          approvedAt: newRequest.approvedAt ? newRequest.approvedAt.toISOString() : null,
          requestedBy: newRequest.requestedBy ? { ...newRequest.requestedBy, createdAt: newRequest.requestedBy.createdAt.toISOString(), updatedAt: newRequest.requestedBy.updatedAt.toISOString() } : null,
          approvedBy: newRequest.approvedBy ? { ...newRequest.approvedBy, createdAt: newRequest.approvedBy.createdAt.toISOString(), updatedAt: newRequest.approvedBy.updatedAt.toISOString() } : null,`);
          
content = content.replace(/neededByDate: updatedRequest.neededByDate \? updatedRequest.neededByDate.toISOString\(\) : null,/g, `neededByDate: updatedRequest.neededByDate ? updatedRequest.neededByDate.toISOString() : null,
          approvedAt: updatedRequest.approvedAt ? updatedRequest.approvedAt.toISOString() : null,
          requestedBy: updatedRequest.requestedBy ? { ...updatedRequest.requestedBy, createdAt: updatedRequest.requestedBy.createdAt.toISOString(), updatedAt: updatedRequest.requestedBy.updatedAt.toISOString() } : null,
          approvedBy: updatedRequest.approvedBy ? { ...updatedRequest.approvedBy, createdAt: updatedRequest.approvedBy.createdAt.toISOString(), updatedAt: updatedRequest.approvedBy.updatedAt.toISOString() } : null,`);


fs.writeFileSync('src/index.ts', content);
