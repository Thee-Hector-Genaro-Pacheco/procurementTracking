import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

// --- In-Memory Data Store for Phase 2 ---
let procurementRequests: any[] = [];

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
    procurementRequests: () => procurementRequests,
    procurementRequest: (_: any, { id }: { id: string }) => {
      return procurementRequests.find(req => req.id === id) || null;
    }
  },
  Mutation: {
    createProcurementRequest: (_: any, { input }: { input: any }) => {
      const newRequest = {
        ...input,
        id: crypto.randomUUID(),
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
      };
      procurementRequests.push(newRequest);
      console.log(`[Mutation] Created new procurement request: ${newRequest.id} - ${newRequest.title}`);
      return newRequest;
    },
    updateProcurementRequestStatus: (_: any, { id, status }: { id: string, status: string }) => {
      const index = procurementRequests.findIndex(req => req.id === id);
      if (index === -1) {
        throw new Error(`ProcurementRequest with ID ${id} not found.`);
      }
      procurementRequests[index].status = status;
      console.log(`[Mutation] Updated procurement request ${id} status to ${status}`);
      return procurementRequests[index];
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
