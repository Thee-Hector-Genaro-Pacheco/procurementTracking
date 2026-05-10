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

  type ProcurementRequest {
    id: ID!
    title: String!
    description: String
    department: String!
    priority: Priority!
    status: RequestStatus!
    neededByDate: String
    createdAt: String!
  }

  input CreateProcurementRequestInput {
    title: String!
    description: String
    department: String!
    priority: Priority!
    neededByDate: String
  }

  type Query {
    healthCheck: String!
    procurementRequests: [ProcurementRequest!]!
    procurementRequest(id: ID!): ProcurementRequest
  }

  type Mutation {
    createProcurementRequest(input: CreateProcurementRequestInput!): ProcurementRequest!
    updateProcurementRequestStatus(id: ID!, status: RequestStatus!): ProcurementRequest!
  }
`;

const resolvers = {
  Query: {
    healthCheck: () => "Procurement Tracker API is running",
    procurementRequests: async () => {
      const requests = await prisma.procurementRequest.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return requests.map(req => ({
        ...req,
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
        neededByDate: req.neededByDate ? req.neededByDate.toISOString() : null,
      }));
    },

    
    procurementRequest: async (_: any, { id }: { id: string }) => {
      const req = await prisma.procurementRequest.findUnique({ where: { id } });
      if (!req) return null;
      return {
        ...req,
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
        neededByDate: req.neededByDate ? req.neededByDate.toISOString() : null,
      };
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
