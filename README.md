# Procurement Tracking App

An operational dashboard for managing procurement requests, vendors, purchase orders, and receiving, built with a modern React + Node + GraphQL + Prisma stack.

## Architecture
- **Frontend**: React, TypeScript, Apollo Client, Vite, plain CSS (Foundry/Workshop-inspired design)
- **Backend**: Node.js, Express, Apollo Server, GraphQL, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT-based via HTTP-only cookies, BCrypt for password hashing

## Prerequisites
- Node.js (v18+)
- PostgreSQL database

## Environment Setup

### Server
Create `server/.env` with the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/procurement_db"
PORT=4000
CLIENT_URL="http://localhost:5173"
JWT_SECRET="replace_this_with_a_secure_secret_in_production"
JWT_EXPIRES_IN="7d"
NODE_ENV="development" # Set to 'production' for deployments
```

### Client
Create `client/.env` with the following variable:
```env
VITE_GRAPHQL_URL="http://localhost:4000/graphql"
```

## Local Development

1. **Install dependencies:**
   Navigate into both directories to install dependencies.
   ```bash
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

2. **Initialize Database:**
   ```bash
   cd server
   npm run prisma:migrate
   npm run prisma:seed
   ```

3. **Run Development Servers:**
   From the root of the repository, you can start both servers:
   ```bash
   npm run dev
   ```
   Or run them individually from their respective directories (`npm run dev`).

## Demo Accounts
The `npm run prisma:seed` command populates the database with demo users. All accounts use the password `DemoPass123!`.
- **Admin**: jordan.reyes@example.com
- **Approver**: morgan.blake@example.com
- **Buyer**: taylor.chen@example.com
- **Receiver**: riley.brooks@example.com
- **Requester**: casey.morgan@example.com
- **Admin**: hector@example.com

## Deployment Notes

### Frontend Deployment
The client is a standard Vite React application. It can be hosted on static platforms like **Vercel**, **Netlify**, or **Cloudflare Pages**.
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: `VITE_GRAPHQL_URL` (Set to your production backend URL)

### Backend Deployment
The server is an Express Node.js application. It requires a Node.js runtime and can be hosted on platforms like **Render**, **Railway**, or **Heroku**.
- Build Command: `npm run build`
- Start Command: `npm run start` (which runs `node dist/src/index.js`)
- Environment Variables: All variables listed in the server `.env.example`, including setting `NODE_ENV=production`.
  *(Setting NODE_ENV to production automatically enforces strict secure cookie policies `sameSite="none"` and `secure=true` for cross-origin authentication).*

### Database
A managed PostgreSQL instance is required. **Neon**, **Supabase**, or **Render PostgreSQL** are excellent choices.

### Note on Palantir Foundry
This application uses a Node/Express backend and PostgreSQL database. While its frontend aesthetic mimics Palantir Foundry/Workshop, deploying it *inside* a Palantir Foundry instance typically requires utilizing Foundry's native Object System (OSDK) and Workshop tools, rather than a standalone PostgreSQL/Node stack. For standard cloud deployments, follow the Vercel/Render architecture described above.
