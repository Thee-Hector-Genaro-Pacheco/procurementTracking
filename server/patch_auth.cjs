const fs = require('fs');

let content = fs.readFileSync('src/index.ts', 'utf8');

// 1. Imports
content = content.replace("import cors from 'cors';", "import cors from 'cors';\nimport cookieParser from 'cookie-parser';\nimport { comparePassword, createToken, verifyToken, requireAuth, requireRole } from './auth';");

// 2. TypeDefs
content = content.replace("type Query {", `type AuthPayload {
    user: User!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: User`);
    
content = content.replace("type Mutation {", `type Mutation {
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!`);

// 3. Resolvers - Query
content = content.replace("healthCheck: () => \"Procurement Tracker API is running\",", `healthCheck: () => "Procurement Tracker API is running",
    me: async (_: any, __: any, context: any) => {
      if (!context.currentUser) return null;
      const u = await prisma.user.findUnique({ where: { id: context.currentUser.userId } });
      if (!u) return null;
      return { ...u, createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() };
    },`);

// 4. Resolvers - Mutation (Auth)
content = content.replace("createUser: async (_: any, { input }: { input: any }) => {", `login: async (_: any, { input }: { input: any }, context: any) => {
      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (!user || !user.passwordHash) {
        throw new Error("Invalid email or password");
      }
      
      const valid = await comparePassword(input.password, user.passwordHash);
      if (!valid) {
        throw new Error("Invalid email or password");
      }

      const token = createToken({ userId: user.id, role: user.role });
      
      context.res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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
      requireRole(context.currentUser, ['ADMIN']);`);

// 5. Add requireAuth / requireRole to mutations
content = content.replace("reviewProcurementRequest: async (_: any, { input }: { input: any }) => {", `reviewProcurementRequest: async (_: any, { input }: { input: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'APPROVER']);`);

content = content.replace("createProcurementRequest: async (_: any, { input }: { input: any }) => {", `createProcurementRequest: async (_: any, { input }: { input: any }, context: any) => {
      requireAuth(context.currentUser);`);
      
content = content.replace("updateProcurementRequestStatus: async (_: any, { id, status }: { id: string, status: any }) => {", `updateProcurementRequestStatus: async (_: any, { id, status }: { id: string, status: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'APPROVER']);`);

content = content.replace("createVendor: async (_: any, { input }: { input: any }) => {", `createVendor: async (_: any, { input }: { input: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'BUYER']);`);
      
content = content.replace("createRequestItem: async (_: any, { input }: { input: any }) => {", `createRequestItem: async (_: any, { input }: { input: any }, context: any) => {
      requireAuth(context.currentUser);`);
      
content = content.replace("createPurchaseOrder: async (_: any, { input }: { input: any }) => {", `createPurchaseOrder: async (_: any, { input }: { input: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'BUYER']);`);
      
content = content.replace("updatePurchaseOrderStatus: async (_: any, { input }: { input: any }) => {", `updatePurchaseOrderStatus: async (_: any, { input }: { input: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'BUYER']);`);
      
content = content.replace("receivePurchaseOrderItem: async (_: any, { input }: { input: any }) => {", `receivePurchaseOrderItem: async (_: any, { input }: { input: any }, context: any) => {
      requireRole(context.currentUser, ['ADMIN', 'RECEIVER']);`);

// 6. Update Express middleware config
content = content.replace("cors<cors.CorsRequest>({ origin: clientUrl }),", "cors<cors.CorsRequest>({ origin: clientUrl, credentials: true }),");
content = content.replace("express.json(),", "express.json(),\n    cookieParser(),");

content = content.replace("expressMiddleware(server)", `expressMiddleware(server, {
      context: async ({ req, res }) => {
        const token = req.cookies.token;
        let currentUser = null;
        if (token) {
          currentUser = verifyToken(token);
        }
        return { currentUser, req, res };
      }
    })`);

// 7. Fix requestedById logic inside createProcurementRequest
// since currentUser is now from context, not passed in the input (though we can fall back to input if we want)
content = content.replace("requestedById: input.requestedById || null", "requestedById: context.currentUser.userId");

fs.writeFileSync('src/index.ts', content);
