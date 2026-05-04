# Procurement Tracking

A full-stack application built with React, Vite, Node.js, Express, Apollo GraphQL, and Prisma.

## Setup

1. **Install dependencies:**
   From the root, navigate to both the `client` and `server` directories and run `npm install`:
   ```bash
   cd client
   npm install
   
   cd ../server
   npm install
   ```

2. **Environment Variables:**
   In the `server` directory, copy `.env.example` to `.env`:
   ```bash
   cd server
   cp .env.example .env
   ```
   Update the `DATABASE_URL` if necessary.

3. **Database Setup:**
   *(Note: Migrations have not been run yet in Phase 1.)*

## Running the Application

**Run the Server:**
```bash
cd server
npm run dev
```
The server will start on `http://localhost:4000/graphql`.

**Run the Client:**
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`.

## Testing

You can visit `http://localhost:4000/graphql` to run the following test query:
```graphql
query {
  healthCheck
}
```
