import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import prisma from './prisma.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const typeDefs = `#graphql
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
    createdAt: String!
    updatedAt: String!
  }

  input CreateProcurementRequestInput {
    title: String!
    description: String
    department: String!
    priority: Priority!
    neededByDate: String
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

  type Query {
    healthCheck: String!
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
    procurementRequests: async () => {
      const requests = await prisma.procurementRequest.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' }
      });
      return requests.map(req => ({
        ...req,
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
        neededByDate: req.neededByDate ? req.neededByDate.toISOString() : null,
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
        include: { items: true }
      });
      if (!req) return null;
      return {
        ...req,
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
        neededByDate: req.neededByDate ? req.neededByDate.toISOString() : null,
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
          procurementRequest: true, 
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
          procurementRequest: true, 
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
    createProcurementRequest: async (_: any, { input }: { input: any }) => {
      try {
        const newRequest = await prisma.procurementRequest.create({
          data: {
            title: input.title,
            description: input.description,
            department: input.department,
            priority: input.priority,
            neededByDate: input.neededByDate ? new Date(input.neededByDate) : null,
            status: 'SUBMITTED',
          }
        });
        console.log(`[Mutation] Created new procurement request: ${newRequest.id} - ${newRequest.title}`);
        return {
          ...newRequest,
          createdAt: newRequest.createdAt.toISOString(),
          updatedAt: newRequest.updatedAt.toISOString(),
          neededByDate: newRequest.neededByDate ? newRequest.neededByDate.toISOString() : null,
        };
      } catch (error) {
        console.error("Error creating procurement request:", error);
        throw new Error("Failed to create procurement request in database.");
      }
    },
    updateProcurementRequestStatus: async (_: any, { id, status }: { id: string, status: any }) => {
      try {
        const updatedRequest = await prisma.procurementRequest.update({
          where: { id },
          data: { status }
        });
        console.log(`[Mutation] Updated procurement request ${id} status to ${status}`);
        return {
          ...updatedRequest,
          createdAt: updatedRequest.createdAt.toISOString(),
          updatedAt: updatedRequest.updatedAt.toISOString(),
          neededByDate: updatedRequest.neededByDate ? updatedRequest.neededByDate.toISOString() : null,
        };
      } catch (error: any) {
        console.error("Error updating procurement request:", error);
        if (error.code === 'P2025') {
          throw new Error(`ProcurementRequest with ID ${id} not found.`);
        }
        throw new Error("Failed to update procurement request in database.");
      }
    },
    createVendor: async (_: any, { input }: { input: any }) => {
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
    createRequestItem: async (_: any, { input }: { input: any }) => {
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
    createPurchaseOrder: async (_: any, { input }: { input: any }) => {
      const req = await prisma.procurementRequest.findUnique({
        where: { id: input.procurementRequestId },
        include: { items: true }
      });

      if (!req) {
        throw new Error(`ProcurementRequest with ID ${input.procurementRequestId} not found.`);
      }

      if (req.items.length === 0) {
        throw new Error(`ProcurementRequest must have at least one line item to generate a Purchase Order.`);
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
            procurementRequest: true, 
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
    updatePurchaseOrderStatus: async (_: any, { input }: { input: any }) => {
      try {
        const po = await prisma.purchaseOrder.update({
          where: { id: input.id },
          data: { status: input.status },
          include: { 
            procurementRequest: true, 
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
    receivePurchaseOrderItem: async (_: any, { input }: { input: any }) => {
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
          procurementRequest: true, 
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
    cors<cors.CorsRequest>({ origin: clientUrl }),
    express.json(),
    expressMiddleware(server)
  );

  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  });
}

startServer().catch(console.error);
