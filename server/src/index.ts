import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { comparePassword, createToken, verifyToken, requireAuth, requireRole } from './auth.js';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import prisma from './prisma.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const typeDefs = `#graphql
  enum UserRole {
    ADMIN
    REQUESTER
    APPROVER
    BUYER
    RECEIVER
  }

  enum ApprovalDecision {
    APPROVE
    REJECT
    UNDER_REVIEW
  }
  enum RequestStatus {
    DRAFT
    SUBMITTED
    UNDER_REVIEW
    APPROVED
    REJECTED
    ORDERED
    RECEIVED
    CLOSED
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum VendorType {
    MANUFACTURER
    DISTRIBUTOR
    SERVICE_PROVIDER
    CALIBRATION_LAB
    CONTRACTOR
    OEM
    OTHER
  }

  enum VendorQualificationStatus {
    UNREVIEWED
    APPROVED
    PREFERRED
    RESTRICTED
    INACTIVE
  }

  enum PurchaseOrderStatus {
    DRAFT
    ISSUED
    ACKNOWLEDGED
    PARTIALLY_RECEIVED
    RECEIVED
    CANCELLED
    CLOSED
  }

  type RequestItem {
    id: ID!
    procurementRequestId: ID!
    itemName: String!
    description: String
    quantity: Int!
    unitOfMeasure: String
    estimatedUnitCost: Float
    partNumber: String
    manufacturer: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type ProcurementRequest {
    id: ID!
    title: String!
    description: String
    department: String!
    priority: Priority!
    status: RequestStatus!
    neededByDate: String
    items: [RequestItem!]!
    requestedById: ID
    requestedBy: User
    approvedById: ID
    approvedBy: User
    approvedAt: String
    rejectionReason: String
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    department: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CreateProcurementRequestInput {
    title: String!
    description: String
    department: String!
    priority: Priority!
    neededByDate: String
    requestedById: ID
  }

  input CreateUserInput {
    name: String!
    email: String!
    role: UserRole!
    department: String
  }

  input ReviewProcurementRequestInput {
    id: ID!
    approverId: ID!
    decision: ApprovalDecision!
    rejectionReason: String
  }

  input CreateRequestItemInput {
    procurementRequestId: ID!
    itemName: String!
    description: String
    quantity: Int!
    unitOfMeasure: String
    estimatedUnitCost: Float
    partNumber: String
    manufacturer: String
    notes: String
  }

  type Vendor {
    id: ID!
    name: String!
    contactName: String
    email: String
    phone: String
    address: String
    notes: String
    website: String
    vendorType: VendorType!
    industries: [String!]!
    specialties: [String!]!
    isPreferred: Boolean!
    qualificationStatus: VendorQualificationStatus!
    createdAt: String!
    updatedAt: String!
  }

  input CreateVendorInput {
    name: String!
    contactName: String
    email: String
    phone: String
    address: String
    notes: String
    website: String
    vendorType: VendorType
    industries: [String!]
    specialties: [String!]
    isPreferred: Boolean
    qualificationStatus: VendorQualificationStatus
  }

  type Receipt {
    id: ID!
    purchaseOrderId: ID!
    purchaseOrderItemId: ID!
    quantityReceived: Int!
    receivedDate: String!
    receivedBy: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type PurchaseOrderItem {
    id: ID!
    purchaseOrderId: ID!
    requestItemId: ID
    itemName: String!
    description: String
    quantity: Int!
    unitOfMeasure: String
    unitCost: Float
    lineTotal: Float
    partNumber: String
    manufacturer: String
    notes: String
    receipts: [Receipt!]!
    quantityReceived: Int!
    quantityRemaining: Int!
    isFullyReceived: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type PurchaseOrder {
    id: ID!
    poNumber: String!
    procurementRequestId: ID!
    procurementRequest: ProcurementRequest!
    vendorId: ID!
    vendor: Vendor!
    status: PurchaseOrderStatus!
    orderDate: String
    expectedDeliveryDate: String
    subtotal: Float!
    notes: String
    items: [PurchaseOrderItem!]!
    receipts: [Receipt!]!
    createdAt: String!
    updatedAt: String!
  }

  input CreatePurchaseOrderInput {
    procurementRequestId: ID!
    vendorId: ID!
    orderDate: String
    expectedDeliveryDate: String
    notes: String
  }

  input UpdatePurchaseOrderStatusInput {
    id: ID!
    status: PurchaseOrderStatus!
  }

  input ReceivePurchaseOrderItemInput {
    purchaseOrderId: ID!
    purchaseOrderItemId: ID!
    quantityReceived: Int!
    receivedDate: String
    receivedBy: String
    notes: String
  }

  type AuthPayload {
    user: User!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: User
    healthCheck: String!
    users: [User!]!
    activeUsers: [User!]!
    user(id: ID!): User
    pendingApprovalRequests: [ProcurementRequest!]!
    procurementRequests: [ProcurementRequest!]!
    procurementRequest(id: ID!): ProcurementRequest
    vendors: [Vendor!]!
    vendor(id: ID!): Vendor
    purchaseOrders: [PurchaseOrder!]!
    purchaseOrder(id: ID!): PurchaseOrder
    receipts: [Receipt!]!
    receiptsByPurchaseOrder(purchaseOrderId: ID!): [Receipt!]!
  }

  type Mutation {
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    createUser(input: CreateUserInput!): User!
    reviewProcurementRequest(input: ReviewProcurementRequestInput!): ProcurementRequest!
    createProcurementRequest(input: CreateProcurementRequestInput!): ProcurementRequest!
    updateProcurementRequestStatus(id: ID!, status: RequestStatus!): ProcurementRequest!
    createVendor(input: CreateVendorInput!): Vendor!
    createRequestItem(input: CreateRequestItemInput!): RequestItem!
    createPurchaseOrder(input: CreatePurchaseOrderInput!): PurchaseOrder!
    updatePurchaseOrderStatus(input: UpdatePurchaseOrderStatusInput!): PurchaseOrder!
    receivePurchaseOrderItem(input: ReceivePurchaseOrderItemInput!): PurchaseOrder!
  }
`;

const resolvers = {
  Query: {
    healthCheck: () => "Procurement Tracker API is running",
    me: async (_: any, __: any, context: any) => {
      if (!context.currentUser) return null;
      const u = await prisma.user.findUnique({ where: { id: context.currentUser.userId } });
      if (!u) return null;
      return { ...u, createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() };
    },
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
    },
    procurementRequests: async () => {
      const requests = await prisma.procurementRequest.findMany({
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
    },


    procurementRequest: async (_: any, { id }: { id: string }) => {
      const req = await prisma.procurementRequest.findUnique({
        where: { id },
        include: { items: true, requestedBy: true, approvedBy: true }
      });
      if (!req) return null;
      return {
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
      };
    },
    vendors: async () => {
      const vendors = await prisma.vendor.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return vendors.map(v => ({
        ...v,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
      }));
    },
    vendor: async (_: any, { id }: { id: string }) => {
      const v = await prisma.vendor.findUnique({ where: { id } });
      if (!v) return null;
      return {
        ...v,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
      };
    },
    purchaseOrders: async () => {
      const pos = await prisma.purchaseOrder.findMany({
        include: { 
          procurementRequest: { include: { requestedBy: true, approvedBy: true } }, 
          vendor: true, 
          items: { include: { receipts: true } },
          receipts: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return pos.map(po => ({
        ...po,
        orderDate: po.orderDate ? po.orderDate.toISOString() : null,
        expectedDeliveryDate: po.expectedDeliveryDate ? po.expectedDeliveryDate.toISOString() : null,
        createdAt: po.createdAt.toISOString(),
        updatedAt: po.updatedAt.toISOString(),
        procurementRequest: {
          ...po.procurementRequest,
          createdAt: po.procurementRequest.createdAt.toISOString(),
          updatedAt: po.procurementRequest.updatedAt.toISOString(),
          neededByDate: po.procurementRequest.neededByDate ? po.procurementRequest.neededByDate.toISOString() : null,
            approvedAt: po.procurementRequest.approvedAt ? po.procurementRequest.approvedAt.toISOString() : null,
            requestedBy: po.procurementRequest.requestedBy ? { ...po.procurementRequest.requestedBy, createdAt: po.procurementRequest.requestedBy.createdAt.toISOString(), updatedAt: po.procurementRequest.requestedBy.updatedAt.toISOString() } : null,
            approvedBy: po.procurementRequest.approvedBy ? { ...po.procurementRequest.approvedBy, createdAt: po.procurementRequest.approvedBy.createdAt.toISOString(), updatedAt: po.procurementRequest.approvedBy.updatedAt.toISOString() } : null,
        },
        vendor: {
          ...po.vendor,
          createdAt: po.vendor.createdAt.toISOString(),
          updatedAt: po.vendor.updatedAt.toISOString(),
        },
        items: po.items.map((item: any) => {
          const qtyRec = item.receipts ? item.receipts.reduce((sum: number, r: any) => sum + r.quantityReceived, 0) : 0;
          return {
            ...item,
            receipts: item.receipts ? item.receipts.map((r: any) => ({
              ...r,
              receivedDate: r.receivedDate.toISOString(),
              createdAt: r.createdAt.toISOString(),
              updatedAt: r.updatedAt.toISOString(),
            })) : [],
            quantityReceived: qtyRec,
            quantityRemaining: item.quantity - qtyRec,
            isFullyReceived: qtyRec >= item.quantity,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
          }
        }),
        receipts: po.receipts ? po.receipts.map((r: any) => ({
          ...r,
          receivedDate: r.receivedDate.toISOString(),
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })) : []
      }));
    },
    purchaseOrder: async (_: any, { id }: { id: string }) => {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: { 
          procurementRequest: { include: { requestedBy: true, approvedBy: true } }, 
          vendor: true, 
          items: { include: { receipts: true } },
          receipts: true
        }
      });
      if (!po) return null;
      return {
        ...po,
        orderDate: po.orderDate ? po.orderDate.toISOString() : null,
        expectedDeliveryDate: po.expectedDeliveryDate ? po.expectedDeliveryDate.toISOString() : null,
        createdAt: po.createdAt.toISOString(),
        updatedAt: po.updatedAt.toISOString(),
        procurementRequest: {
          ...po.procurementRequest,
          createdAt: po.procurementRequest.createdAt.toISOString(),
          updatedAt: po.procurementRequest.updatedAt.toISOString(),
          neededByDate: po.procurementRequest.neededByDate ? po.procurementRequest.neededByDate.toISOString() : null,
            approvedAt: po.procurementRequest.approvedAt ? po.procurementRequest.approvedAt.toISOString() : null,
            requestedBy: po.procurementRequest.requestedBy ? { ...po.procurementRequest.requestedBy, createdAt: po.procurementRequest.requestedBy.createdAt.toISOString(), updatedAt: po.procurementRequest.requestedBy.updatedAt.toISOString() } : null,
            approvedBy: po.procurementRequest.approvedBy ? { ...po.procurementRequest.approvedBy, createdAt: po.procurementRequest.approvedBy.createdAt.toISOString(), updatedAt: po.procurementRequest.approvedBy.updatedAt.toISOString() } : null,
        },
        vendor: {
          ...po.vendor,
          createdAt: po.vendor.createdAt.toISOString(),
          updatedAt: po.vendor.updatedAt.toISOString(),
        },
        items: po.items.map((item: any) => {
          const qtyRec = item.receipts ? item.receipts.reduce((sum: number, r: any) => sum + r.quantityReceived, 0) : 0;
          return {
            ...item,
            receipts: item.receipts ? item.receipts.map((r: any) => ({
              ...r,
              receivedDate: r.receivedDate.toISOString(),
              createdAt: r.createdAt.toISOString(),
              updatedAt: r.updatedAt.toISOString(),
            })) : [],
            quantityReceived: qtyRec,
            quantityRemaining: item.quantity - qtyRec,
            isFullyReceived: qtyRec >= item.quantity,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
          }
        }),
        receipts: po.receipts ? po.receipts.map((r: any) => ({
          ...r,
          receivedDate: r.receivedDate.toISOString(),
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })) : []
      };
    },
    receipts: async () => {
      const recs = await prisma.receipt.findMany({ orderBy: { receivedDate: 'desc' }});
      return recs.map(r => ({ ...r, receivedDate: r.receivedDate.toISOString(), createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }));
    },
    receiptsByPurchaseOrder: async (_: any, { purchaseOrderId }: { purchaseOrderId: string }) => {
      const recs = await prisma.receipt.findMany({ where: { purchaseOrderId }, orderBy: { receivedDate: 'desc' }});
      return recs.map(r => ({ ...r, receivedDate: r.receivedDate.toISOString(), createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }));
    }
  },
  Mutation: {
    login: async (_: any, { input }: { input: any }, context: any) => {
      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (!user || !user.passwordHash) {
        throw new Error("Invalid email or password");
      }
      
      const valid = await comparePassword(input.password, user.passwordHash);
      if (!valid) {
        throw new Error("Invalid email or password");
      }

      const token = createToken({ userId: user.id, role: user.role });
      
      const isProd = process.env.NODE_ENV === 'production';
      context.res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        user: { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() }
      };
    },
    logout: async (_: any, __: any, context: any) => {
      context.res.clearCookie('token');
      return true;
    },
    createUser: async (_: any, { input }: { input: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN']);
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
    reviewProcurementRequest: async (_: any, { input }: { input: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'APPROVER']);
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
    createProcurementRequest: async (_: any, { input }: { input: any }, context: any) => {
      requireAuth(context.currentUser);
      try {
        const newRequest = await prisma.procurementRequest.create({
          data: {
            title: input.title,
            description: input.description,
            department: input.department,
            priority: input.priority,
            neededByDate: input.neededByDate ? new Date(input.neededByDate) : null,
            status: 'SUBMITTED',
            requestedById: context.currentUser.userId,
          },
          include: { items: true, requestedBy: true, approvedBy: true }
        });
        console.log(`[Mutation] Created new procurement request: ${newRequest.id} - ${newRequest.title}`);
        return {
          ...newRequest,
          createdAt: newRequest.createdAt.toISOString(),
          updatedAt: newRequest.updatedAt.toISOString(),
          neededByDate: newRequest.neededByDate ? newRequest.neededByDate.toISOString() : null,
          approvedAt: newRequest.approvedAt ? newRequest.approvedAt.toISOString() : null,
          requestedBy: newRequest.requestedBy ? { ...newRequest.requestedBy, createdAt: newRequest.requestedBy.createdAt.toISOString(), updatedAt: newRequest.requestedBy.updatedAt.toISOString() } : null,
          approvedBy: newRequest.approvedBy ? { ...newRequest.approvedBy, createdAt: newRequest.approvedBy.createdAt.toISOString(), updatedAt: newRequest.approvedBy.updatedAt.toISOString() } : null,
        };
      } catch (error) {
        console.error("Error creating procurement request:", error);
        throw new Error("Failed to create procurement request in database.");
      }
    },
    updateProcurementRequestStatus: async (_: any, { id, status }: { id: string, status: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'APPROVER']);
      try {
        const updatedRequest = await prisma.procurementRequest.update({
          where: { id },
          data: { status },
          include: { items: true, requestedBy: true, approvedBy: true }
        });
        console.log(`[Mutation] Updated procurement request ${id} status to ${status}`);
        return {
          ...updatedRequest,
          createdAt: updatedRequest.createdAt.toISOString(),
          updatedAt: updatedRequest.updatedAt.toISOString(),
          neededByDate: updatedRequest.neededByDate ? updatedRequest.neededByDate.toISOString() : null,
          approvedAt: updatedRequest.approvedAt ? updatedRequest.approvedAt.toISOString() : null,
          requestedBy: updatedRequest.requestedBy ? { ...updatedRequest.requestedBy, createdAt: updatedRequest.requestedBy.createdAt.toISOString(), updatedAt: updatedRequest.requestedBy.updatedAt.toISOString() } : null,
          approvedBy: updatedRequest.approvedBy ? { ...updatedRequest.approvedBy, createdAt: updatedRequest.approvedBy.createdAt.toISOString(), updatedAt: updatedRequest.approvedBy.updatedAt.toISOString() } : null,
        };
      } catch (error: any) {
        console.error("Error updating procurement request:", error);
        if (error.code === 'P2025') {
          throw new Error(`ProcurementRequest with ID ${id} not found.`);
        }
        throw new Error("Failed to update procurement request in database.");
      }
    },
    createVendor: async (_: any, { input }: { input: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'BUYER']);
      try {
        const newVendor = await prisma.vendor.create({
          data: {
            name: input.name,
            contactName: input.contactName,
            email: input.email,
            phone: input.phone,
            address: input.address,
            notes: input.notes,
            website: input.website,
            vendorType: input.vendorType || 'OTHER',
            industries: input.industries || [],
            specialties: input.specialties || [],
            isPreferred: input.isPreferred ?? false,
            qualificationStatus: input.qualificationStatus || 'UNREVIEWED',
          }
        });
        console.log(`[Mutation] Created new vendor: ${newVendor.id} - ${newVendor.name}`);
        return {
          ...newVendor,
          createdAt: newVendor.createdAt.toISOString(),
          updatedAt: newVendor.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error("Error creating vendor:", error);
        throw new Error("Failed to create vendor in database.");
      }
    },
    createRequestItem: async (_: any, { input }: { input: any }, context: any) => {
      requireAuth(context.currentUser);
      if (input.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      const reqExists = await prisma.procurementRequest.findUnique({
        where: { id: input.procurementRequestId }
      });

      if (!reqExists) {
        throw new Error(`ProcurementRequest with ID ${input.procurementRequestId} not found.`);
      }

      try {
        const newItem = await prisma.requestItem.create({
          data: {
            procurementRequestId: input.procurementRequestId,
            itemName: input.itemName,
            description: input.description,
            quantity: input.quantity,
            unitOfMeasure: input.unitOfMeasure,
            estimatedUnitCost: input.estimatedUnitCost,
            partNumber: input.partNumber,
            manufacturer: input.manufacturer,
            notes: input.notes,
          }
        });
        console.log(`[Mutation] Created new request item: ${newItem.id} for request ${newItem.procurementRequestId}`);
        return {
          ...newItem,
          createdAt: newItem.createdAt.toISOString(),
          updatedAt: newItem.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error("Error creating request item:", error);
        throw new Error("Failed to create request item in database.");
      }
    },
    createPurchaseOrder: async (_: any, { input }: { input: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'BUYER']);
      const req = await prisma.procurementRequest.findUnique({
        where: { id: input.procurementRequestId },
        include: { items: true, requestedBy: true, approvedBy: true }
      });

      if (!req) {
        throw new Error(`ProcurementRequest with ID ${input.procurementRequestId} not found.`);
      }

      if (req.items.length === 0) {
        throw new Error(`ProcurementRequest must have at least one line item to generate a Purchase Order.`);
      }
      if (req.status !== 'APPROVED') {
        throw new Error(`Cannot create Purchase Order: ProcurementRequest is not APPROVED.`);
      }

      const vendor = await prisma.vendor.findUnique({
        where: { id: input.vendorId }
      });

      if (!vendor) {
        throw new Error(`Vendor with ID ${input.vendorId} not found.`);
      }

      const timestamp = new Date();
      const poNumber = `PO-${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}-${String(timestamp.getHours()).padStart(2, '0')}${String(timestamp.getMinutes()).padStart(2, '0')}${String(timestamp.getSeconds()).padStart(2, '0')}`;

      const poItems = req.items.map(item => {
        const unitCost = item.estimatedUnitCost ?? null;
        const lineTotal = unitCost !== null ? unitCost * item.quantity : null;
        return {
          requestItemId: item.id,
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unitOfMeasure: item.unitOfMeasure,
          unitCost,
          lineTotal,
          partNumber: item.partNumber,
          manufacturer: item.manufacturer,
          notes: item.notes,
        };
      });

      let subtotal = 0;
      for (const item of poItems) {
        if (item.lineTotal !== null) {
          subtotal += item.lineTotal;
        }
      }

      try {
        const newPO = await prisma.purchaseOrder.create({
          data: {
            poNumber,
            procurementRequestId: input.procurementRequestId,
            vendorId: input.vendorId,
            status: 'DRAFT',
            orderDate: input.orderDate ? new Date(input.orderDate) : null,
            expectedDeliveryDate: input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : null,
            subtotal,
            notes: input.notes,
            items: {
              create: poItems
            }
          },
          include: { 
            procurementRequest: { include: { requestedBy: true, approvedBy: true } }, 
            vendor: true, 
            items: { include: { receipts: true } },
            receipts: true
          }
        });

        await prisma.procurementRequest.update({
          where: { id: input.procurementRequestId },
          data: { status: 'ORDERED' }
        });

        console.log(`[Mutation] Created new PO: ${newPO.poNumber}`);

        return {
          ...newPO,
          orderDate: newPO.orderDate ? newPO.orderDate.toISOString() : null,
          expectedDeliveryDate: newPO.expectedDeliveryDate ? newPO.expectedDeliveryDate.toISOString() : null,
          createdAt: newPO.createdAt.toISOString(),
          updatedAt: newPO.updatedAt.toISOString(),
          procurementRequest: {
            ...newPO.procurementRequest,
            createdAt: newPO.procurementRequest.createdAt.toISOString(),
            updatedAt: newPO.procurementRequest.updatedAt.toISOString(),
            neededByDate: newPO.procurementRequest.neededByDate ? newPO.procurementRequest.neededByDate.toISOString() : null,
            approvedAt: newPO.procurementRequest.approvedAt ? newPO.procurementRequest.approvedAt.toISOString() : null,
            requestedBy: newPO.procurementRequest.requestedBy ? { ...newPO.procurementRequest.requestedBy, createdAt: newPO.procurementRequest.requestedBy.createdAt.toISOString(), updatedAt: newPO.procurementRequest.requestedBy.updatedAt.toISOString() } : null,
            approvedBy: newPO.procurementRequest.approvedBy ? { ...newPO.procurementRequest.approvedBy, createdAt: newPO.procurementRequest.approvedBy.createdAt.toISOString(), updatedAt: newPO.procurementRequest.approvedBy.updatedAt.toISOString() } : null,
          },
          vendor: {
            ...newPO.vendor,
            createdAt: newPO.vendor.createdAt.toISOString(),
            updatedAt: newPO.vendor.updatedAt.toISOString(),
          },
          items: newPO.items.map((item: any) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
          }))
        };
      } catch (error) {
        console.error("Error creating PO:", error);
        throw new Error("Failed to create Purchase Order in database.");
      }
    },
    updatePurchaseOrderStatus: async (_: any, { input }: { input: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'BUYER']);
      try {
        const po = await prisma.purchaseOrder.update({
          where: { id: input.id },
          data: { status: input.status },
          include: { 
            procurementRequest: { include: { requestedBy: true, approvedBy: true } }, 
            vendor: true, 
            items: { include: { receipts: true } },
            receipts: true
          }
        });

        console.log(`[Mutation] Updated PO ${po.poNumber} status to ${input.status}`);

        return {
          ...po,
          orderDate: po.orderDate ? po.orderDate.toISOString() : null,
          expectedDeliveryDate: po.expectedDeliveryDate ? po.expectedDeliveryDate.toISOString() : null,
          createdAt: po.createdAt.toISOString(),
          updatedAt: po.updatedAt.toISOString(),
          procurementRequest: {
            ...po.procurementRequest,
            createdAt: po.procurementRequest.createdAt.toISOString(),
            updatedAt: po.procurementRequest.updatedAt.toISOString(),
            neededByDate: po.procurementRequest.neededByDate ? po.procurementRequest.neededByDate.toISOString() : null,
            approvedAt: po.procurementRequest.approvedAt ? po.procurementRequest.approvedAt.toISOString() : null,
            requestedBy: po.procurementRequest.requestedBy ? { ...po.procurementRequest.requestedBy, createdAt: po.procurementRequest.requestedBy.createdAt.toISOString(), updatedAt: po.procurementRequest.requestedBy.updatedAt.toISOString() } : null,
            approvedBy: po.procurementRequest.approvedBy ? { ...po.procurementRequest.approvedBy, createdAt: po.procurementRequest.approvedBy.createdAt.toISOString(), updatedAt: po.procurementRequest.approvedBy.updatedAt.toISOString() } : null,
          },
          vendor: {
            ...po.vendor,
            createdAt: po.vendor.createdAt.toISOString(),
            updatedAt: po.vendor.updatedAt.toISOString(),
          },
          items: po.items.map((item: any) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
          }))
        };
      } catch (error: any) {
        console.error("Error updating PO status:", error);
        if (error.code === 'P2025') {
          throw new Error(`PurchaseOrder with ID ${input.id} not found.`);
        }
        throw new Error("Failed to update Purchase Order in database.");
      }
    },
    receivePurchaseOrderItem: async (_: any, { input }: { input: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'RECEIVER']);
      if (input.quantityReceived <= 0) {
        throw new Error("Quantity received must be greater than 0");
      }

      const po = await prisma.purchaseOrder.findUnique({
        where: { id: input.purchaseOrderId },
        include: { items: { include: { receipts: true } } }
      });

      if (!po) throw new Error("Purchase Order not found.");

      const item = po.items.find(i => i.id === input.purchaseOrderItemId);
      if (!item) throw new Error("Purchase Order Item not found.");

      const currentReceived = item.receipts.reduce((sum, r) => sum + r.quantityReceived, 0);
      if (currentReceived + input.quantityReceived > item.quantity) {
        throw new Error("Cannot receive more than the ordered quantity.");
      }

      await prisma.receipt.create({
        data: {
          purchaseOrderId: input.purchaseOrderId,
          purchaseOrderItemId: input.purchaseOrderItemId,
          quantityReceived: input.quantityReceived,
          receivedDate: input.receivedDate ? new Date(input.receivedDate) : new Date(),
          receivedBy: input.receivedBy,
          notes: input.notes
        }
      });

      const updatedPo = await prisma.purchaseOrder.findUnique({
        where: { id: input.purchaseOrderId },
        include: { items: { include: { receipts: true } } }
      });

      let allFullyReceived = true;
      if (updatedPo && updatedPo.items) {
        for (const i of updatedPo.items) {
          const rec = i.receipts.reduce((sum, r) => sum + r.quantityReceived, 0);
          if (rec < i.quantity) {
            allFullyReceived = false;
          }
        }
      }

      const newStatus = allFullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';

      const finalPo = await prisma.purchaseOrder.update({
        where: { id: input.purchaseOrderId },
        data: { status: newStatus },
        include: { 
          procurementRequest: { include: { requestedBy: true, approvedBy: true } }, 
          vendor: true, 
          items: { include: { receipts: true } },
          receipts: true
        }
      });

      if (allFullyReceived) {
        await prisma.procurementRequest.update({
          where: { id: finalPo.procurementRequestId },
          data: { status: 'RECEIVED' }
        });
      }

      console.log(`[Mutation] Received ${input.quantityReceived} items for PO ${finalPo.poNumber}. Status: ${newStatus}`);

      return {
        ...finalPo,
        orderDate: finalPo.orderDate ? finalPo.orderDate.toISOString() : null,
        expectedDeliveryDate: finalPo.expectedDeliveryDate ? finalPo.expectedDeliveryDate.toISOString() : null,
        createdAt: finalPo.createdAt.toISOString(),
        updatedAt: finalPo.updatedAt.toISOString(),
        procurementRequest: {
          ...finalPo.procurementRequest,
          createdAt: finalPo.procurementRequest.createdAt.toISOString(),
          updatedAt: finalPo.procurementRequest.updatedAt.toISOString(),
          neededByDate: finalPo.procurementRequest.neededByDate ? finalPo.procurementRequest.neededByDate.toISOString() : null,
        },
        vendor: {
          ...finalPo.vendor,
          createdAt: finalPo.vendor.createdAt.toISOString(),
          updatedAt: finalPo.vendor.updatedAt.toISOString(),
        },
        items: finalPo.items.map((i: any) => {
          const qtyRec = i.receipts ? i.receipts.reduce((sum: number, r: any) => sum + r.quantityReceived, 0) : 0;
          return {
            ...i,
            receipts: i.receipts ? i.receipts.map((r: any) => ({
              ...r,
              receivedDate: r.receivedDate.toISOString(),
              createdAt: r.createdAt.toISOString(),
              updatedAt: r.updatedAt.toISOString(),
            })) : [],
            quantityReceived: qtyRec,
            quantityRemaining: i.quantity - qtyRec,
            isFullyReceived: qtyRec >= i.quantity,
            createdAt: i.createdAt.toISOString(),
            updatedAt: i.updatedAt.toISOString(),
          }
        }),
        receipts: finalPo.receipts ? finalPo.receipts.map((r: any) => ({
          ...r,
          receivedDate: r.receivedDate.toISOString(),
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })) : []
      };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({ origin: clientUrl, credentials: true }),
    express.json(),
    cookieParser(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const token = req.cookies.token;
        let currentUser = null;
        if (token) {
          currentUser = verifyToken(token);
        }
        return { currentUser, req, res };
      }
    })
  );

  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  });
}

startServer().catch(console.error);
